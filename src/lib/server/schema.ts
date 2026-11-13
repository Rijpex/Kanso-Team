/** Databaseschema. Alles is idempotent: opnieuw draaien kan altijd. */
/** Ophogen bij elke schemawijziging: de app werkt de database dan zelf bij. */
export const SCHEMA_VERSION = 17;

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

-- Versie 4: Öffnungszeiten in den Wissen-Seiten korrigieren (nur wenn der alte Text noch drinsteht)
update kb_pages set body_de = replace(body_de, 'Dienstag–Freitag 10:30–18:30, Samstag 10:30–17:00, Montag geschlossen.', 'Dienstag 10:30–18:30, Mittwoch 09:30–17:30, Donnerstag 10:30–18:30, Freitag 10:30–17:30, Samstag 09:30–16:00, Montag geschlossen. Wir sind jeweils 30 Minuten vor Öffnung da.'), updated_at = now() where body_de like '%Dienstag–Freitag 10:30–18:30, Samstag 10:30–17:00%';
update kb_pages set body_de = replace(replace(body_de, '- **10:00** – Ankommen, Licht, Musik leise', '- **30 Minuten vor Öffnung** – Ankommen, Licht, Musik leise'), '- **10:30** – Tür auf.', '- **Öffnung** (Di/Do 10:30, Mi/Sa 09:30, Fr 10:30) – Tür auf.'), updated_at = now() where body_de like '%- **10:00** – Ankommen%';


-- Versie 5: zweite Pause, Kundenfragen (ersetzt "Kundenstimmen"), Öffnungszeiten-Sonntage
alter table shifts add column if not exists break2_start time;
alter table shifts add column if not exists break2_end time;

