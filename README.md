# SkillSphere — LoopVerse Submission

[Last code edit @ 9:04PM]

Made by Azeem Sarwar for LoopVerse

Website Link: https://skillsphere-education.vercel.app

Demo Video Link: Processing...

PDF File Link: [Open](https://github.com/azeem-io/skillsphere/blob/main/SkillSphere%20-%20Azeem%20Sarwar.pdf)

## Tech
- **SvelteKit v4 + TS**, TailwindCSS, shadcn-svelte (Bits UI)
- **Supabase**: Auth, Postgres, Realtime, Storage
- **OpenAI**: gpt-4o-mini (session summary on end)

## Quick Start (local)
```bash
pnpm i
# or npm i / bun i
```
Create `.env`:
```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=sk-...
```
Run:
```bash
pnpm dev
# http://localhost:5173
```

## Folders (skim)
```
src/
  lib/components/ui/       # shadcn/Bits UI
  lib/supabase/client.ts   # browser client
  routes/
    auth/                  # login/register/logout
    learner/dashboard/
    mentor/dashboard/      # availability, live/upcoming, feedback
    mentor/apply/
    mentors/[id]/          # profile + booking cards
    sessions/[id]/         # chat + end session + feedback
    admin/                 # mentor approvals
    api/upload/+server.ts  # image -> Storage
```
