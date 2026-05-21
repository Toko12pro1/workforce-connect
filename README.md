# Workforce Connect

A TikTok-style informal workforce marketplace for Cameroon. Workers post videos and photos of their skills. SMEs post internship offers and receive applications. Everyone discovers talent through a vertical-scroll feed — no recruiters, no CVs required.

Built with React 19 + Vite 7, backed by Supabase (Auth, Postgres, Storage, Realtime).

---

## Admin Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@workforceconnect.cm` | `Admin@2024!` | Full admin panel at `/admin` |

> The admin panel shows all users, posts, internship offers, and applications. The admin can change any user's role, delete posts, close or delete offers, and update application statuses.

---

## Demo Accounts

All demo accounts use the password `Demo@2024!`

### Workers
| Name | Email | Trade | Location |
|------|-------|-------|----------|
| Moussa Bello | `moussa@workers.demo` | Plomberie | Bastos, Yaoundé |
| Fatou Diallo | `fatou@workers.demo` | Couture | Mfoundi, Yaoundé |
| Jean-Luc Kamga | `jean@workers.demo` | Electricité | Mendong, Yaoundé |
| Patrick Mbarga | `patrick@workers.demo` | Maçonnerie | Biyem-Assi, Yaoundé |
| Clarisse Ngo | `clarisse@workers.demo` | Coiffure | Nlongkak, Yaoundé |

### SMEs
| Company | Email | Sector | City |
|---------|-------|--------|------|
| BTP Akwa SARL | `btp@sme.demo` | BTP / Construction | Douala |
| Atelier Mode Centrale | `mode@sme.demo` | Artisanat | Yaoundé |

### Clients (5 demo users for testing)
All passwords: `Demo@2024!`

| Name | Email | Location | What they're testing |
|------|-------|----------|----------------------|
| Amina Fouda | `amina@demo.wc` | Bastos, Yaoundé | Browsing workers · posting plumbing & painting jobs |
| Bernard Nkolo | `bernard@demo.wc` | Akwa, Douala | Posting electrical & AC maintenance jobs |
| Christine Essama | `christine@demo.wc` | Mfoundi, Yaoundé | Posting tailoring/uniforms job |
| David Kamto | `david@demo.wc` | Bonabéri, Douala | Construction client — masonry & tiling jobs |
| Estelle Ngono | `estelle@demo.wc` | Bafoussam | Carpentry job · boutique owner |

Each client account has **live job posts** seeded in the database (status: `posted`, currency: XAF).

---

## Features

### Feed (TikTok-style)
- Vertical snap-scroll feed of worker posts
- Videos autoplay when in view, pause when scrolled away
- Like, comment, share, and follow directly from each card
- Filter by trade (16 Cameroonian trades) and post type
- Real-time comment updates via Supabase Realtime

### Worker Flow
- Sign up → choose "Travailleur" role → complete onboarding
- Post competence videos and photos to the feed
- Set availability, display skills and trade
- Receive job offers and internship applications
- Track applications in `/my-applications`

### SME Flow
- Sign up → choose "PME" role → complete company onboarding
- Post internship offers with XAF compensation or transport allowance
- Review applications in the SME portal
- Accept or decline candidates

### Discovery
- Browse workers by trade, location, availability
- Real-time search with debounce (350ms)
- Direct links to worker and SME public profiles

### Notifications
- Real-time notification bell with unread count
- Notifications for likes, follows, new applications, and status updates

---

## App Routes

### Public routes
```
/                    Landing page
/login               Sign in
/create-account      Register
/role-select         Choose Worker / Client / SME after signup
/feed                TikTok-style discovery feed
/browse              Browse workers with search and filters
/internships         Browse SME internship offers
/admin               Admin panel (requires admin account)
```

### Dynamic routes
```
/profile/:workerId   Public worker profile
/sme/:smeId          Public SME profile
/internship/:offerId Internship offer detail + Apply
/feed/:postId        Single post with full comments
```

### Protected routes (require login)
```
/worker-dashboard    Worker earnings, jobs, stats
/worker-profile      Edit own profile
/worker-setup        Worker onboarding
/worker-onboarding   Worker onboarding (alias)
/create-post         Post a new competence video/photo
/add-portfolio       Add portfolio item
/my-applications     Track applied internship offers
/sme-setup           SME company onboarding
/sme-portal          SME dashboard — manage offers and applications
/notifications       Full notification list
/post-job-details    Post a job — details step
/post-job-location   Post a job — location & budget (XAF)
/post-job-visuals    Post a job — add photos
/job-posted          Job posted success screen
/chat                In-app messaging
/logout              Sign out and redirect to /login
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, Vite 7 |
| Styling | Plain CSS (mobile-first, CSS snap-scroll for feed) |
| Icons | Lucide React |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Auth | Supabase Auth (email/password, JWT, RLS) |
| OOP models | ES6 class hierarchy (`BaseEntity → UserProfile → WorkerProfile / SMEProfile`) |
| Currency | XAF — `Intl.NumberFormat("fr-CM")` |
| i18n | English / French toggle (localStorage) |
| Search | Debounced Supabase `ilike` queries |

---

## Database

### Tables
| Table | Purpose |
|-------|---------|
| `profiles` | All user profiles (worker, sme, client, admin) |
| `feed_posts` | Worker competence posts (images & videos) |
| `post_likes` | Like tracking with unique constraint |
| `post_comments` | Post comments with real-time updates |
| `follows` | Social graph (follow workers and SMEs) |
| `sme_profiles` | SME company details |
| `internship_offers` | SME stage and job offers |
| `applications` | Worker applications to offers |
| `notifications` | Real-time notifications |
| `jobs` | Client job postings |

### Triggers
- `trg_sync_likes` — updates `feed_posts.likes_count` on like/unlike
- `trg_sync_comments` — updates `feed_posts.comments_count` on comment add/delete
- `trg_sync_applicants` — updates `internship_offers.applicants_count` on new application
- `trg_sync_followers` — updates `profiles.followers_count` on follow/unfollow

### Storage Buckets
| Bucket | Access | Purpose |
|--------|--------|---------|
| `feed-media` | Public | Worker videos and photos |
| `cv-uploads` | Private (auth) | Worker CV PDFs |
| `sme-logos` | Public | SME logo images |

---

## OOP Model Classes

```
BaseEntity
├── UserProfile
│   ├── WorkerProfile    — earningsFormatted() "85 000 XAF", availabilityLabel()
│   └── SMEProfile       — sizeLabel()
├── FeedPost             — hasVideo, relativeTime, primaryMedia
├── InternshipOffer      — compensationLabel() "35 000 XAF/mois" | "Transport" | "Non rémunéré"
│                          daysLeft, isExpired
├── JobApplication       — statusLabel()
├── PostLike
├── PostComment          — relativeTime()
├── FollowRelation
└── Notification         — actionLabel(), icon()
```

---

## Run Locally

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
```

### Environment variables (`.env`)
```
VITE_SUPABASE_URL=https://zxjqwkycayobwcvlxgdl.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

> `SUPABASE_SERVICE_ROLE_KEY` is only used in server-side Node scripts — never imported into React.

---

## Cameroonian Trades (16)

Maçonnerie · Plomberie · Electricité · Menuiserie · Couture · Coiffure · Mécanique · Soudure · Peinture · Carrelage · Cuisine · Informatique · Climatisation · Jardinage · Agent de sécurité · Transport

---

## Language Support

Toggle between **English** and **French** using the language button visible on all pages. Selection is saved in `localStorage`.