create table if not exists customer_requests (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  kind          text not null default 'question' check (kind in ('question','wish','complaint','quote')),
  text          text not null,
  product       text,
  answer        text,
  action_needed boolean not null default false,
  action_note   text,
  status        text not null default 'open' check (status in ('open','done')),
  user_id       uuid references users(id) on delete set null,
  done_by       uuid references users(id) on delete set null,
  done_at       timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists customer_requests_date_idx on customer_requests (date);
alter table customer_requests enable row level security;
-- Alte Kundensätze übernehmen (einmalig)
insert into customer_requests (id, date, kind, text, user_id, status, created_at)
  select id, date, 'quote', text, user_id, 'done', created_at from journal where kind = 'quote' and text is not null
  on conflict (id) do nothing;

-- Versie 5: Schreibweise "Kanso" ohne Makron, auch in bereits gespeicherten Texten
update kb_pages set title_de = replace(replace(title_de,'ō','o'),'Ō','O'), body_de = replace(replace(body_de,'ō','o'),'Ō','O'), title_nl = replace(replace(title_nl,'ō','o'),'Ō','O'), body_nl = replace(replace(body_nl,'ō','o'),'Ō','O') where title_de ~ '[ōŌ]' or body_de ~ '[ōŌ]' or title_nl ~ '[ōŌ]' or body_nl ~ '[ōŌ]';
update tasks set title = replace(replace(title,'ō','o'),'Ō','O'), description = replace(replace(description,'ō','o'),'Ō','O') where title ~ '[ōŌ]' or description ~ '[ōŌ]';
update onboarding_items set title_de = replace(replace(title_de,'ō','o'),'Ō','O'), hint_de = replace(replace(hint_de,'ō','o'),'Ō','O') where title_de ~ '[ōŌ]' or hint_de ~ '[ōŌ]';
update skills set title_de = replace(replace(title_de,'ō','o'),'Ō','O') where title_de ~ '[ōŌ]';
update events set title = replace(replace(title,'ō','o'),'Ō','O') where title ~ '[ōŌ]';

-- Versie 6: Praktikantinnen beginnen zur Öffnung (nicht 30 Minuten vorher).
-- Einmalig: nur Standard-Startzeiten (Di/Do/Fr 10:00, Mi/Sa 09:00) ab heute um 30 Minuten verschieben; manuelle Änderungen bleiben.
do $$
begin
  if not exists (select 1 from settings where key = 'mig_intern_start_at_opening') then
    update shifts s set start_time = (s.start_time + interval '30 minutes')::time
      from users u
     where u.id = s.user_id and u.role = 'intern' and s.kind = 'shop' and s.date >= current_date
       and ((extract(isodow from s.date) in (2,4,5) and s.start_time = '10:00') or (extract(isodow from s.date) in (3,6) and s.start_time = '09:00'));
    insert into settings (key, value) values ('mig_intern_start_at_opening', 'true'::jsonb);
  end if;
end $$;

-- Versie 7: TikTok neben Instagram, Kanal pro Beitrag, Wochenziel 4 Storys
alter table social_stats add column if not exists tt_followers int;
alter table social_stats add column if not exists tt_reach int;
alter table social_stats add column if not exists tt_interactions int;
alter table social_goals add column if not exists tt_followers int;
alter table social_goals add column if not exists tt_reach int;
alter table content_items add column if not exists channel text not null default 'both';
do $$
begin
  if not exists (select 1 from settings where key = 'mig_goal_4_stories') then
    update social_goals set stories = 4 where stories is null or stories = 7;
    insert into settings (key, value) values ('mig_goal_4_stories', 'true'::jsonb);
  end if;
end $$;

-- Versie 8: Praktikumsstunden sauber zählen (Ziel 900 Stunden pro Praktikantin)
alter table users add column if not exists start_date date;       -- Beginn des Praktikums: ab hier wird gezählt
alter table users add column if not exists end_date date;         -- geplantes Ende
alter table users add column if not exists target_hours int;      -- Stundenziel (Standard 900)
alter table users add column if not exists before_minutes int not null default 0; -- Stunden vor dem Hub, von Hand eingetragen
alter table shifts add column if not exists worked_minutes int;   -- Korrektur: tatsächlich gearbeitete Minuten an diesem Tag
update users set target_hours = 900 where role = 'intern' and target_hours is null;
do $$
begin
  if not exists (select 1 from settings where key = 'mig_internship_start') then
    update users u set start_date = x.d
      from (select user_id, min(date) as d from shifts where kind in ('shop','home') group by user_id) x
     where x.user_id = u.id and u.role = 'intern' and u.start_date is null;
    insert into settings (key, value) values ('mig_internship_start', 'true'::jsonb);
  end if;
end $$;

-- Versie 9: der Laden ist jetzt auch montags offen (10:30–18:30) und alle arbeiten
-- von 30 Minuten vor Öffnung bis Ladenschluss. Einmalig den schon gefüllten Dienstplan ab 09.11.2026 anpassen.
do $$
declare last_day date;
begin
  if not exists (select 1 from settings where key = 'mig_monday_open') then
    select max(date) into last_day from shifts;
    -- Standard-Startzeiten der Praktikantinnen eine halbe Stunde nach vorn
    update shifts s set start_time = '10:00'
      from users u where u.id = s.user_id and u.role = 'intern' and s.kind = 'shop'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) in (2,4) and s.start_time = '10:30';
    update shifts s set start_time = '09:00'
      from users u where u.id = s.user_id and u.role = 'intern' and s.kind = 'shop'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 3 and s.start_time = '09:30';
    update shifts s set start_time = '09:00'
      from users u where u.id = s.user_id and u.role = 'intern' and s.kind = 'shop'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 6 and s.start_time = '09:30';
    -- Aus dem Homeoffice-Montag wird ein Ladentag mit zwei Pausen
    update shifts s set kind = 'shop', start_time = '10:00', end_time = '18:30',
           break_start = '11:00', break_end = '11:30', break2_start = '13:00', break2_end = '13:30'
      from users u where u.id = s.user_id and u.role = 'intern' and s.kind = 'home'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 1
       and s.start_time = '10:00' and s.end_time = '14:30';
    -- Bas und Lea stehen montags mit im Laden (nur wo noch nichts eingetragen ist)
    if last_day is not null then
      insert into shifts (user_id, date, kind, start_time, end_time)
      select u.id, d::date, 'shop', '10:00', '18:30'
        from users u cross join generate_series(date '2026-11-09', last_day, interval '7 days') d
       where u.role = 'admin' and u.active
      on conflict (user_id, date) do nothing;
    end if;
    update kb_pages set body_de = replace(body_de, 'Montag geschlossen', 'Montag 10:30–18:30'),
                        body_nl = replace(coalesce(body_nl, ''), 'maandag gesloten', 'maandag 10:30–18:30'),
                        updated_at = now()
     where body_de like '%Montag geschlossen%' or body_nl like '%maandag gesloten%';
    insert into settings (key, value) values ('mig_monday_open', 'true'::jsonb);
  end if;
end $$;

