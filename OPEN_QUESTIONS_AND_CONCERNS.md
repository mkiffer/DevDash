# Open Questions and Concerns

Re-audited **2026-08-26** against `main`. The previous revision of this file was written
2026-03-22 against the **App Runner + RDS + Docker Compose** stack, which no longer exists.
Every item below was re-verified against the current architecture:

```
Browser → CloudFront ─/api/v1/*─→ API Gateway (HTTP API) → Lambda (container) → Neon Postgres
                     └─/*───────→ S3 (static frontend)
```

Original item numbers are preserved as `(was #N)` so this file can be diffed against the old one.
Infrastructure history, the secrets correction, and the image-pin outage post-mortem live in
[AWS_MIGRATION_NOTES.md](AWS_MIGRATION_NOTES.md) and are not duplicated here.

---

## Fixed in this pass (2026-08-26)

### Retired Claude model — the AI chat was broken in production
`ai_service.py` pinned `claude-3-opus-20240229`, which the API now rejects:
`404 not_found_error: model: claude-3-opus-20240229`. **Every chat message was returning a 500.**
This was never in the old document.

Fixed: model is now `claude-opus-5`, the `anthropic` SDK pin moved `0.16.0` → `1.0.0`, and the
removed `temperature` parameter was dropped (it is rejected on current models). Response parsing
now selects text blocks by type instead of indexing `content[0]`, which is not necessarily a text
block once thinking is enabled. Verified end to end against the live API: 4.6s round trip.

Two things to know about the tuning in that file:
- `effort` is set to `low` and `max_tokens` to 2048 deliberately. **API Gateway HTTP APIs cap the
  integration timeout at 30 seconds**, and that ceiling cannot be raised by changing the Lambda
  timeout. Slower settings would surface to users as 504s.
- Streaming is the real fix for that constraint, but it needs SSE support through API Gateway,
  Mangum, and the frontend. Listed under **Medium** below.

### Alembic chain could not build a database *(was #34, subsumes #4)*
Worse than the old document described. The chain was unrunnable:
- `4ba4db1742f4_initial_schema.py` was `pass` in both directions — it created nothing.
- No migration anywhere created `user`, `chat_sessions`, or `chat_messages`.
- The next revision, `f87f8d7ffe4b`, ran `ALTER TABLE chat_messages ADD COLUMN user_id` against a
  table that never existed. Confirmed: `alembic upgrade head` on an empty database died with
  `UndefinedTable: relation "chat_messages" does not exist`.
- The Neon schema existed only because `Base.metadata.create_all` was run by hand during the
  migration, and that safety net is gone at runtime — `lambda_handler.py` sets `lifespan="off"`.

So there was **no path to apply a schema change to production** and no way to stand up a fresh
database.

Fixed: the eight broken revisions were replaced by one squashed baseline,
`ab8baf0c14ff_baseline_schema.py`. Verified against a scratch Postgres: `upgrade head` from empty
creates all four tables with their indexes and foreign keys, `alembic check` reports no drift from
the models, and `downgrade base` reverses cleanly. A `pg_dump` diff confirms the baseline produces
a schema **identical** to what `create_all` produced, so existing databases join the chain by
stamping, not rebuilding. The stale hardcoded URL in `alembic.ini` was blanked (`env.py` sets it
from settings).

> **⚠️ One action still outstanding:** production Neon has no `alembic_version` row. Until
> `alembic stamp ab8baf0c14ff` is run against it, `alembic upgrade head` would try to re-create
> existing tables. Run this before wiring migrations into CI.

---

## Resolved or no longer applicable

Recorded so they don't get re-raised.

| Was # | Item | Status |
|---|---|---|
| 1 | Committed secrets in `.env` | **False premise.** The only `.env*` ever committed is `backend/.env.example` (placeholders). `devdash/.env` has never been tracked and is gitignored. Full-history scans found nothing. See the correction in [AWS_MIGRATION_NOTES.md](AWS_MIGRATION_NOTES.md). Key rotation is still worth doing as hygiene — tracked there as TODO #1 — but it is not incident response. |
| 2 | Docker port mismatch (8000 vs 8080) | **Moot.** The backend is a Lambda container image: no `EXPOSE`, `CMD ["app.lambda_handler.handler"]`. CI builds `-f devdash/backend/dockerfile` explicitly. |
| 29 | Unused `axios` import in `RegisterForm` | Removed. |
| 33 | Frontend nginx config not applied | **Moot.** The frontend is S3 + CloudFront. `frontend/Dockerfile.prod` and `nginx.conf` are dead files. |
| 40 | No connection-pool configuration | **Fixed and documented.** `database/session.py` uses `NullPool` + `pool_pre_ping` — correct for Lambda against Neon's pooler. |
| 23 (part) | `print()` at `coding_problems.py:220` | **False positive.** That line is inside the generated Judge0 test-runner source string. It must stay. |
| 22 (part) | Inconsistent API layers | Partly closed: `codingProblemService` now shares `parseJsonResponse()` with `apiService`. `stackOverflowService` still uses axios, but those endpoints are unauthenticated and same-origin behind CloudFront, so there is no functional bug — demoted to style. |

