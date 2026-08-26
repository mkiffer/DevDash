# Open Questions and Concerns

Re-audited **2026-08-26** against `main`, then updated across two rounds of fixes the same day. The previous revision of this file was written
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

## Fixed (2026-08-26, round 2 — deploy safety)

### Backend CI, health endpoint, and deploy smoke check *(was #3, #4, #31)*
The backend deploy had no safety net at all: build, push, update the function, report success —
without a test, a migration, or any check that the result responded. That is exactly how the Lambda
sat `Inactive` for eight days.

- `GET /api/v1/health` in `app/main.py` does a real `SELECT 1` rather than returning a literal, so
  "app is down" and "app is up, database is not" are distinguishable. It stays behind the
  `X-Origin-Verify` guard, so a 200 also proves the CloudFront path — the leg that actually broke.
- `ci.yml` gained a **backend job** running on pull requests, mirroring the frontend one.
- `deploy-backend.yml` now runs `alembic upgrade head` **before** the function update, then smoke
  checks the health endpoint through CloudFront with retries, failing the job on non-2xx.

> **A trap worth recording:** the backend tests only passed locally because `python-dotenv` walks up
> and finds the gitignored `devdash/.env`. `SECRET_KEY` and `DATABASE_URL` are declared with no
> defaults, so on a clean checkout `Settings()` raises and *every test errors at collection*.
> Verified against a fresh clone. The CI job injects throwaway values; `conftest.py` overrides
> `get_db` with in-memory SQLite, so `DATABASE_URL` is never connected to — it only has to parse.

### `user_id` is now `NOT NULL` *(was #10)*
`ChatSession.user_id` and `ChatMessage.user_id` are non-nullable, via migration `dcf235f97791`.
Every write path already set them. Checked before applying: zero null rows in either table, so no
backfill was needed. This was also the first migration to run on the chain rebuilt in round 1,
which exercised autogenerate and `upgrade head` end to end.

### API Gateway throttling *(partial — was #8, #39)*
The `$default` stage of API `k6e5fg1hua` had **no throttling configured at all**. It now carries
`ThrottlingRateLimit=10`, `ThrottlingBurstLimit=20`. Only `/api/v1/*` traverses API Gateway, so the
static frontend is unaffected.

This was chosen over the usual FastAPI answer deliberately: an in-process limiter like `slowapi` is
**per-container** on Lambda, so it resets on every cold start and barely limits anything.

**What it does not do:** it is a burst and runaway backstop, not a spend cap — 10 req/s sustained is
still a large daily volume. Genuine per-user cost control over the Anthropic and Judge0 spend still
needs a database-backed budget. That remains open under **High** below.

---

## Fixed (2026-08-26, round 1)

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

### No per-user cost controls *(was #8, #39 — partially addressed)*
The API Gateway throttle above caps burst and runaway traffic globally. What it cannot do is stop one
authenticated user from steadily draining the budget:
- `POST /coding/problems/{slug}/submit` is **unauthenticated** and spends the account's Judge0 quota
  on every call. Per the Q2 decision it stays public, so the throttle is currently its only guard.
- The chat endpoint has no per-user or per-session token budget.

The remaining fix is a counter in Neon checked by a FastAPI dependency on those two endpoints.

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

### No React error boundaries *(was #36)*
One component crash still takes down the whole app.

---

## Low

Re-confirmed against `main` on 2026-08-26 — line numbers shifted by the ESLint branch and are
current. None are urgent.

- **(was #15)** `RegisterForm.tsx:30` — `setIsLoading(true)` is commented out, so the button never
  shows a loading state while `finally` still clears it.
- **(was #16)** `LoginForm.tsx:73-75` — a second `type="submit"` button labelled "Register" inside
  the login form. It submits the login form.
- **(was #17)** `AIChat/index.tsx:140` — optimistic message IDs from `Math.random()`.
- **(was #18)** `isLangaugeSupported` misspelled in `CodingChallenges/index.tsx` and
  `SolutionEditor.tsx`.
- **(was #20)** `SearchBar.tsx:36` — `p-[1-px]` is not valid Tailwind.
- **(was #21)** `StackOverflowSearch/index.tsx:107` — empty `useEffect`.
- **(was #26)** `types/index.ts` — `ChatInputProps` still defined twice (lines 49 and 60). The
  duplicate `APIResponse<T>` was removed by the ESLint branch.
- ~~**(was #27)** Scattered `any` types~~ — **resolved** by the ESLint branch; no `any` remains
  outside tests.
- **(was #28)** `apiConfig.ts:6` logs the API base URL on every import.
- **(was #32)** No error tracking. Lambda gives CloudWatch logs by default, but nothing is
  structured and nothing alerts.
- ~~**(was #35)** Hardcoded DB URL in `alembic.ini`~~ — fixed in round 1.
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
