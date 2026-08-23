-- =====================================================
-- Migrasi: tambah kolom budget bulanan (opsional) ke kategori
-- Jalankan di Supabase SQL Editor. Aman untuk data yang sudah ada —
-- semua kategori akan punya budget_amount = NULL (artinya "tanpa budget")
-- sampai kamu isi sendiri lewat tab Pengaturan di aplikasi.
-- =====================================================

alter table categories
  add column if not exists budget_amount numeric;
