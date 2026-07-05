# Open Questions and Concerns

Analysis of the DevDash codebase as of 2026-03-22.

---

## Critical

### 1. Committed Secrets in `.env`
Real API keys (Anthropic, Judge0, Stack Exchange) and database passwords are tracked in git at `devdash/.env`. Even though `.gitignore` lists `.env`, the file is already committed and in git history. **All credentials need immediate rotation.**

### 2. Port Mismatch Between Docker Configs
- `devdash/backend/dockerfile` exposes port 8080
- `devdash/backend/Dockerfile.prod` exposes port 8000
- `.env` and `nginx.conf` expect port 8080
- CI/CD references `Dockerfile` (capitalized, which may not match the lowercase `dockerfile`)

This will cause deployment failures. Needs standardization.

### 3. No Tests in CI/CD
Neither `deploy-backend.yml` nor `deploy-frontend.yml` runs tests before deploying. Broken code can reach production unchecked.

### 4. No Database Migrations in CI/CD
Neither workflow runs `alembic upgrade head`. Schema changes won't be applied on deployment.

---

## Security

### 5. XSS in ChallengeDetails
`ChallengeDetails.tsx:31` uses `dangerouslySetInnerHTML` without sanitization. The SO search components correctly use DOMPurify — this should too.

### 6. Internal Exception Details Leaked to Clients
Multiple backend routes return `str(e)` in HTTP error responses (e.g., `chat.py:48-53`, `coding_problems.py:170`, `stack_overflow.py:59-71`). Should return generic messages and log details server-side.

### 7. Overly Permissive CORS
`main.py:27-33` allows `methods=["*"]` and `headers=["*"]`. Should be restricted to actually used methods/headers.

### 8. No Rate Limiting
No rate limiting anywhere in the backend. AI chat endpoint is especially vulnerable to abuse and cost runaway.

### 9. No CSRF Protection
Cookie-based JWT auth with `samesite="none"` in production but no CSRF token validation.

### 10. Nullable `user_id` Foreign Keys
`ChatSession.user_id` and `ChatMessage.user_id` are `nullable=True` (`models/chat.py:12,29`). Allows orphaned records and bypasses data integrity.

---

## Authentication & Authorization

### 11. No Password or Email Validation on Registration
`auth.py` accepts any string for password and email — no minimum length, complexity, or format check. Should use Pydantic's `EmailStr` and `Field(min_length=...)`.

### 12. No Token Refresh Mechanism
Frontend has no refresh token logic. When JWT expires, users are silently logged out with no recovery. `apiService.ts` doesn't intercept 401s to attempt re-auth.

### 13. Duplicate OAuth2 Schemes
Two `OAuth2PasswordBearer` instances with different token URLs exist in `auth/utils.py:18` and `dependencies.py:11-13`.

### 14. Coding Problems Endpoints Are Unauthenticated
All routes in `coding_problems.py` are public — no `get_current_user` dependency.

---

## Frontend Bugs

### 15. RegisterForm Loading State Never Activates
`RegisterForm.tsx:31` has `setIsLoading(true)` commented out, but `finally` block sets it to false. Button never shows loading state.

### 16. Duplicate "Register" Button in LoginForm
`LoginForm.tsx:73-75` has a second submit button labeled "Register" inside the login form.

### 17. Optimistic Message IDs Use `Math.random()`
`AIChat/index.tsx:127-160` generates temporary message IDs with `Math.random()`, which isn't guaranteed unique and could cause filtering issues.

### 18. Prop Typo: `isLangaugeSupported`
Misspelled in `CodingChallenges/index.tsx:168` and `SolutionEditor.tsx:15,25,72`.

### 19. Function Name Typo: `sanititize_user_code`
`coding_problems.py:175` — should be `sanitize_user_code`.

### 20. Invalid Tailwind Class
`SearchBar.tsx:43` uses `p-[1-px]` which is not valid Tailwind syntax.

