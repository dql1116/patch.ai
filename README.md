# patch.ai

AI-powered team matching for UCDavis Prodcon 2026. Users onboard with role, experience, interests, and work style, then get matched to projects with explainable recommendations and team assembly.

## Stack
- Next.js (App Router)
- Supabase (Auth + Postgres)
- Gemini API (AI recommendations + match reasons)
- TailwindCSS + Radix UI

## Features
- Email/password auth (OAuth ready)
- Onboarding profile
- AI project recommendations
- AI match reasoning
- Team creation + completion tracking

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Create `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

### 3) Supabase schema + seed
In Supabase SQL editor, run:
- `supabase/schema.sql`
- `supabase/seed.sql`

### 4) Run the app
```bash
npm run dev
```

## Supabase Auth
- Email/password is enabled by default.
- OAuth providers can be added later in Supabase Auth settings.

## AI Usage (Gemini)
- Recommendations: `POST /api/recommend`
- Match reasoning: `POST /api/match`

Both endpoints fall back to heuristic scoring if Gemini is unavailable or rate-limited.

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes
- Teams are stored in Supabase and marked completed when a project is finished.
- Completing a team deletes the associated project from `projects` (keeps history in `teams`).

## Troubleshooting
- If AI falls back, check API quotas in Google AI Studio.
- If you see auth errors, ensure Supabase keys are correct and server restarted.
