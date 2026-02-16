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
