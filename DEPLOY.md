# Deploy checklist — GitHub → Supabase → Vercel (all free tiers)

## 1. GitHub — push the code

```bash
# repo created empty at github.com first, then:
git remote add origin https://github.com/<handle>/ees-connect.git
git push -u origin main
```

## 2. Supabase — free project + schema

1. https://supabase.com → New project → region Mumbai → save the DB password
2. Copy the project ref (the `xyz` in `xyz.supabase.co`)
3. Apply migrations (from this repo, any of these):

```bash
# A) CLI, non-interactive:
npx -y supabase@latest db push \
  --db-url "postgresql://postgres:<DB-PASSWORD>@db.<ref>.supabase.co:5432/postgres"

# B) or Studio → SQL Editor → paste+run each file in order:
#    supabase/migrations/0001_init.sql … 0008_mentorship_targets.sql
```

Migrations create tables + RLS + triggers + the `post-images` bucket + the nav RPC. Hosted projects enable Realtime for publication tables automatically.

## 3. Vercel — deploy

1. https://vercel.com → Add New → Project → import the GitHub repo
2. Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = <anon key — Project Settings → API>
NEXT_PUBLIC_SITE_URL = https://<app-name>.vercel.app
RESEND_API_KEY = <optional: live notification emails>
EMAIL_FROM = EES Connect <onboarding@resend.dev>
```

3. Deploy (CSP and realtime `wss://` derive from the env URL automatically)

## 4. Wiring

- Supabase → Auth → URL Configuration:
  - Site URL: `https://<app-name>.vercel.app`
  - Redirect URL: `https://<app-name>.vercel.app/auth/callback`
- Sign up once with your admin email, then approve/promote:

```sql
update public.profiles
set role = 'admin', verified = true
where email = '<your-admin-email>';
```

## 5. Verify

```bash
npm run security            # expects probes; point BASE at env vars — see note
npx supabase db dump ...    # backup:cloud once, then weekly cron
```

Sign up → confirm email → onboard → post → DM → notification — in that order.
Storage uploads land in `post-images` (2 MB cap, MIME whitelist enforced).

## Free-tier notes

- Supabase pauses after 1 week idle; opening the dashboard wakes it
- Auth email limit on the shared sender: ~3–4/hour on the free tier
- Vercel Hobby is for non-commercial use — fine for a department club