---

## High

### No tests, no migrations, and no smoke check in CI *(was #3, #4, #31)*
Neither workflow runs tests, applies migrations, or verifies the deploy actually works. The concrete
argument is in the history: the Lambda sat in `State: Inactive` for roughly eight days returning 500s
on every call, and nothing noticed. A post-deploy smoke check would have caught it the same day.

These belong together because the smoke check needs something to call:
- Add a `/health` endpoint to `main.py` reporting app + database reachability.
- `deploy-backend.yml`: run `pytest` before build; `alembic upgrade head` after the Lambda update;
  `curl` the health endpoint **through CloudFront** and fail the job on non-200.
- `deploy-frontend.yml`: run `npm run test -- --run` and `npm run build`.
- Add `pull_request` triggers to both — today they only run on push to `main`, so nothing is
  checked before merge.

### No rate limiting or AI cost controls *(was #8, #39)*
Nothing rate-limits anything. Two specific exposures:
- `POST /coding/problems/{slug}/submit` is **unauthenticated** and spends the account's Judge0 quota
  on every call. See the Q2 decision below — the agreed fix is an IP-based rate limit, not auth.
- The chat endpoint is behind auth but has no per-user or per-session token budget.

### Internal exception details returned to clients *(was #6)*
`str(e)` is still returned in every `chat.py` handler, at `coding_problems.py:172`, and at
`stack_overflow.py:57-70`. Should be a generic message to the client plus `logger.exception`
server-side. Worth doing together with the `print()` cleanup below, since both need a logging setup.

### No password or email validation on registration *(was #11)*
`UserCreate` takes bare `str` for email and password — no format check, no length floor.
Note the fix needs `email-validator` added to `requirements.txt` before `EmailStr` will work.

---

## Medium

### CSRF *(was #9)*
Cheaper to close now than when first written. The frontend and API are same-origin behind CloudFront
(`VITE_API_BASE_URL=/api/v1`), so `samesite="none"` in `auth.py` is no longer necessary. Switching to
`lax` closes most of the gap in one line.

### Chat has no streaming
Not in the old document. Non-streaming responses are structurally capped by API Gateway's 30s
integration timeout, which is why `ai_service.py` runs at `effort: "low"`. Streaming would remove the
ceiling and improve perceived latency, at the cost of SSE plumbing through API Gateway, Mangum, and
the frontend.

### Overly permissive CORS *(was #7)*
Origins are env-driven, but `allow_methods=["*"]` and `allow_headers=["*"]` remain in `main.py`.

### `dangerouslySetInnerHTML` in ChallengeDetails *(was #5)*
Real XSS risk is **low** — descriptions are admin-seeded by `scripts/seed_problems.py`, not user
input. But it is also a **rendering bug**: those descriptions are Markdown being injected as raw HTML.
Fix both by reusing the existing `components/shared/MarkdownRenderer.tsx`, the same component
`MessageList` already uses.

