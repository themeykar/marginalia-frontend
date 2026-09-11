# Marginalia — Frontend

A quiet, personal reading journal. Track what you're reading, hold onto the lines that stopped you mid-page, and watch a year of reading assemble into a lasting reflection.

**Live site:** https://marginalia-online.vercel.app
**Backend API:** https://marginalia-backend-ygk4.onrender.com

---

## Tech Stack

- **Framework:** Next.js (App Router), JavaScript
- **Styling:** Tailwind CSS v4 (theme tokens defined via `@theme` in `globals.css`, no `tailwind.config.js`)
- **Fonts:** Fraunces (serif — titles, quotes) + Inter (sans — UI, stats), loaded via `next/font/google`
- **Motion:** Framer Motion, used deliberately and sparingly (one considered moment per page)
- **Auth:** JWT access/refresh tokens, stored in `localStorage`
- **Hosting:** Vercel

---

## Design System

| Token | Value | Use |
|---|---|---|
| `bg-background` | `#1B2430` (Ink Navy) | Page background |
| `bg-card` | `#F0E9DA` (Warm Parchment) | Card surfaces |
| `bg-primary` | `#7A2E3A` (Deep Burgundy) | Primary actions/accents |
| `bg-secondary` | `#C9A15E` (Soft Gold) | Secondary accents, ratings |
| `bg-status-reading` | `#6B7B6E` (Muted Sage) | "Reading" status accent |

Design feel: *"a well-loved library at night"* — tactile, journal-like, generous negative space, restraint over density. Motion is used exactly once per page as a deliberate moment, never as decoration.

---

## Features

- Public homepage (Nav, Hero with staggered text reveal, Features preview, Footer)
- Signup (editorial split-screen layout) and Login (quiet centered form) — visually distinct by design
- JWT-protected route shell with automatic 401 → refresh → retry handling
- The Shelf — books grouped by status, spine visual treatment (real cover art or a curated spine-color fallback), wraps into multiple rows as the collection grows
- Add/Edit Book form with an Open Library cover-search flow (explicit search button, no live/auto search) and a curated color-swatch fallback
- Book Detail page — metadata, inline Notes & Quotes journal (add/edit/delete), book deletion
- Year in Books — an auto-advancing, story-style reveal of the year's reading stats, date-gated to **December 15–31**

---

## Local Setup

```bash
git clone <repo-url>
cd marginalia-frontend
npm install
```

Create a `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the Django backend locally alongside this (separate terminal, separate repo) before starting the frontend, since most pages depend on it.

```bash
npm run dev
```

Runs at `http://localhost:3000`.

---

## Environment Variables (Production / Vercel)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | The real deployed backend URL (`https://marginalia-backend-ygk4.onrender.com`) |

---

## Deployment (Vercel)

Default Next.js build settings — no custom build command needed. Vercel auto-detects and builds on push to `main`.

---

## Architecture Notes

- `src/lib/auth.js` — shared token storage helpers (`setTokens`, `getAccessToken`, `getRefreshToken`, `clearTokens`)
- `src/lib/api.js` — `apiFetch()`, the single authenticated API client used by every protected page; handles the access-token-expired → refresh → retry pattern centrally so it's never duplicated per-page
- `src/app/(protected)/layout.js` — route-group layout verifying the JWT on every authenticated page before rendering, redirecting to `/login` if missing/invalid
- Year in Books' date gate (`isWithinRevealWindow()`) is a frontend-only check — the backend endpoint itself has no date restriction

---

## Known Constraints

- Tokens are stored in `localStorage` (not httpOnly cookies) — a deliberate simplicity tradeoff for this project's scope, with minor XSS exposure as a known tradeoff.
- Year in Books is gated by client-side date logic only; the underlying `/api/wrapup/` data is always available on the backend regardless of date.