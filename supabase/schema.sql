create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key references auth.users on delete cascade,
  email text,
  name text not null,
  role text not null,
  experience text not null,
  industries text[] not null default '{}',
  work_ethic text not null,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

create policy "Profiles are readable by authenticated users" on users
  for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their profile" on users
  for insert
  with check (auth.uid() = id);

create policy "Users can update their profile" on users
  for update
  using (auth.uid() = id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  industry text not null,
  created_by uuid,
  created_by_name text,
  roles_needed jsonb not null default '[]'::jsonb,
  team_size int not null default 4,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "Projects are readable by authenticated users" on projects
  for select
  using (auth.role() = 'authenticated');

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  project jsonb not null,
  members jsonb not null,
  match_score int not null default 0,
  match_reason text not null default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  completed_by uuid
);

alter table teams enable row level security;

create policy "Teams are readable by authenticated users" on teams
  for select
  using (auth.role() = 'authenticated');

create policy "Teams can be inserted by authenticated users" on teams
  for insert
  with check (auth.role() = 'authenticated');

create policy "Teams can be updated by authenticated users" on teams
  for update
  using (auth.role() = 'authenticated');
