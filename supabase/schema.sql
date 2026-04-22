create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  nickname varchar(20) not null,
  score integer not null,
  created_at timestamptz not null default now()
);

create index if not exists scores_leaderboard_idx
  on scores (score desc, created_at asc);

alter table scores enable row level security;

create policy "scores_read" on scores
  for select using (true);

create policy "scores_insert" on scores
  for insert with check (
    length(nickname) between 1 and 20
    and score >= 0
  );