### 21. Empty useEffect
`StackOverflowSearch/index.tsx:118-119` has an empty `useEffect` that does nothing.

---

## Code Quality

### 22. Three Different API Call Patterns in Frontend
- `apiRequest()` (fetch + credentials) in auth/chat services
- `axios.get()` in `stackOverflowService.ts` (missing `credentials: 'include'`, so cookies won't be sent)
- Raw `fetch()` in `codingProblemService.ts`

Should consolidate to one pattern.

### 23. `print()` Statements Instead of Logging
Backend uses `print()` in `auth.py:74,107`, `stack_overflow.py:66-67`, `coding_problems.py:220`. Only `stack_overflow.py` uses the `logging` module. No structured logging framework.

### 24. Bare `except Exception` Throughout Backend
Generic exception catching in `ai_service.py:37`, all chat routes, and `coding_problems.py:170`. Masks real errors.

### 25. Deprecated `datetime.utcnow()`
Used in `auth/utils.py:29,31`, `models/chat.py:13-14,32`, `models/user.py:14`. Deprecated in Python 3.12+; should use `datetime.now(timezone.utc)`.

### 26. Duplicate Type Definitions in Frontend
`types/index.ts` has duplicate definitions for `APIResponse<T>` and `ChatInputProps`.

### 27. Excessive `any` Types
Found in `LoginForm.tsx:33`, `CodeEditor.tsx:10`, `apiService.ts:13`, `codingProblemService.ts:11-12,23-25`, `stackOverflowService.ts:7`.

### 28. Debug `console.log` Left in Production Code
`apiConfig.ts:6` logs the API base URL on every import.

### 29. Unused Import
`RegisterForm.tsx:7` imports `axios` but uses `authService` instead.

---

## Infrastructure & Deployment

### 30. Empty `docker-compose.prod.yml`
File exists at `devdash/docker-compose.prod.yml` but is 0 bytes.

### 31. No Health Check Endpoint
No `/health` or `/ping` endpoint in the backend. No `HEALTHCHECK` in Dockerfiles. AWS App Runner uses default health checks.

### 32. No Monitoring or Error Tracking
No Sentry, CloudWatch integration, or structured logging configured for production.

### 33. Frontend Nginx Config Not Applied in Production
`Dockerfile.prod:27` has the nginx config COPY commented out. Custom caching/compression rules in `nginx.conf` aren't used.

### 34. Initial Alembic Migration Is Empty
`migrations/versions/4ba4db1742f4_initial_schema.py` has `pass` in both upgrade and downgrade.

### 35. Hardcoded DB URL in `alembic.ini`
`alembic.ini:66` has `postgresql://devdash:devdash_password@db:5432/devdash` (though `env.py` overrides it from settings).

---

## Missing Capabilities

### 36. No Error Boundaries in React
A single component crash takes down the entire app.

### 37. No Accessibility (a11y)
Almost zero `aria-*` attributes across the entire frontend. No keyboard navigation support for custom components.

### 38. No Request Cancellation
`apiService.ts` doesn't use `AbortController`. Navigating away leaves stale requests that can update unmounted components.

### 39. No AI Cost Controls
No per-user or per-session token limits on the chat endpoint. A single user can exhaust the Anthropic API budget.

### 40. No Connection Pool Configuration
`database/session.py` calls `create_engine()` without pool size, max overflow, or timeout settings.

---

## Open Questions

- **Q1:** Is the port supposed to be 8000 or 8080? Which Dockerfile is canonical?
- **Q2:** Should coding problem endpoints require authentication?
- **Q3:** Is there a plan for token refresh, or is the current "re-login on expiry" intentional?
- **Q4:** What's the intended local dev setup — Docker or running frontend/backend directly?
- **Q5:** Are the empty migration and docker-compose files placeholders for future work?
- **Q6:** Is there a budget or rate limit strategy for the Anthropic API usage?
