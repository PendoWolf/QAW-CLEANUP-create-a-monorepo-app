# Crewdesk

Job management for field-service teams, as an npm-workspaces monorepo.

| Path | Package | What it is |
| --- | --- | --- |
| `apps/web/` | `@crewdesk/web` | The customer web app (Vite + React + React Router), port **5173**. Sign in, a dashboard, jobs and customers you create and edit, your profile, and **Crewdesk Copilot**, an AI chat panel backed by the API |
| `apps/admin/` | `@crewdesk/admin` | The internal admin app (Vite + React + React Router), port **5174**. Sign in, the users table and the billing form. No AI |
| `apps/api/` | `@crewdesk/api` | The Express JSON API, port **3001**: sign-in sessions, users, accounts, jobs, customers, billing, and the Copilot chat route, which calls an OpenAI model through the `openai` SDK |
| `packages/ui/` | `@crewdesk/ui` | Shared React components (buttons, cards, fields, tables, page headers) both apps import |

## Run

```bash
npm install     # installs every workspace from the root
npm run dev     # runs the API, the web app and the admin app together
npm run build   # builds both front ends and type-checks the API
```

Sign in to either app with `dana@acme-plumbing.test` / `crewdesk` (an owner of the account
"Acme Plumbing"), or `sam@northwind-hvac.test` / `crewdesk`.

## Configuration

| Var | Where | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `apps/web`, `apps/admin` builds | API base URL (defaults to `http://localhost:3001`) |
| `PORT` | `apps/api` | API port (default 3001) |
| `CORS_ORIGINS` | `apps/api` | Comma-separated allowed origins (default: both local apps) |
| `OPENAI_API_KEY` | `apps/api` | Key for the Copilot's model. Without it the chat route answers 503 |
| `OPENAI_MODEL` | `apps/api` | The Copilot's model (default `gpt-4o-mini`) |
