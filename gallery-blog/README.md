# Gallery — a blog-style image gallery

React + Vite frontend, Supabase backend (Postgres, Auth, Storage), deployable to Vercel.

No header/nav — just the gallery, a floating theme toggle, and a small gear icon (bottom-left)
that opens the admin login.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's ready, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates:
   - `posts`, `tags`, `activity_logs` tables
   - Row Level Security policies (public can only read *published* posts; only
     logged-in users can create/edit/delete)
   - A public `post-images` Storage bucket with matching access policies
3. Create your admin login: **Authentication → Users → Add user** (email + password).
   Public sign-ups aren't used anywhere in the app — this is the only way in.
4. Grab your keys from **Project Settings → API**: `Project URL` and `anon public` key.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

- Gallery: `http://localhost:5173/`
- Admin: `http://localhost:5173/admin`

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In Vercel: **New Project → Import** the repo (framework preset: Vite).
3. Add the two environment variables from step 2 in **Project Settings → Environment Variables**
   (for Production, Preview, and Development).
4. Deploy. `vercel.json` is already set up to route all paths to `index.html` so client-side
   routing (`/admin`, `/admin/edit/:id`, etc.) works on refresh/direct link.

## How it's put together

- **Public gallery** (`/`) reads only `status = 'published'` posts (enforced by RLS, not just
  the UI query) — drafts never leak to visitors even if someone inspects the network tab.
- **Search** matches title/subtitle; the **tag filter chips** do exact tag matching (fast, uses
  a GIN index on `posts.tags`).
- **Pagination** is server-side (`range()` queries), 9 posts per page.
- **Images**: on upload, the admin's file is compressed and converted to WebP client-side
  (`browser-image-compression`) before it's sent to Supabase Storage — nothing is ever pulled
  from an external image host. The bucket is public-read so the gallery can display images
  directly by URL, but only authenticated admins can write to it (see the storage policies in
  `schema.sql`).
- **Admin panel** (`/admin/dashboard`, `/admin/new`, `/admin/edit/:id`) is behind
  `ProtectedRoute`, which checks the Supabase Auth session and redirects to `/admin` if there
  isn't one.
- **Activity log**: every create/edit/publish/unpublish/delete writes a row to
  `activity_logs` with the acting user's email and a timestamp, visible under the
  dashboard's "Activity log" tab.
- **Theme**: light/dark values are exact CSS variables per the brief, toggled via a floating
  button, persisted to `localStorage`, applied through a `data-theme` attribute with CSS
  transitions on `background-color`/`color`.

## Notes / things to decide as you grow this

- Every authenticated Supabase user is currently treated as an admin (simplest setup for a
  single-owner blog). If you need multiple roles, add a `profiles` table with a `role` column
  and tighten the RLS policies in `schema.sql` to check it.
- Tag search is exact-match by design (fast, indexed). If you want fuzzy tag search from the
  search box too, that's a small addition using `unnest(tags)` in a Postgres function — happy
  to add it if you need it.
