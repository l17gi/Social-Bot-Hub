# المطور🌍🥇 — منصة أتمتة التواصل الاجتماعي

منصة متكاملة لإدارة وأتمتة حسابات التواصل الاجتماعي (تيليغرام، فيسبوك، إنستغرام) مدعومة بالذكاء الاصطناعي.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/motawir run dev` — run the frontend (port 21313)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT secret

## Admin Credentials

- Email: `admin@motawir.com`
- Password: `Admin@Motawir2025!`
- Role: admin (full access to /admin panel)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + Framer Motion (RTL Arabic)
- API: Express 5 + JWT auth (bcryptjs + jsonwebtoken)
- DB: PostgreSQL + Drizzle ORM
- AI: Anthropic Claude (claude-opus-4-5)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB schema (users, social_accounts, automations, conversations, ai_messages, agent_apps, activity)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware
- `artifacts/motawir/src/pages/` — Frontend pages (login, dashboard, social-accounts, automations, ai, agent-builder, admin, profile)
- `artifacts/motawir/src/lib/auth.tsx` — Auth context provider

## Architecture decisions

- JWT tokens stored in localStorage under `motawir_token`, set via `setAuthTokenGetter` in main.tsx
- Max 3 accounts per platform per user enforced server-side
- AI chat uses Anthropic Claude claude-opus-4-5 with full conversation history
- RTL Arabic UI throughout, dark cyberpunk theme
- Telegram OTP flow uses placeholder (real MTProto integration requires Telegram API credentials)

## Product

- Multi-user social media automation platform
- Each user: up to 3 Telegram + 3 Facebook + 3 Instagram accounts
- Automation engine: join groups, send messages, scrape members
- AI assistant (Claude) with file/image upload support
- Agent Builder: create custom AI agents with tools
- Admin panel: full user & platform management

## User preferences

- UI fully in Arabic (RTL)
- Dark cyberpunk theme (deep navy + electric blue + purple)
- Do not use emojis except the brand name "المطور🌍🥇"

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing openapi.yaml
- Run `pnpm --filter @workspace/db run push` after changing DB schema
- Telegram real OTP requires Telegram API credentials (api_id, api_hash) and MTProto library
- Admin role must be set manually in DB (UPDATE users SET role='admin' WHERE email=...)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
