# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevDash is a full-stack developer dashboard with AI chat (Anthropic Claude), coding challenges (Judge0 execution), and Stack Overflow search. React/TypeScript frontend + FastAPI/Python backend, deployed to AWS (S3+CloudFront frontend; API Gateway + Lambda container image backend, with Neon Postgres).

## Monorepo Structure

All application code lives under `devdash/`:
- `devdash/frontend/` — React 18 + TypeScript + Vite + Tailwind + shadcn/ui
- `devdash/backend/` — FastAPI + SQLAlchemy + Alembic + PostgreSQL

## Common Commands

### Frontend (`cd devdash/frontend`)
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (port 5173)
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint
npm run test             # Vitest (watch mode)
npm run test -- --run    # Vitest single run
npm run coverage         # Vitest with coverage
```

### Backend (`cd devdash/backend`)
```bash
pip install -r requirements.txt    # Install dependencies
uvicorn app.main:app --reload --port 8080   # Start dev server
pytest                             # Run all tests
pytest app/tests/test_chat.py      # Run a single test file
pytest -k "test_name"              # Run a single test by name
```

### Database Migrations (`cd devdash/backend`)
```bash
alembic revision --autogenerate -m "description"   # Create migration
alembic upgrade head                                # Apply migrations
```

## Architecture

### Authentication
JWT tokens stored in HttpOnly cookies. Backend validates via `get_current_user()` dependency (`app/dependencies.py`). Frontend's `AuthContext` manages auth state; all API calls use `credentials: 'include'` via the `apiRequest()` wrapper in `services/apiService.ts`.

### Frontend API Layer
Most backend calls go through `apiRequest()` in `src/services/apiService.ts`, which handles credentials and error responses. `codingProblemService.ts` is the exception: it calls `fetch` directly, but shares `parseJsonResponse()` from `apiService.ts` so it gets the same status/content-type handling. API base URL is set via `VITE_API_BASE_URL` env var (defaults to `http://localhost:8080/api/v1`).

### Backend API Routes
All routes are prefixed with `/api/v1/`:
- `/auth/` — register, token, logout, me
- `/chat/` — session CRUD + message handling (calls AIService for assistant responses)
- `/coding/` — problem retrieval + Judge0 code submission
- `/stackoverflow/` — Stack Exchange API proxy

### Database
PostgreSQL in production, SQLite in-memory for tests. Models: User, ChatSession, ChatMessage, CodingProblem. Test fixtures in `app/tests/conftest.py` override the `get_db` dependency.

### External APIs
- **Anthropic** (Claude): AI chat via `app/services/ai_service.py`
- **Judge0**: Code execution for coding challenges
- **Stack Exchange**: SO search

## Environment
Backend env vars are in `devdash/.env` (DATABASE_URL, ANTHROPIC_API_KEY, JUDGE0_API_KEY, STACK_EXCHANGE_API_KEY). Frontend uses `VITE_API_BASE_URL`.

## Frontend Component Conventions
- UI primitives in `src/components/ui/` (shadcn/ui)
- Feature components in `src/components/dashboard/{AIChat,CodingChallenges,StackOverflowSearch}/`
- Path alias: `@/*` maps to `src/*`
- Dark mode supported via Tailwind class strategy