### `sanititize_user_code` is a no-op
Not in the old document. `coding_problems.py:175-177` does
`code.replace('"""', '\"\"\"')` — in Python `\"` *is* `"`, so both replacements return the string
unchanged. User code is interpolated into an f-string template, so a submission containing `"""`
breaks the test runner. Judge0 sandboxes execution, so this is a correctness bug and fake
reassurance, not host RCE. (The name is also misspelled — was #19.)

### No token refresh *(was #12)*
30-minute expiry, and `apiService.ts` never intercepts a 401. Users are dropped to the login screen
mid-session with no recovery. See Q3.

### Backend hygiene pass *(was #23, #24, #25)*
All still present, and best done as one change since they overlap:
- `print()` in `auth.py:74,107` and `stack_overflow.py:66-67`; no logging configuration anywhere.
- Bare `except Exception` throughout the chat routes and `coding_problems.py`.
- `datetime.utcnow()` in `auth/utils.py`, `models/chat.py`, `routes/chat.py:211` — deprecated in
  3.12, and the test suite already emits 37 warnings about it.
- **Also:** `models/user.py:14` uses `datetime.datetime.now` — naive **local** time, inconsistent
  with the `utcnow` used everywhere else. Not in the old document.

### Dead OAuth2 schemes *(was #13)*
`auth/utils.py:18` and `dependencies.py:11-13` both define an `OAuth2PasswordBearer`, and **neither
is used** — `get_current_user` reads the cookie directly. The fix is deletion, not consolidation.

### Nullable `user_id` foreign keys *(was #10)*
Every write path sets `user_id`, so the columns can be tightened. This needed the Alembic fix first;
it is now unblocked.

### No React error boundaries *(was #36)*
One component crash still takes down the whole app.

---

## Low

Confirmed still present, none of them urgent.

- **(was #15)** `RegisterForm.tsx:30` — `setIsLoading(true)` is commented out, so the button never
  shows a loading state while `finally` still clears it.
- **(was #16)** `LoginForm.tsx:73-75` — a second `type="submit"` button labelled "Register" inside
  the login form. It submits the login form.
- **(was #17)** `AIChat/index.tsx:127` — optimistic message IDs from `Math.random()`.
- **(was #18)** `isLangaugeSupported` misspelled in `CodingChallenges/index.tsx` and
  `SolutionEditor.tsx`.
- **(was #20)** `SearchBar.tsx:43` — `p-[1-px]` is not valid Tailwind.
- **(was #21)** `StackOverflowSearch/index.tsx:118` — empty `useEffect`.
- **(was #26)** `types/index.ts` — `APIResponse<T>` and `ChatInputProps` each defined twice.
- **(was #27)** Scattered `any` types.
- **(was #28)** `apiConfig.ts:6` logs the API base URL on every import.
- **(was #32)** No error tracking. Lambda gives CloudWatch logs by default, but nothing is
  structured and nothing alerts.
- **(was #35)** ~~Hardcoded DB URL in `alembic.ini`~~ — fixed in this pass.
- **(was #37)** Almost no `aria-*` attributes; no keyboard navigation for custom components.
- **(was #38)** No `AbortController` in `apiService.ts`.
- **Dead files from the App Runner era:** `backend/Dockerfile.prod`, `frontend/Dockerfile.prod`,
  `frontend/nginx.conf`, `docker-compose.prod.yml` (0 bytes, was #30), and the empty
  `app/models/stack_overflow.py`. Delete rather than fill.
- **`test.db`** (0 bytes) is tracked in git at the repo root.
- **Stale CI secret name:** `deploy-frontend.yml` reads `APP_RUNNER_BACKEND_URL_WITH_API_PREFIX`,
  which now holds `/api/v1`. Misleading post-migration.

---

## Questions

### Answered
- **Q1 — Is the port 8000 or 8080? Which Dockerfile is canonical?**
  Neither. The backend is a Lambda handler with no listening port. `backend/dockerfile` (lowercase)
  is canonical; `Dockerfile.prod` is dead.
- **Q2 — Should coding problem endpoints require authentication?**
  **No — they stay public.** Guest mode (`App.tsx`, `isGuest`) is a deliberate feature and browsing
  challenges is part of it. The Judge0 quota gets an IP-based rate limit on `/submit` instead.
  Tracked under **High** above.
- **Q4 — Docker or direct for local dev?**
  Direct: `uvicorn app.main:app --reload --port 8080` and `npm run dev`. Docker is only a build
  artifact for Lambda.
- **Q5 — Are the empty migration and docker-compose files placeholders?**
  No. Leftovers. The migration is fixed; the compose file should be deleted.
- **Q6 — Is there a budget or rate limit strategy for Anthropic usage?**
  There is none today. `effort: "low"` and `max_tokens: 2048` bound the cost *per call*, but nothing
  bounds calls per user. Tracked under **High**.

### Still open
- **Q3 — Is "re-login on expiry" intentional, or should there be token refresh?**
  A 30-minute expiry with no refresh and no 401 interception is a rough experience. Needs a
  decision before anyone builds it.
- **Q7 — Should `devdash.online` be repointed at CloudFront, or is the parked domain deliberate?**
  Carried over from [AWS_MIGRATION_NOTES.md](AWS_MIGRATION_NOTES.md) TODO #6 — still unresolved.
