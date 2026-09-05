-- Nexo's canonical, re-runnable database baseline.
-- Apply this migration before deploying the frontend that depends on it.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create type public.task_priority as enum ('Low', 'Medium', 'High');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('To Do', 'Done');
exception when duplicate_object then null;
end $$;

create table if not exists public.notes (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null default '',
  content text not null default '',
  tags text[] not null default '{}',
  is_pinned boolean not null default false,
  last_modified bigint not null default 0,
  time_spent integer not null default 0,
  is_public boolean not null default false,
  published_at bigint,
  slug text,
  is_blog boolean not null default false,
  version integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) stored,
  primary key (id, user_id)
);

create table if not exists public.tasks (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null default '',
  description text not null default '',
  priority public.task_priority not null default 'Medium',
  due_date varchar(50) not null default '',
  status public.task_status not null default 'To Do',
  created_at_ts bigint not null default 0,
  last_modified bigint not null default 0,
  time_spent integer not null default 0,
  version integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fts tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored,
  primary key (id, user_id)
);

create table if not exists public.focus_sessions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  start_time bigint not null,
  end_time bigint not null,
  duration integer not null,
  target_id text,
  target_type text,
  session_date text not null,
  hour integer not null,
  created_at timestamptz not null default now(),
  primary key (id, user_id)
);

-- Bring existing installations up to the same shape.
alter table public.notes add column if not exists version integer not null default 0;
alter table public.notes add column if not exists deleted_at timestamptz;
alter table public.tasks add column if not exists version integer not null default 0;
alter table public.tasks add column if not exists deleted_at timestamptz;
alter table public.tasks add column if not exists last_modified bigint not null default 0;
update public.tasks set last_modified = created_at_ts where last_modified = 0;

alter table public.profiles enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can insert their own profile" on public.profiles for insert with check ((select auth.uid()) = id);

drop policy if exists "Users can view their own notes" on public.notes;
drop policy if exists "Users can insert their own notes" on public.notes;
drop policy if exists "Users can update their own notes" on public.notes;
drop policy if exists "Users can delete their own notes" on public.notes;
drop policy if exists "Anyone can view public notes" on public.notes;
create policy "Users can view their own notes" on public.notes for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own notes" on public.notes for insert with check ((select auth.uid()) = user_id);
create policy "Users can update their own notes" on public.notes for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own notes" on public.notes for delete using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can view their own tasks" on public.tasks for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own tasks" on public.tasks for insert with check ((select auth.uid()) = user_id);
create policy "Users can update their own tasks" on public.tasks for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own tasks" on public.tasks for delete using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own sessions" on public.focus_sessions;
drop policy if exists "Users can insert their own sessions" on public.focus_sessions;
drop policy if exists "Users can delete their own sessions" on public.focus_sessions;
create policy "Users can view their own sessions" on public.focus_sessions for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own sessions" on public.focus_sessions for insert with check ((select auth.uid()) = user_id);
create policy "Users can delete their own sessions" on public.focus_sessions for delete using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- A delayed client must never overwrite a newer version from another device.
create or replace function public.reject_stale_sync_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.version < old.version or (new.version = old.version and new.last_modified <= old.last_modified) then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists reject_stale_note_write on public.notes;
create trigger reject_stale_note_write before update on public.notes
  for each row execute function public.reject_stale_sync_write();
drop trigger if exists reject_stale_task_write on public.tasks;
create trigger reject_stale_task_write before update on public.tasks
  for each row execute function public.reject_stale_sync_write();

-- This narrow RPC is the only anonymous read path. It never exposes user IDs,
-- timestamps used by sync internals, private records, or deleted tombstones.
drop view if exists public.public_notes;
create or replace function public.get_public_note(p_note_id text)
returns table (
  id text,
  title varchar,
  content text,
  tags text[],
  is_pinned boolean,
  last_modified bigint,
  time_spent integer,
  is_public boolean,
  published_at bigint,
  slug text,
  is_blog boolean,
  version integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select n.id, n.title, n.content, n.tags, n.is_pinned, n.last_modified,
    n.time_spent, n.is_public, n.published_at, n.slug, n.is_blog, n.version
  from public.notes as n
  where n.id = p_note_id and n.is_public = true and n.deleted_at is null
  limit 1;
$$;

revoke all on function public.get_public_note(text) from public;
grant execute on function public.get_public_note(text) to anon, authenticated;
revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, delete on public.focus_sessions to authenticated;
grant select, insert, update on public.profiles to authenticated;

create index if not exists notes_fts_idx on public.notes using gin (fts);
create index if not exists tasks_fts_idx on public.tasks using gin (fts);
create index if not exists idx_notes_user on public.notes(user_id);
create index if not exists idx_tasks_user on public.tasks(user_id);
create index if not exists idx_focus_sessions_user on public.focus_sessions(user_id);
create index if not exists idx_notes_last_modified on public.notes(user_id, last_modified);
create index if not exists idx_tasks_last_modified on public.tasks(user_id, last_modified);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes') then
    alter publication supabase_realtime add table public.notes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tasks') then
    alter publication supabase_realtime add table public.tasks;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'focus_sessions') then
    alter publication supabase_realtime add table public.focus_sessions;
  end if;
end $$;
