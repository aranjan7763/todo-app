-- Run this in the Supabase SQL Editor to set up the todos table

create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own todos
alter table todos enable row level security;

create policy "Users can view own todos" on todos
  for select using (auth.uid() = user_id);
create policy "Users can insert own todos" on todos
  for insert with check (auth.uid() = user_id);
create policy "Users can update own todos" on todos
  for update using (auth.uid() = user_id);
create policy "Users can delete own todos" on todos
  for delete using (auth.uid() = user_id);

-- =============================================
-- PROFILES TABLE
-- =============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  avatar_url text,
  tagline text,
  about text,
  city text,
  country text,
  twitter text,
  facebook text,
  instagram text,
  linkedin text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users
insert into profiles (id)
select id from auth.users where id not in (select id from profiles);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null default '#667eea',
  created_at timestamptz default now()
);

alter table categories enable row level security;

create policy "Users can view own categories" on categories
  for select using (auth.uid() = user_id);
create policy "Users can insert own categories" on categories
  for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on categories
  for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on categories
  for delete using (auth.uid() = user_id);

-- =============================================
-- ADD category_id TO TODOS
-- =============================================
alter table todos add column category_id uuid references categories(id) on delete set null;

-- =============================================
-- STORAGE BUCKET FOR AVATARS
-- =============================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "Users can upload own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Anyone can view avatars" on storage.objects
  for select using (bucket_id = 'avatars');
