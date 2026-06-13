# Reel To You — "Movie Quote Time Capsule"
## Project Context (give this file to your AI CLI)

---

## 1. Concept

A mobile-first web app where anyone can send a movie quote, addressed to a
name, as a permanent public message. No accounts, no login.

**Flow:**
1. Search for a movie (TMDb)
2. Pick a curated quote, or write a custom one if the movie isn't in the
   curated set
3. (Optional) attach a short clip via KLIPY
4. Write a short dedication
5. Type a recipient's name
6. Submit — the entry is stored permanently and the sender gets a direct
   share link

Separately, anyone can type a name into a search box and see every entry
ever addressed to that name, newest first, infinite scroll — like a public
guestbook indexed by name. This is the core inspiration (a "time capsule"
model similar to sendthesong.xyz, where you select a song and write a message for someone, and search by name reveals messages written with that person in mind).

**This is a permanent, publicly searchable system — there is no
self-destruct.** That has real implications for moderation (see §7).

---

## 2. Stack

| Layer | Choice |
|---|---|
| Frontend/Backend | Next.js 15, App Router, TypeScript, Tailwind CSS |
| Database | Supabase (Postgres) — primary, persistent store |
| Movie search/posters | TMDb API |
| Clips | KLIPY Clips API |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` |
| Curated quotes | Static `data/quotes.json`, bundled with the app |
| Profanity check | `obscenity` (TypeScript-first, actively maintained) — used server-side on dedication, custom quote text, and recipient name at submit time |
| Slugs | `nanoid(8)` |
| Hosting | Vercel |

**Do not introduce:** user accounts/auth, a second database, OpenSubtitles,
email/Resend, cron jobs, or any third-party "movie quotes" API as a runtime
dependency (curated quotes are static and hand-picked — see the existing
`data/quotes.json` from the previous build, which can be reused as-is).

---

## 3. Database schema (Supabase / Postgres)

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  recipient_name text not null,          -- as typed, for display
  recipient_name_key text not null,      -- lowercased + trimmed, for search
  movie_title text not null,
  tmdb_id integer,
  quote_text text not null,
  character_name text,
  dedication text,
  gif_url text,
  poster_url text,
  created_at timestamptz default now(),
  is_hidden boolean default false,
  report_count integer default 0
);

create index idx_entries_recipient on entries (recipient_name_key, created_at desc, id desc);
create index idx_entries_slug on entries (slug);

alter table entries enable row level security;

-- Public can read visible entries — required for the name-search feed
-- to work from Server Components without a service key.
create policy "public read of visible entries"
  on entries for select
  using (is_hidden = false);

-- No insert/update/delete policy for the anon role.
-- All writes (create, report) go through API routes using the
-- secret/service key, which bypasses RLS. This keeps writes server-only.
```

**Supabase API keys:** Supabase is transitioning from `anon` /
`service_role` keys to `sb_publishable_...` / `sb_secret_...` keys (legacy
keys are slated for deprecation by end of 2026). If creating a new project,
use the new naming. Use the publishable key for the server-side read client
(Server Components, via `@supabase/ssr`) and the secret key only inside API
routes that write data.

---

## 4. Validation rules for `recipient_name`

- Trim whitespace, collapse internal multiple spaces to one
- 1–50 characters after trimming
- `recipient_name_key` = lowercased version of the above
- Reject if it fails the profanity check (see §7)
- No special handling for "is this really their name" — it's a pseudonymous
  label, not an identity, and the UI copy should make that clear

---

## 5. Routes

| Route | Method | Purpose |
|---|---|---|
| `/` | — | create flow: search → quote → clip → dedication → recipient name |
| `/name/[name]` | — | paginated feed of entries where `recipient_name_key` matches |
| `/entry/[slug]` | — | direct view of a single entry (the share link) |
| `/api/search?q=` | GET | TMDb proxy |
| `/api/quotes?tmdb_id=` | GET | curated quote lookup from `data/quotes.json` |
| `/api/clips?q=` | GET | KLIPY proxy |
| `/api/create` | POST | rate-limited, profanity-checked, sanitized → inserts into `entries`, returns `slug` |
| `/api/entries?name=&cursor=` | GET | keyset-paginated feed for `/name/[name]` |
| `/api/report` | POST | increments `report_count` on a slug; auto-sets `is_hidden = true` past a threshold (e.g. 3) |

