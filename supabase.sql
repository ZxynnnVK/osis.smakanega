create table if not exists public.aspirations (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('Kritik','Saran')),
  name text,
  message text not null check (char_length(message) between 1 and 600),
  status text not null default 'pending' check (status in ('pending','responded')),
  created_at timestamptz not null default now()
);
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.aspirations enable row level security;
alter table public.admin_users enable row level security;

create policy "public can submit aspirations"
on public.aspirations for insert to anon
with check (kind in ('Kritik','Saran') and char_length(message) between 1 and 600
  and (name is null or char_length(name) <= 60));

create policy "public can read pending aspirations"
on public.aspirations for select to anon
using (status = 'pending');

create policy "admins can read all aspirations"
on public.aspirations for select to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admins can mark aspirations responded"
on public.aspirations for update to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create policy "admins can verify own admin access"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

-- SETUP AKUN PENGURUS:
-- 1. Buat akun pengurus melalui Supabase Dashboard > Authentication > Users.
-- 2. Salin UUID akun pengurus.
-- 3. Jalankan perintah berikut di SQL Editor, ganti UUID-nya:
-- insert into public.admin_users (user_id) values ('UUID-AKUN-PENGURUS');

-- Aktifkan Realtime untuk tabel aspirations:
-- Supabase Dashboard > Database > Publications > supabase_realtime > aspirations.
-- Jangan pernah menaruh service_role key di JavaScript/browser.
