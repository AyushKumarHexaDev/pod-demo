-- Run this once in Supabase: SQL Editor -> New query -> Run
create extension if not exists pgcrypto;

create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topic text,
  created_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  user_name text not null,
  body text not null check (char_length(body) <= 1000),
  created_at timestamptz default now()
);
create index on messages (room_id, created_at);

alter table rooms enable row level security;
alter table messages enable row level security;

-- Demo policies: anyone can read and write. Replace with auth-based rules before real use.
create policy "demo read rooms" on rooms for select using (true);
create policy "demo create rooms" on rooms for insert with check (true);
create policy "demo read messages" on messages for select using (true);
create policy "demo send messages" on messages for insert with check (true);

alter publication supabase_realtime add table rooms, messages;
