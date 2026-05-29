# Workforce Connect — Problem Solver & Developer Reference

> Complete record of every database issue, major bug, how each was fixed, and step-by-step instructions to create test users and verify every feature.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Supabase Project Info](#2-supabase-project-info)
3. [Database Schema](#3-database-schema)
4. [All Issues Encountered & How They Were Fixed](#4-all-issues-encountered--how-they-were-fixed)
5. [Features Added](#5-features-added)
6. [How to Create Test Users](#6-how-to-create-test-users)
7. [How to Test Every Feature](#7-how-to-test-every-feature)
8. [Environment Variables](#8-environment-variables)
9. [Deployment](#9-deployment)
10. [RLS Policy Reference](#10-rls-policy-reference)

---

## 1. Project Overview

**Stack:** React 19 + Vite 7 · Supabase (Auth, Postgres, Storage, Realtime) · Vercel

**Live URL:** https://workforce-connect-beta-steel.vercel.app

**GitHub:** https://github.com/Toko12pro1/workforce-connect

**What it does:** A TikTok-style informal workforce platform for Cameroon. Workers post skill videos, clients browse and hire, SMEs post internship offers. Messaging is WhatsApp-style.

---

## 2. Supabase Project Info

| Property | Value |
|---|---|
| Project ref | `zxjqwkycayobwcvlxgdl` |
| Region | eu-west-1 |
| Dashboard | https://supabase.com/dashboard/project/zxjqwkycayobwcvlxgdl |
| API URL | `https://zxjqwkycayobwcvlxgdl.supabase.co` |
| DB host | `db.zxjqwkycayobwcvlxgdl.supabase.co` |
| Postgres version | 17.6 |

**Supabase roles:**
- `anon` — unauthenticated browser requests
- `authenticated` — logged-in user requests (JWT from `supabase.auth.signInWithPassword`)
- `service_role` — admin/bypass-RLS (only used in Node scripts, NEVER in browser)

---

## 3. Database Schema

### Tables

#### `profiles` (auto-created by Supabase trigger on `auth.users`)
```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id)
email         text
name          text
trade         text
location      text
phone         text
bio           text
avatar_url    text
account_type  text DEFAULT 'worker'   -- 'worker' | 'client' | 'sme'
skills        text[] DEFAULT '{}'
cv_url        text
followers_count  integer DEFAULT 0
following_count  integer DEFAULT 0
weekly_earnings  integer DEFAULT 0
created_at    timestamptz
```

#### `jobs` (used for both real jobs AND direct messages)
```sql
id             uuid PRIMARY KEY
client_id      uuid REFERENCES profiles(id)
worker_id      uuid REFERENCES profiles(id)
service_type   text    -- 'Message direct' for chat threads
description    text
location       text
budget_type    text    -- 'fixed' | 'negotiable' | 'cash'
budget_amount  numeric
status         text    -- 'posted' | 'active' | 'completed'
media_urls     text[]
created_at     timestamptz
```

#### `messages`
```sql
id           uuid PRIMARY KEY
job_id       uuid REFERENCES jobs(id)
sender_id    uuid REFERENCES profiles(id)
sender_role  text
text         text
image_url    text
type         text
status       text
created_at   timestamptz
```

#### `feed_posts`
```sql
id             uuid PRIMARY KEY
worker_id      uuid REFERENCES profiles(id)
title          text
caption        text
post_type      text    -- 'Handwork' | 'Job Update' | 'Training'
category       text    -- trade name
media_urls     text[]
media_types    text[]  -- 'image' | 'video' per URL
likes_count    integer DEFAULT 0
comments_count integer DEFAULT 0
views_count    integer DEFAULT 0
created_at     timestamptz
```

#### `post_likes`
```sql
id        uuid PRIMARY KEY
post_id   uuid REFERENCES feed_posts(id)
user_id   uuid REFERENCES profiles(id)
UNIQUE(post_id, user_id)
```

#### `post_comments`
```sql
id         uuid PRIMARY KEY
post_id    uuid REFERENCES feed_posts(id)
author_id  uuid REFERENCES profiles(id)
text       text
likes_count integer DEFAULT 0
created_at timestamptz
```

#### `follows`
```sql
id            uuid PRIMARY KEY
follower_id   uuid REFERENCES profiles(id)
followed_id   uuid REFERENCES profiles(id)
followed_type text   -- 'worker' | 'sme'
UNIQUE(follower_id, followed_id)
```

#### `internship_offers`
```sql
id                  uuid PRIMARY KEY
sme_id              uuid REFERENCES profiles(id)
title               text
trade               text
city                text
duration            text
compensation_type   text    -- 'paid' | 'transport' | 'none'
compensation_amount integer
deadline            date
status              text    -- 'open' | 'closed'
applicants_count    integer DEFAULT 0
created_at          timestamptz
```

#### `applications`
```sql
id           uuid PRIMARY KEY
offer_id     uuid REFERENCES internship_offers(id)
applicant_id uuid REFERENCES profiles(id)
cover_note   text
cv_url       text
status       text   -- 'pending' | 'accepted' | 'rejected'
UNIQUE(offer_id, applicant_id)
created_at   timestamptz
```

#### `sme_profiles`
```sql
id           uuid PRIMARY KEY REFERENCES profiles(id)
company_name text
sector       text
size         text   -- 'micro' | 'petite' | 'moyenne'
city         text
logo_url     text
```

#### `notifications`
```sql
id          uuid PRIMARY KEY
recipient_id uuid REFERENCES profiles(id)
type        text    -- 'like' | 'comment' | 'follow' | 'application'
actor_id    uuid REFERENCES profiles(id)
target_id   uuid
target_type text
is_read     boolean DEFAULT false
created_at  timestamptz
```

### Storage Buckets

| Bucket | Visibility | Used for |
|---|---|---|
| `avatars` | public | User profile photos |
| `portfolio-media` | public | Legacy portfolio images |
| `feed-media` | public | Feed post images & videos |
| `job-media` | public | Job request photos |
| `cv-uploads` | private | Worker CV PDFs |
| `sme-logos` | public | SME company logos |

---

## 4. All Issues Encountered & How They Were Fixed

### Issue 1 — "Failed to fetch" on Login (all accounts)
**Symptom:** Login page shows "Failed to fetch" for every user, on the deployed Vercel site.

**Root cause:** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were not set in Vercel project environment variables. Vite embeds env vars at **build time**, so the deployed bundle used the fallback `'https://placeholder.supabase.co'` which does not exist.

**Fix:**
1. Added both env vars to the Vercel project via Vercel API (or dashboard → Settings → Environment Variables)
2. Pushed an empty commit to trigger a fresh build: `git commit --allow-empty && git push`

**Prevention:** Always set these two variables in every Vercel project before first deploy:
- `VITE_SUPABASE_URL` = `https://zxjqwkycayobwcvlxgdl.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (the anon/public key from Supabase → Settings → API)

---

### Issue 2 — "permission denied for table jobs" on messaging
**Symptom:** Clicking "Message" on a worker profile → `/chat?with=<workerId>` → console shows `permission denied for table jobs (user: X with: Y)`.

**Root cause:** The `authenticated` PostgreSQL role had no GRANT on the `jobs` and `messages` tables. GRANT is checked **before** RLS — if the role has no GRANT, the query fails immediately without even evaluating RLS policies.

**Fix:** Run in Supabase SQL Editor:
```sql
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

**Key lesson:** In Supabase, GRANTs and RLS are separate layers. Both must allow the action.

---

### Issue 3 — "Impossible d'ouvrir la conversation" (chat thread creation)
**Symptom:** Chat showed "Impossible d'ouvrir la conversation" after the permission error was fixed.

**Root cause:** `getOrCreateDirectThread()` was inserting into `jobs` with:
- `budget_currency: "XAF"` — column does not exist in the live table
- `status: "active"` — violated a CHECK constraint (valid values: `'posted'`, `'completed'`)
- Missing `media_urls: []` — possible NOT NULL constraint

**Fix in `src/services/chatService.js`:**
```js
// WRONG (original)
.insert({
  client_id: myId, worker_id: theirId,
  service_type: "Message direct",
  description: "Discussion directe",
  location: "—",
  budget_type: "fixed", budget_amount: 0,
  budget_currency: "XAF",   // ← column does not exist
  status: "active"           // ← invalid value
})

// CORRECT (fixed)
.insert({
  client_id: myId, worker_id: theirId,
  service_type: "Message direct",
  description: "Discussion directe",
  location: "—",
  budget_type: "fixed", budget_amount: 0,
  status: "posted",          // ← valid value
  media_urls: []             // ← required field
})
```

---

### Issue 4 — "new row violates row-level security policy" on feed post publish
**Symptom:** Worker fills out `/create-post` form, clicks Publish → "Erreur: new row violates row-level security policy for table feed_posts".

**Root cause (multi-layer):**
1. RLS `WITH CHECK` policy used `auth.uid() = worker_id` but browser JWT `sub` claim not matching
2. `GRANT INSERT ON feed_posts TO authenticated` was missing
3. The error was hidden behind a friendly "Impossible de publier" message so the real cause wasn't visible

**Steps taken to diagnose:**
1. Changed error display in `CreateFeedPostPage.jsx` to show raw error: `setError(\`Erreur: ${msg}\`)`
2. Tested INSERT via Node.js with service_role key → success (proved table/schema is fine)
3. Tested INSERT with anon key → "permission denied" (proved GRANT issue)
4. Applied GRANT (see Issue 2 fix above)
5. Set RLS policy `WITH CHECK` to `(auth.role() = 'authenticated')` as broader check
6. Final fallback: `ALTER TABLE feed_posts DISABLE ROW LEVEL SECURITY` for testing

**RLS policy that works:**
```sql
-- Allow authenticated users to insert their own posts
CREATE POLICY "workers can insert feed posts"
ON feed_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = worker_id);

-- Allow everyone to read feed posts
CREATE POLICY "feed posts are public"
ON feed_posts FOR SELECT
TO anon, authenticated
USING (true);
```

---

### Issue 5 — Feed scroll broken (can't scroll between videos)
**Symptom:** Could not scroll the feed; bottom nav only showed 3 tabs; filter bar blocked the first card.

**Root causes (4 separate CSS bugs):**
1. `.app-bottom-nav` grid was `repeat(3, 1fr)` but had 5 tab items → items overflowed
2. `.feed-filter-bar` was `position: relative` → pushed the scroll container down, hiding first card
3. `.feed-screen` used `min-height: 100vh` → allowed content to overflow beyond screen
4. `.feed-card-sidebar` and `.feed-card-info` were positioned too low, hidden behind nav

**Fix in `src/styles.css`:**
```css
.app-bottom-nav { grid-template-columns: repeat(5, 1fr); }

.feed-filter-bar { position: absolute; top: 12px; left: 12px; z-index: 30; }

.feed-screen { height: 100dvh !important; overflow: hidden; }

.feed-card-sidebar { bottom: 160px; }
.feed-card-info    { bottom: 140px; }
```

---

### Issue 6 — Infinite loading spinner on Vercel (but worked locally)
**Symptom:** App showed a loading spinner forever on the live Vercel site.

**Root cause:** `profileService.js` called a Supabase RPC function `ensure_profile` that did not exist in the live database. The call silently hung instead of timing out.

**Fix:** Removed the `ensure_profile` RPC call entirely. Profile creation now happens only during `signUp()` via a direct `profiles.upsert()`.

---

### Issue 7 — "Failed to fetch" for users without profiles
**Symptom:** Comments and messages failed for some users.

**Root cause:** Foreign key JOIN on `profiles` in queries for `messages` and `post_comments` returned an error when a user existed in `auth.users` but not in `profiles` (could happen if signup created auth user but profile INSERT failed).

**Fix:** Made profile creation more robust in `authService.signUp()` using `.upsert()` instead of `.insert()`, and wrapped JOINs in try/catch with graceful fallback.

---

### Issue 8 — Videos on feed autoplay but have no sound
**Symptom:** Feed videos played automatically but were silent — no way to enable sound.

**Root cause:** `<video muted>` attribute was hardcoded in `FeedCard.jsx`. Browsers require `muted` for autoplay (by policy), but there was no way for the user to unmute.

**Fix in `src/components/FeedCard.jsx`:**
- Added `muted` state (starts `true`)
- Added `VolumeX`/`Volume2` toggle button in the action sidebar
- Set `videoRef.current.muted` via JS (React's `muted` prop is unreliable — it doesn't update the DOM)
- Initialised `videoRef.current.muted = true` in a `useEffect` on mount

```jsx
const [muted, setMuted] = useState(true);

// On mount — force muted for autoplay
useEffect(() => { if (videoRef.current) videoRef.current.muted = true; }, []);

function toggleMute() {
  const next = !muted;
  videoRef.current.muted = next;
  setMuted(next);
}

// In JSX — no muted prop; sidebar button:
{isVideo && (
  <button onClick={toggleMute}>
    {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
  </button>
)}
```

---

## 5. Features Added

| Feature | Where | Description |
|---|---|---|
| TikTok feed | `/feed` | Vertical snap-scroll of worker skill videos/images |
| Create post | `/create-post` | Worker publishes video/photo with trade category |
| WhatsApp chat | `/chat` | Inbox with avatars, search, green/white bubbles, realtime |
| Direct messaging | `/chat?with=<userId>` | One-tap start conversation from any worker profile |
| Chat history | `/chat` | Full message history per conversation, persisted in DB |
| Unread badges | BottomNav, thread list | Green badge shows unread count, clears on open |
| Mute/unmute video | FeedCard sidebar | Speaker icon — start muted, tap to hear sound |
| Like posts | FeedCard | Heart button with optimistic count update |
| Comments | FeedCard | Bottom-sheet comment drawer with realtime updates |
| Follow workers | FeedCard | Follow/unfollow with `follows` table |
| OOP models | `src/models/` | `FeedPost`, `WorkerProfile`, `SMEProfile`, etc. |
| Internship offers | `/internships` | SME posts stage offers with XAF compensation |
| Applications | `/apply` | Worker applies with cover note + CV upload |
| SME portal | `/sme-portal` | SME dashboard: offers, applicants, status management |
| Notifications | `/notifications` | Realtime notification bell with unread count |
| Storage upload | `storageService.js` | Feed media, CVs, avatars, SME logos |

---

## 6. How to Create Test Users

### Method A — Sign up via the app UI

1. Go to https://workforce-connect-beta-steel.vercel.app/create-account
2. Enter name, email, password (min 6 characters)
3. Click "Créer mon compte"
4. User is created in `auth.users` and `profiles` simultaneously

### Method B — Create via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/zxjqwkycayobwcvlxgdl/auth/users
2. Click "Add user" → "Create new user"
3. Enter email + password
4. Then manually create a profile row:

```sql
-- Run in SQL Editor
INSERT INTO profiles (id, email, name, trade, location, account_type)
VALUES (
  '<paste-user-id-from-auth-users>',
  'test@example.com',
  'Test Worker',
  'Électricien',
  'Yaoundé',
  'worker'
);
```

### Method C — Create via Node.js script (bulk users)

Create a file `scripts/create-test-users.mjs`:

```js
import { createClient } from '@supabase/supabase-js';

// Use service_role key — never commit this to git
const supabase = createClient(
  'https://zxjqwkycayobwcvlxgdl.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testUsers = [
  { email: 'worker1@test.com', password: 'Test1234!', name: 'Jean-Luc Kamga', trade: 'Maçon', location: 'Douala', account_type: 'worker' },
  { email: 'worker2@test.com', password: 'Test1234!', name: 'Patrick Mbarga', trade: 'Électricien', location: 'Yaoundé', account_type: 'worker' },
  { email: 'client1@test.com', password: 'Test1234!', name: 'Marie Fouda', trade: null, location: 'Yaoundé', account_type: 'client' },
  { email: 'sme1@test.com',    password: 'Test1234!', name: 'Groupe Tabi SARL', trade: null, location: 'Douala', account_type: 'sme' },
];

for (const u of testUsers) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name }
  });
  if (error) { console.error(u.email, error.message); continue; }

  await supabase.from('profiles').upsert({
    id: data.user.id,
    email: u.email,
    name: u.name,
    trade: u.trade,
    location: u.location,
    account_type: u.account_type
  });

  console.log('Created:', u.email, '→', data.user.id);
}
```

Run:
```bash
SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/create-test-users.mjs
```

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` must only be used in Node scripts — never import it in React/Vite.

---

## 7. How to Test Every Feature

### Login / Signup
1. Open https://workforce-connect-beta-steel.vercel.app
2. Click "Se connecter" → enter email + password → should redirect to `/feed`
3. Click "Créer mon compte" → fill form → should redirect to `/feed`
4. **Expected:** No "Failed to fetch" error. If you see it, the Vercel env vars are missing (see Issue 1).

### Feed (TikTok scroll)
1. Log in as a worker
2. Navigate to `/feed`
3. **Expected:** Vertical list of post cards. Swipe up/scroll to next post.
4. Tap a video card → video pauses (play icon appears)
5. Tap the speaker icon (🔇) in sidebar → video unmutes and plays with sound
6. Double-tap heart → like count increases immediately (optimistic)
7. Tap comment icon → bottom sheet opens with comment input

### Publish a Post
1. Log in as a worker
2. Navigate to `/create-post`
3. Upload an image or video (tap "Ajouter photos / vidéos")
4. Enter a title and description
5. Select a trade category (chip grid)
6. Click "Publier"
7. **Expected:** Redirected to `/feed`, new post appears at top

### Messaging (Chat)
1. Log in as **User A**
2. Go to `/browse`, find a worker, click "Message"
3. **Expected:** Redirected to `/chat?with=<workerId>`, conversation opens
4. Type a message, press Send
5. **Expected:** Message appears as green bubble (right side)
6. Open new browser tab, log in as **User B** (the worker)
7. Navigate to `/chat`
8. **Expected:** Conversation thread with User A visible in inbox with preview text
9. Click the thread → see User A's message as white bubble (left side)
10. Type a reply → it appears instantly in User A's chat (realtime)

### Chat Inbox
1. Log in
2. Navigate to `/chat`
3. **Expected:** List of conversation threads, each showing: avatar, name, last message preview, timestamp, green unread badge if unread
4. Use the search bar to filter by name
5. Click a thread → conversation opens

### Internship Offers (SME)
1. Log in as an SME account
2. Navigate to `/sme-portal` → create a new offer
3. Log in as a worker
4. Navigate to `/internships` → see the offer card
5. Click "Postuler" → fill cover note → submit
6. Log back in as SME → go to `/sme-portal` → see the application under the offer

### Follow a Worker
1. Navigate to any feed post
2. Click the follow icon (person+ icon in sidebar)
3. **Expected:** Icon changes to person-check (Suivi)
4. Check Supabase: `SELECT * FROM follows WHERE follower_id = '<your-id>';`

### Verify DB state after any action

Open https://supabase.com/dashboard/project/zxjqwkycayobwcvlxgdl/editor and run:

```sql
-- See all feed posts
SELECT id, worker_id, title, post_type, category, created_at
FROM feed_posts ORDER BY created_at DESC LIMIT 10;

-- See all chat threads
SELECT id, service_type, client_id, worker_id, status, created_at
FROM jobs WHERE service_type = 'Message direct' ORDER BY created_at DESC;

-- See all messages in a thread
SELECT sender_id, text, created_at
FROM messages WHERE job_id = '<thread-id>' ORDER BY created_at;

-- See follows
SELECT follower_id, followed_id, followed_type FROM follows;

-- See profiles
SELECT id, name, trade, account_type, location FROM profiles;
```

---

## 8. Environment Variables

### Required in `.env` (local dev)
```
VITE_SUPABASE_URL=https://zxjqwkycayobwcvlxgdl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Required in Vercel Project Settings (production)
Same two variables above — go to Vercel Dashboard → Project → Settings → Environment Variables.

### Only for Node scripts (never in Vite/browser)
```
SUPABASE_SERVICE_ROLE_KEY=<from Supabase → Settings → API → service_role key>
SUPABASE_ACCESS_TOKEN=<from Supabase account settings — used in migration scripts only>
```

> **Security rule:** Any variable used in a Vite/React file is bundled into the public JS and visible to anyone. Only `VITE_` prefixed vars go in the app. Service keys stay server-side only.

---

## 9. Deployment

**Auto-deploy:** Every `git push origin main` triggers a Vercel build automatically (GitHub integration connected).

**Manual redeploy** (if env vars change):
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

**Check if env vars are baked in:**
```bash
# Fetch deployed bundle and search for Supabase URL
curl -s https://workforce-connect-beta-steel.vercel.app \
  | grep -o 'src="[^"]*\.js"' | head -1 | \
  xargs -I{} curl -s "https://workforce-connect-beta-steel.vercel.app{}" \
  | grep -o '"https://[^"]*supabase[^"]*"' | head -1
```
If the output is `"https://placeholder.supabase.co"` → env vars are missing in Vercel.
If it shows the real URL → deployment is correct.

---

## 10. RLS Policy Reference

Run these in Supabase SQL Editor to reset policies to a working state:

```sql
-- ─────────────────────────────────────────────
-- 1. GRANTS (must come before RLS)
-- ─────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ─────────────────────────────────────────────
-- 2. profiles
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read profiles" ON profiles;
DROP POLICY IF EXISTS "users manage own profile" ON profiles;
CREATE POLICY "public read profiles"       ON profiles FOR SELECT USING (true);
CREATE POLICY "users manage own profile"   ON profiles FOR ALL   USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 3. jobs (includes chat threads)
-- ─────────────────────────────────────────────
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "parties can access jobs" ON jobs;
DROP POLICY IF EXISTS "clients can create jobs" ON jobs;
CREATE POLICY "parties can access jobs" ON jobs FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = worker_id);
CREATE POLICY "clients can create jobs" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = client_id);

-- ─────────────────────────────────────────────
-- 4. messages
-- ─────────────────────────────────────────────
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "thread parties read messages" ON messages;
DROP POLICY IF EXISTS "thread parties insert messages" ON messages;
CREATE POLICY "thread parties read messages" ON messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM jobs WHERE jobs.id = job_id AND (jobs.client_id = auth.uid() OR jobs.worker_id = auth.uid())));
CREATE POLICY "thread parties insert messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ─────────────────────────────────────────────
-- 5. feed_posts
-- ─────────────────────────────────────────────
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feed posts are public" ON feed_posts;
DROP POLICY IF EXISTS "workers can insert feed posts" ON feed_posts;
CREATE POLICY "feed posts are public"        ON feed_posts FOR SELECT USING (true);
CREATE POLICY "workers can insert feed posts" ON feed_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "workers can update own posts"  ON feed_posts FOR UPDATE
  TO authenticated USING (auth.uid() = worker_id);

-- ─────────────────────────────────────────────
-- 6. post_likes, post_comments, follows
-- ─────────────────────────────────────────────
ALTER TABLE post_likes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read likes"      ON post_likes    FOR SELECT USING (true);
CREATE POLICY "auth users like"        ON post_likes    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users unlike own"       ON post_likes    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "public read comments"   ON post_comments FOR SELECT USING (true);
CREATE POLICY "auth users comment"     ON post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "authors delete comment" ON post_comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "public read follows"    ON follows FOR SELECT USING (true);
CREATE POLICY "auth users follow"      ON follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "users unfollow own"     ON follows FOR DELETE USING (auth.uid() = follower_id);

-- ─────────────────────────────────────────────
-- 7. internship_offers, applications
-- ─────────────────────────────────────────────
ALTER TABLE internship_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read offers"     ON internship_offers FOR SELECT USING (true);
CREATE POLICY "sme insert offers"      ON internship_offers FOR INSERT TO authenticated WITH CHECK (auth.uid() = sme_id);
CREATE POLICY "sme manage own offers"  ON internship_offers FOR ALL   USING (auth.uid() = sme_id);

CREATE POLICY "applicants read own"    ON applications FOR SELECT USING (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM internship_offers WHERE id = offer_id AND sme_id = auth.uid()));
CREATE POLICY "workers apply"          ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "sme update status"      ON applications FOR UPDATE USING (EXISTS (SELECT 1 FROM internship_offers WHERE id = offer_id AND sme_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 8. notifications
-- ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipients read notifs" ON notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "system insert notifs"   ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "mark own read"          ON notifications FOR UPDATE USING (auth.uid() = recipient_id);
```

---

*Last updated: 2026-05-28 — Workforce Connect v2*