**Pagination:** use keyset pagination on `(created_at, id)`, not
`OFFSET`/`LIMIT` — pass the last row's `created_at` + `id` as the cursor for
the next page. This stays correct even as new entries are inserted.

---

## 6. Environment variables

```env
TMDB_ACCESS_TOKEN=
KLIPY_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`SUPABASE_SECRET_KEY` is server-only — never prefix it with `NEXT_PUBLIC_`,
never reference it from a Client Component.

---

## 7. Moderation & privacy — read before building Phase 6

Because entries are permanent and browsable by name, build moderation in
from the start rather than retrofitting it:

- **Server-side profanity check** on `dedication`, custom `quote_text`, and
  `recipient_name` at submit time in `/api/create`. Reject with a clear
  error rather than silently storing flagged content.
- **`is_hidden` + `report_count`** columns exist from the first migration
  (already in the schema above). `/api/report` increments the count and
  flips `is_hidden` to `true` once it crosses a small threshold (e.g. 3) —
  good enough for an MVP without a moderation dashboard.
- **On-page disclosure**: the create flow and the name-search page should
  both make it clear, in plain language, that entries are public and
  permanent, and that anyone can search any name. Don't bury this in a
  terms-of-service page nobody reads.
- **No IP storage** — for rate limiting, hash the IP server-side
  (e.g. SHA-256 with a server-only salt) before using it as an Upstash key.
  Never store raw IPs alongside entries.
- Keep `dedication` and custom `quote_text` short (enforce a max length,
  e.g. 200 characters) — both for UI reasons and to keep content closer to
  "short note" than "reproduced passage."

---

## 8. Build phases

1. **Scaffold** — Next.js + Tailwind + TypeScript, env setup, TMDb search
   working with poster results (reuse `lib/tmdb.ts`, `app/api/search/route.ts`,
   `components/MovieSearch.tsx` from the previous build if available).
2. **Supabase setup** — run the schema + RLS policy above, create
   `lib/supabase/server.ts` (publishable key, for reads in Server
   Components) and `lib/supabase/admin.ts` (secret key, for writes in API
   routes).
3. **Quote bank** — `data/quotes.json`, `/api/quotes`, quote selector UI
   with the custom-quote fallback (reuse from previous build).
4. **Create flow** — dedication field + recipient name input, `/api/create`
   inserts a row and returns `{ slug }`, confirmation screen with the share
   link `/entry/[slug]`.
5. **Clips** — KLIPY search triggered on quote selection, skip/swap UI,
   attribution per KLIPY's branding guidelines.
6. **Name search & feeds** — `/api/entries`, `/name/[name]` page with
   keyset-paginated infinite scroll, `/entry/[slug]` direct view page.
7. **Moderation & rate limiting** — profanity check on submit, `/api/report`
   + auto-hide, Upstash rate limiting (hashed IP) on `/api/create`.
8. **Polish & deploy** — mobile pass (44px touch targets, `next/image`,
   `next/font`), on-page privacy disclosure copy, deploy to Vercel.

---

## 9. Starter prompt for your AI CLI

Paste this into a fresh session, in the project root (with this file saved
as `PROJECT_CONTEXT.md` alongside it).

```
I'm rebuilding "ReelAnon" — read PROJECT_CONTEXT.md in this repo first,
it's the full spec. Follow it closely.

Quick summary: a Next.js 15 (App Router, TypeScript, Tailwind) app where
people anonymously send a movie quote + optional clip + dedication,
addressed to a name. Entries are permanent and stored in Supabase
(Postgres). Anyone can search a name and see every entry addressed to it,
paginated. TMDb powers movie search, KLIPY powers clips, Upstash handles
rate limiting.

RULES:
- Follow the schema, routes, env vars, and validation rules in
  PROJECT_CONTEXT.md exactly — don't substitute a different database,
  add auth, or introduce new external services without asking me first
  and confirming the service actually exists and what its docs say.
- Work through the build phases in PROJECT_CONTEXT.md §8 in order. After
  finishing a phase, give me a short recap (what was built, what's next)
  and wait for me to say go before starting the next phase.
- Moderation fields (is_hidden, report_count) and the profanity check are
  not optional extras — they're part of the schema and the create flow
  from the start, per §7.
- Mobile-first: 44px minimum touch targets, next/image, next/font.
- If something in the spec seems wrong or you'd do it differently, say so
  and explain your reasoning before changing it — don't silently deviate.

Let's start with Phase 1: project scaffold, environment setup, and TMDb
movie search with poster results. Walk me through it step by step.
```
