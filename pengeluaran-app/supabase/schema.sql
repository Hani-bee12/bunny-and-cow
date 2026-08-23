-- =====================================================
-- Skema database untuk Aplikasi Pengeluaran & Pemasukan
-- Jalankan seluruh file ini di Supabase SQL Editor
-- (Dashboard Supabase > SQL Editor > New Query > paste > Run)
-- =====================================================

-- Hapus tabel lama kalau mau reset (opsional, hati-hati saat sudah ada data)
-- drop table if exists transactions, subcategories, categories, wallets cascade;

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default '💰',
  color text not null default '#B0AEC7',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('expense', 'income')),
  color text not null default '#B0AEC7',
  icon text not null default '✨',
  is_allocation boolean not null default false,
  has_subcategory boolean not null default false,
  budget_amount numeric,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('expense', 'income')),
  person text check (person in ('piggy', 'cow')),
  amount numeric not null check (amount > 0),
  date date not null default current_date,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  wallet_id uuid references wallets(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_transactions_category on transactions(category_id);
create index if not exists idx_transactions_wallet on transactions(wallet_id);

-- =====================================================
-- Row Level Security: dibuka publik (tanpa login/password)
-- sesuai kebutuhan — hanya kamu & suami yang tahu link app-nya.
-- Kalau nanti mau ditambah proteksi, ini bisa diperketat.
-- =====================================================
alter table wallets enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table transactions enable row level security;

create policy "public full access wallets" on wallets for all using (true) with check (true);
create policy "public full access categories" on categories for all using (true) with check (true);
create policy "public full access subcategories" on subcategories for all using (true) with check (true);
create policy "public full access transactions" on transactions for all using (true) with check (true);

-- =====================================================
-- Data awal: dompet
-- =====================================================
insert into wallets (name, icon, color) values
  ('Cash', '💵', '#4CAF7D'),
  ('Bank', '🏦', '#4FA8E0'),
  ('E-Wallet', '📱', '#F5C445')
on conflict do nothing;

-- =====================================================
-- Data awal: kategori pengeluaran
-- =====================================================
insert into categories (name, type, color, icon, is_allocation, has_subcategory, sort_order) values
  ('Kebutuhan Pokok', 'expense', '#4CAF7D', '🏠', false, false, 1),
  ('Makan di Luar',   'expense', '#FF9F45', '🍽️', false, false, 2),
  ('Transportasi',    'expense', '#4FA8E0', '🚗', false, false, 3),
  ('Belanja',         'expense', '#F45B9E', '🛍️', false, true,  4),
  ('Hiburan',         'expense', '#9B7EDE', '🎉', false, false, 5),
  ('Kesehatan',       'expense', '#FF7A9C', '💊', false, false, 6),
  ('Kecantikan',      'expense', '#E754C2', '💄', false, false, 7),
  ('Pendidikan',      'expense', '#F5C445', '🎓', false, false, 8),
  ('Cicilan',         'expense', '#7C8DB5', '📄', false, false, 9),
  ('Tagihan',         'expense', '#6E7FA3', '🧾', false, false, 10),
  ('Sosial',          'expense', '#FF8B6A', '🤝', false, false, 11),
  ('Tabungan',        'expense', '#2FBF9F', '🌱', true,  false, 12),
  ('Investasi',       'expense', '#1FA98A', '📈', true,  false, 13),
  ('Lainnya',         'expense', '#B0AEC7', '✨', false, false, 14)
on conflict do nothing;

-- =====================================================
-- Data awal: kategori pemasukan
-- =====================================================
insert into categories (name, type, color, icon, is_allocation, has_subcategory, sort_order) values
  ('THP',              'income', '#34B87A', '💼', false, false, 1),
  ('Perjalanan Dinas', 'income', '#4FA8E0', '✈️', false, false, 2),
  ('Insentif',         'income', '#FFB648', '⭐', false, false, 3),
  ('THR',              'income', '#FF6F91', '🎁', false, false, 4),
  ('Return Investasi', 'income', '#2FBF9F', '📈', false, false, 5),
  ('Hadiah',           'income', '#C67EF0', '🎀', false, false, 6),
  ('Lainnya',          'income', '#B0AEC7', '✨', false, false, 7)
on conflict do nothing;

-- =====================================================
-- Data awal: subkategori Belanja
-- =====================================================
insert into subcategories (category_id, name, sort_order)
select id, sub.name, sub.sort_order
from categories, (values
  ('Self Fulfillment', 1),
  ('Rumah', 2),
  ('Kendaraan', 3)
) as sub(name, sort_order)
where categories.name = 'Belanja' and categories.type = 'expense'
on conflict do nothing;
