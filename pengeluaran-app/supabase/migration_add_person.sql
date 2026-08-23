-- =====================================================
-- Migrasi: tambah kolom "person" (Piggy / Cow) ke transaksi
-- Jalankan ini di Supabase SQL Editor (New Query > paste > Run)
-- Aman dijalankan meskipun sudah ada data transaksi —
-- data lama akan punya person kosong (NULL), tidak terhapus.
-- =====================================================

alter table transactions
  add column if not exists person text check (person in ('piggy', 'cow'));
