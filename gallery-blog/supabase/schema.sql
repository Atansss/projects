-- ============================================================
-- Gallery Blog — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------

create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  description text,
  image_path text,        -- path inside the storage bucket
  image_url text,         -- cached public URL (or signed URL) for the image
  link text,              -- optional external link; controls button visibility
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  action text not null check (action in ('create', 'edit', 'delete', 'publish', 'unpublish')),
  post_id uuid,
  post_title text,
  performed_by uuid references auth.users(id),
  performed_by_email text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.activity_logs enable row level security;

-- Public (anon) can read only published posts
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
  on public.posts for select
  to anon
  using (status = 'published');

-- Authenticated (admin) users can read everything
drop policy if exists "Authenticated can read all posts" on public.posts;
create policy "Authenticated can read all posts"
  on public.posts for select
  to authenticated
  using (true);

-- Only authenticated (admin) users can insert/update/delete
drop policy if exists "Authenticated can insert posts" on public.posts;
create policy "Authenticated can insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated can update posts" on public.posts;
create policy "Authenticated can update posts"
  on public.posts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can delete posts" on public.posts;
create policy "Authenticated can delete posts"
  on public.posts for delete
  to authenticated
  using (true);

-- Tags: readable by everyone, writable by authenticated users only
drop policy if exists "Anyone can read tags" on public.tags;
create policy "Anyone can read tags"
  on public.tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can manage tags" on public.tags;
create policy "Authenticated can manage tags"
  on public.tags for all
  to authenticated
  using (true)
  with check (true);

-- Activity logs: only authenticated (admin) users can read/write
drop policy if exists "Authenticated can read logs" on public.activity_logs;
create policy "Authenticated can read logs"
  on public.activity_logs for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can insert logs" on public.activity_logs;
create policy "Authenticated can insert logs"
  on public.activity_logs for insert
  to authenticated
  with check (true);

-- ------------------------------------------------------------
-- Storage bucket for post images
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Public read access to images (bucket is public, but policy is still required for select)
drop policy if exists "Public read post images" on storage.objects;
create policy "Public read post images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-images');

-- Only authenticated users can upload/update/delete images
drop policy if exists "Authenticated upload post images" on storage.objects;
create policy "Authenticated upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

drop policy if exists "Authenticated update post images" on storage.objects;
create policy "Authenticated update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images');

drop policy if exists "Authenticated delete post images" on storage.objects;
create policy "Authenticated delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');

-- ------------------------------------------------------------
-- Notes
-- ------------------------------------------------------------
-- 1. Create your admin user via Supabase Dashboard > Authentication > Users > Add user
--    (or use sign-up once, then disable public sign-ups in Auth settings).
-- 2. This schema treats ANY authenticated user as an admin. If you need multiple
--    permission levels, add a `profiles` table with a `role` column and update
--    the policies above to check it.
