# EES Connect

Community platform for the Earth & Environmental Sciences department, IISER Bhopal —
students and alumni connecting over doubts, opportunities, resources and mentorship.

Stack: **Next.js 16 + Tailwind + Supabase** (auth, Postgres, row-level security).

## Setup (first time, ~15 min)

1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier works).
2. **Run the schema**: open your project → SQL Editor, paste everything from
   `supabase/migrations/0001_init.sql`, and run it. This creates the tables, triggers
   and all security policies.
3. **Get your keys**: Project Settings → API. Copy the URL and anon key.
4. **Configure the app**:
   ```bash
   cp .env.example .env.local   # fill in the two NEXT_PUBLIC_ values
   npm install
   npm run dev                  # http://localhost:3000
   ```
5. **Allow your email redirect** in Supabase dashboard: Auth → URL Configuration →
   set Site URL to `http://localhost:3000` (or your deployed URL).
6. **Make an admin** — in the Supabase SQL editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL@iiserb.ac.in';
   ```
   Sign up with that email first, then promote it.

## How it works

- Landing page at `/` — signed-in members are sent straight to the feed.
- **Students** sign up at `/signup/student` with `@iiserb.ac.in` email → instantly verified.
- **Alumni** sign up at `/signup/alumni` with any email → land in "pending approval",
  invisible until an admin approves them at `/admin`.
- Log in at `/login` (picks a door) or go straight to `/login/student` / `/login/alumni`.
- All access rules are enforced by **database policies** (`supabase/migrations/0001_init.sql`),
  not just the UI — unverified users cannot read or write anything, even via the API.
- Feed tabs: Doubts · Opportunities · Resources · Discussions (all one `posts` table).
- Directory filters by name/field/organisation, batch year, and mentors-only.

## Deploy

Push to GitHub → import into Vercel → add the three env vars → deploy.
Then update Supabase's Site URL and its redirect allowlist to the production URL.

## Phase 2 (shipped)

- **Mentorship requests** — students send a request (with message) from a mentor's
  profile; the mentor accepts/declines from their own profile. One open request
  per student–mentor pair. Notifications by email.
- **Opportunity auto-expiry** — opportunities expire 3 months after posting;
  expired ones drop out of the feed and show "This opportunity has closed."
- **Search** — the feed's search box matches titles and bodies; `#tag` queries
  match exact tags (`Ω`-free: input is sanitized server-side).
- **Reports & moderation** — members can report any post; `/admin` shows the
  queue with Delete post / Dismiss actions.
- **Email notifications** — via Resend. Set `RESEND_API_KEY` (+ optional
  `EMAIL_FROM`) in `.env.local`; without a key the app logs and skips mail.

## Phase 3 (shipped)

- **Direct messages** — thread pages at `/messages?with=<id>`, delivered live via
  Supabase Realtime (`postgres_changes` + RLS). Navbar badge tracks unread;
  opening a thread marks it read. "Message" button on every profile.
- **Tag pages** — `/tags` lists every tag with counts; `/tags/<tag>` opens that
  tag's posts.
- **Image posts** — the compose form accepts one image (≤2 MB, any format),
  stored in the public `post-images` bucket and rendered on cards and posts.

## Security posture notes

- `npm run security` — attacker-perspective probe suite (RLS, escalation,
  storage MIME whitelist, upload-path lockdown, report/mentorship uniqueness).
  Exit 1 on any violation; safe to run any time.
- The auth token lives in a JS-readable cookie (`document.cookie`) — required
  by Supabase Realtime channel authorization. It is scoped per-origin, rotates
  automatically, and storage/RLS won't accept requests forged with a stolen
  token for *other* members' data. Do not enable generic ` cors: *` reflections
  on hosted Supabase.
- CSP: `X-Frame-Options`/`nosniff`/`Referrer-Policy` ship always; the strict
  `Content-Security-Policy` is built in `next.config.ts` from
  `NEXT_PUBLIC_SUPABASE_URL`. In dev it allows `unsafe-inline`/`unsafe-eval`
  (Next HMR); when you finalize the production domain, tighten `script-src`
  and re-run `npm run security`.
- Rate limiting on `/auth` endpoints comes from the Supabase platform on
  hosted projects; for a local stack it isn't present.

## Backups

```bash
npm run backup                 # timestamped dump -> backups/ (keeps last 20)
npm run restore -- backups/ees-<stamp>.dump   # overwrite-current restore
```

Backups contain member emails (from `auth.users`) — `backups/` is gitignored;
**never commit them.** For off-disk safety, copy the newest `.dump` file to
Google Drive / USB weekly. Cron example (`crontab -e`):

```
30 3 * * * cd /home/chirayu/ees-connect && npm run backup >> backups/cron.log 2>&1
```

Hosted Supabase projects keep automatic platform backups (7-day free tier,
PITR higher tiers) — until you deploy, this script is the crash safety net.

**After deploying to hosted Supabase**, add one layer you own (free-tier
restore options are limited, and dumps you keep are always restorable):

```bash
npx supabase link --project-ref <ref>          # once
npm run backup:cloud                           # writes backups/hosted-*.sql
```

Weekly cron is enough:

```
0 4 * * 1 cd /home/chirayu/ees-connect && npm run backup:cloud >> backups/cron.log 2>&1
```

Notes: schema comes from the migrations in this repo (dump is data-only);
member uploads are `storage` files, so back up big ones separately if
members start attaching images. Never commit dumps — member emails live in
`auth.users`.

## Local dev notes

- **Data persistence:** `npx supabase stop --no-backup` discards the database
  volume (accounts/posts wiped). Use plain `npx supabase stop` when you want
  members and posts to survive a restart.
- The realtime container caches its table publication at startup — if you
  `db reset` or apply the Phase 3 migration while the stack is running, do a
  one-time `npx supabase stop && npx supabase start` (or
  `docker restart supabase_realtime_<project>`) so DMs stream live. Hosted
  projects pick this up automatically from the SQL editor.

## Phase 4 backlog (nice-to-haves)

- Message inbox pagination / delete messages
- Multiple images per post, alt text required
- Tag pages with filters combined (type + tag)
