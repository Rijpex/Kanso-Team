/** Databaseschema. Alles is idempotent: opnieuw draaien kan altijd. */
/** Ophogen bij elke schemawijziging: de app werkt de database dan zelf bij. */
export const SCHEMA_VERSION = 3;

export const SCHEMA_SQL = `
create extension if not exists pgcrypto;

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null,
  name          text not null,
  role          text not null default 'intern' check (role in ('admin','intern')),
  password_hash text not null,
  lang          text not null default 'de' check (lang in ('de','nl')),
  color         text not null default '#7a6a4f',
  active        boolean not null default true,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now()
);
create unique index if not exists users_username_idx on users (lower(username));

create table if not exists sessions (
  token       text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  expires_at  timestamptz not null
);

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  note        text,
  date        date not null,
  end_date    date,
  start_time  time,
  end_time    time,
  kind        text not null default 'event',
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists events_date_idx on events (date);

create table if not exists shifts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  date         date not null,
  kind         text not null default 'shop' check (kind in ('shop','home','school','off')),
  start_time   time,
  end_time     time,
  break_start  time,
  break_end    time,
  note         text,
  unique (user_id, date)
);
create index if not exists shifts_date_idx on shifts (date);

create table if not exists cleaning_tasks (
  id        uuid primary key default gen_random_uuid(),
  title_de  text not null,
  title_nl  text,
  freq      text not null default 'daily' check (freq in ('daily','weekly')),
  weekday   int,
  moment    text not null default 'close' check (moment in ('open','day','close')),
  zone      text check (zone in ('a','b')),
  position  int not null default 0,
  active    boolean not null default true
);

create table if not exists cleaning_checks (
  task_id     uuid not null references cleaning_tasks(id) on delete cascade,
  date        date not null,
  user_id     uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (task_id, date)
);

create table if not exists tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text not null default 'shop',
  status       text not null default 'todo' check (status in ('todo','doing','review','done')),
  due          date,
  home_ok      boolean not null default false,
  created_by   uuid references users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists task_assignees (
  task_id  uuid not null references tasks(id) on delete cascade,
  user_id  uuid not null references users(id) on delete cascade,
  primary key (task_id, user_id)
);

create table if not exists task_checklist (
  id        uuid primary key default gen_random_uuid(),
  task_id   uuid not null references tasks(id) on delete cascade,
  text      text not null,
  done      boolean not null default false,
  position  int not null default 0
);

create table if not exists questions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  title       text not null,
  body        text,
  status      text not null default 'open' check (status in ('open','answered')),
  urgency     text not null default 'checkin' check (urgency in ('checkin','today','now')),
  created_at  timestamptz not null default now()
);

create table if not exists comments (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid references tasks(id) on delete cascade,
  question_id  uuid references questions(id) on delete cascade,
  idea_id      uuid,
  user_id      uuid references users(id) on delete set null,
  body         text not null,
  created_at   timestamptz not null default now()
);
create index if not exists comments_task_idx on comments (task_id, created_at);
create index if not exists comments_question_idx on comments (question_id, created_at);

create table if not exists files (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid references tasks(id) on delete cascade,
  storage       text not null default 'db',
  storage_path  text,
  data          bytea,
  name          text not null,
  size          bigint not null default 0,
  mime_type     text,
  uploaded_by   uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists files_task_idx on files (task_id);

create table if not exists kb_pages (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  category  text not null default 'shop',
  title_de  text not null,
  title_nl  text,
  body_de   text not null default '',
  body_nl   text,
  position  int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists onboarding_items (
  id        uuid primary key default gen_random_uuid(),
  day       int not null,
  position  int not null default 0,
  title_de  text not null,
  title_nl  text,
  hint_de   text,
  hint_nl   text,
  with_whom text
);

create table if not exists onboarding_checks (
  item_id     uuid not null references onboarding_items(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (item_id, user_id)
);

create table if not exists ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete set null,
  name        text not null,
  supplier    text,
  link        text,
  ek          numeric(10,2),
  vk          numeric(10,2),
  vat         numeric(4,2) not null default 19,
  moq         int,
  packaging   text,
  why         text,
  status      text not null default 'idea' check (status in ('idea','research','discuss','approved','rejected')),
  created_at  timestamptz not null default now()
);

create table if not exists content_items (
  id          uuid primary key default gen_random_uuid(),
  date        date,
  kind        text not null default 'reel' check (kind in ('reel','story','post')),
  title       text not null,
  idea        text,
  status      text not null default 'idea' check (status in ('idea','filmed','edited','approved','posted')),
  owner_id    uuid references users(id) on delete set null,
  pillar      text,
  link        text,
  created_at  timestamptz not null default now()
);

-- Wochenfokus: maximal drei Punkte pro Woche
create table if not exists focus (
  id          uuid primary key default gen_random_uuid(),
  week        date not null,
  text        text not null,
  done_by     uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists focus_week_idx on focus (week);

-- Markentagebuch: Kundensätze und Zähler für Online-Anfragen
create table if not exists journal (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  kind        text not null check (kind in ('quote','online')),
  text        text,
  user_id     uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists journal_date_idx on journal (date);

create table if not exists settings (
  key    text primary key,
  value  jsonb not null
);

-- Alles loopt via de server; de publieke Supabase-API mag nergens bij.
do $$
declare t text;
begin
  foreach t in array array['users','sessions','events','shifts','cleaning_tasks','cleaning_checks','tasks','task_assignees',
    'task_checklist','questions','comments','files','kb_pages','onboarding_items','onboarding_checks','ideas','content_items','settings','focus','journal'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- ───────── Versie 2 ─────────
-- Werkblokken: een opdracht ingepland in de agenda
create table if not exists task_plans (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  date        date not null,
  start_time  time,
  end_time    time,
  note        text,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists task_plans_date_idx on task_plans (date);
create index if not exists task_plans_task_idx on task_plans (task_id);

alter table content_items add column if not exists brand text;

-- Instagram-cijfers (handmatig ingevuld) en maanddoelen
create table if not exists social_stats (
  id            uuid primary key default gen_random_uuid(),
  date          date not null unique,
  followers     int,
  reach         int,
  interactions  int,
  profile_visits int,
  note          text,
  user_id       uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create table if not exists social_goals (
  month         date primary key,
  followers     int,
  reach         int,
  interactions  int,
  posts         int,
  stories       int,
  note          text,
  updated_by    uuid references users(id) on delete set null
);

alter table ideas add column if not exists world text;
alter table ideas add column if not exists occasion text;
alter table ideas add column if not exists extra_cost numeric(10,2);
alter table ideas add column if not exists online_price numeric(10,2);
alter table ideas add column if not exists lead_time text;
alter table ideas add column if not exists season text;
alter table ideas add column if not exists checks text[] not null default '{}';
alter table ideas add column if not exists sample boolean not null default false;
create index if not exists comments_idea_idx on comments (idea_id, created_at);

-- Wochenrückblick (Lerntagebuch): nur für die Autorin und die Admins sichtbar
create table if not exists reflections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  week        date not null,
  learned     text,
  liked       text,
  hard        text,
  next        text,
  mood        int check (mood between 1 and 5),
  feedback    text,
  feedback_by uuid references users(id) on delete set null,
  feedback_at timestamptz,
  updated_at  timestamptz not null default now(),
  unique (user_id, week)
);

-- Lernziele / Kompetenzen
create table if not exists skills (
  id        uuid primary key default gen_random_uuid(),
  area      text not null,
  title_de  text not null,
  title_nl  text,
  position  int not null default 0
);
create table if not exists skill_levels (
  skill_id     uuid not null references skills(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  level        int not null default 0 check (level between 0 and 3),
  confirmed    int not null default 0 check (confirmed between 0 and 3),
  confirmed_by uuid references users(id) on delete set null,
  updated_at   timestamptz not null default now(),
  primary key (skill_id, user_id)
);

-- Abwesenheit: frei, Schule/Prüfung, krank
create table if not exists absences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  date        date not null,
  end_date    date,
  kind        text not null default 'free' check (kind in ('free','school','sick','other')),
  note        text,
  status      text not null default 'requested' check (status in ('requested','approved','declined')),
  decided_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['task_plans','social_stats','social_goals','reflections','skills','skill_levels','absences'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Versie 3: vaste dagpunten (Tag geplant, Story gepostet …), gedeeld per dag
create table if not exists daily_checks (
  date        date not null,
  key         text not null,
  user_id     uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  primary key (date, key)
);
alter table daily_checks enable row level security;

-- Privé opslag voor bestanden (alleen op Supabase aanwezig)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('team-hub', 'team-hub', false, 524288000)
    on conflict (id) do nothing;
  end if;
end $$;
`;