-- Versie 10: Rolle "Verkäufer" (Mathias), Projekt-Leads bei den Kundenfragen,
-- neue Öffnungszeiten ab 16.11.2026 (Fr und Sa bis 18:30), beide Praktikantinnen montags im Laden.
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('admin','intern','seller'));
alter table customer_requests drop constraint if exists customer_requests_kind_check;
alter table customer_requests add constraint customer_requests_kind_check check (kind in ('question','wish','complaint','quote','lead'));
do $$
begin
  if not exists (select 1 from settings where key = 'mig_v10_roster') then
    -- Ab 9.11.: Lea montags frei, Bas mittwochs frei (nur Standardeinträge; Vrij/School bleiben)
    update shifts s set kind = 'off', start_time = null, end_time = null, break_start = null, break_end = null, break2_start = null, break2_end = null
      from users u where u.id = s.user_id and u.role = 'admin' and u.name ilike 'Lea%'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 1 and s.kind = 'shop';
    update shifts s set kind = 'off', start_time = null, end_time = null, break_start = null, break_end = null, break2_start = null, break2_end = null
      from users u where u.id = s.user_id and u.role = 'admin' and u.name ilike 'Bas%'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 3 and s.kind = 'shop';
    -- Ab 9.11.: beide Praktikantinnen montags im Laden – nur in Wochen, in denen sie dienstags auch arbeiten
    update shifts s set kind = 'shop', start_time = '10:00', end_time = '18:30',
           break_start = '11:00', break_end = '11:30', break2_start = '13:00', break2_end = '13:30'
      from users u where u.id = s.user_id and u.role = 'intern'
       and s.date >= date '2026-11-09' and extract(isodow from s.date) = 1 and s.kind in ('off','home')
       and exists (select 1 from shifts t where t.user_id = s.user_id and t.date = s.date + 1 and t.kind = 'shop');
    -- Ab 16.11.: Freitag und Samstag bis 18:30 (Bas und Lea), Praktikantinnen samstags bis 17:30 (max. 8,5 Std. Anwesenheit)
    update shifts s set end_time = '18:30' from users u where u.id = s.user_id and u.role = 'admin'
       and s.date >= date '2026-11-16' and extract(isodow from s.date) = 5 and s.kind = 'shop' and s.end_time = '17:30';
    update shifts s set end_time = '18:30' from users u where u.id = s.user_id and u.role = 'admin'
       and s.date >= date '2026-11-16' and extract(isodow from s.date) = 6 and s.kind = 'shop' and s.end_time = '16:00';
    update shifts s set end_time = '17:30' from users u where u.id = s.user_id and u.role = 'intern'
       and s.date >= date '2026-11-16' and extract(isodow from s.date) = 6 and s.kind = 'shop' and s.end_time = '16:00';
    update kb_pages set body_de = replace(replace(body_de, 'Freitag 10:30–17:30, Samstag 09:30–16:00', 'Freitag 10:30–18:30, Samstag 09:30–18:30'), 'Fr 10:30–17:30 · Sa 09:30–16:00', 'Fr 10:30–18:30 · Sa 09:30–18:30'), updated_at = now()
     where body_de like '%Freitag 10:30–17:30, Samstag 09:30–16:00%' or body_de like '%Fr 10:30–17:30 · Sa 09:30–16:00%';
    insert into settings (key, value) values ('mig_v10_roster', 'true'::jsonb);
  end if;
end $$;

-- v11: keine festen Pausenzeiten mehr für die Praktikantinnen (sie legen ihre Stunde Pause selbst; die Zählung zieht 60 Minuten ab),
-- drei neue Storepflege-Punkte (Markisen, Kühlschrank, Fernseher im Schaufenster)
do $$
begin
  if not exists (select 1 from settings where key = 'mig_v11_breaks') then
    update shifts s set break_start = null, break_end = null, break2_start = null, break2_end = null
      from users u where u.id = s.user_id and u.role = 'intern'
       and coalesce(s.break_end - s.break_start, interval '0') + coalesce(s.break2_end - s.break2_start, interval '0') = interval '60 minutes';
    insert into cleaning_tasks (title_de, title_nl, freq, moment, position)
    select v.de, v.nl, 'daily', v.moment, (select coalesce(max(position), 0) from cleaning_tasks) + v.n
      from (values
        ('Markisen ausfahren', 'Markiezen uitdraaien', 'open', 1),
        ('Kühlschrank in der Ausstellungsküche einstecken (Licht an)', 'Koelkast in de showkeuken: stekker erin (licht aan)', 'open', 2),
        ('Fernseher im Schaufenster nach innen drehen', 'Tv in de etalage naar binnen draaien', 'open', 3),
        ('Markisen einfahren', 'Markiezen indraaien', 'close', 4),
        ('Kühlschrank in der Ausstellungsküche: Stecker ziehen', 'Koelkast in de showkeuken: stekker eruit', 'close', 5),
        ('Fernseher im Schaufenster nach außen drehen', 'Tv in de etalage naar buiten draaien', 'close', 6)
      ) as v(de, nl, moment, n)
     where not exists (select 1 from cleaning_tasks c where c.title_de = v.de);
    -- Verkäufer: Freitag und Samstag 14:30–18:30 ab 20.11.2026, 10 Wochen voraus (bestehende Einträge bleiben)
    insert into shifts (user_id, date, kind, start_time, end_time)
    select u.id, d::date, 'shop', '14:30', '18:30'
      from users u, generate_series(date '2026-11-20', date '2026-11-20' + interval '10 weeks', interval '1 day') d
     where u.role = 'seller' and u.active and extract(isodow from d) in (5, 6)
    on conflict (user_id, date) do nothing;
    insert into settings (key, value) values ('mig_v11_breaks', 'true'::jsonb);
  end if;
end $$;

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
