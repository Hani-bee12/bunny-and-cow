-- =====================================================
-- Migrasi: Aset (saldo awal Tabungan/Investasi) & Goals
-- Jalankan di Supabase SQL Editor. Aman untuk data yang sudah ada.
-- =====================================================

-- Saldo awal per kategori alokasi (Tabungan, Investasi) —
-- nilai tabungan/investasi kamu SEBELUM mulai pakai aplikasi ini.
create table if not exists starting_balances (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade unique,
  amount numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table starting_balances enable row level security;
create policy "public full access starting_balances" on starting_balances for all using (true) with check (true);

-- Goals: tabungan khusus terpisah dari Tabungan/Investasi umum
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '🎯',
  color text not null default '#6C5CE7',
  target_amount numeric not null,
  target_date date not null,
  starting_amount numeric not null default 0,
  current_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table goals enable row level security;
create policy "public full access goals" on goals for all using (true) with check (true);
