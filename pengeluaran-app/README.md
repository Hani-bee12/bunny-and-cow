# 🐷 Catatan Kami — App Pengeluaran & Pemasukan

Aplikasi pencatatan pengeluaran & pemasukan bulanan, dibuat colorful & imut, bisa diakses
kamu dan suami dari mana saja lewat link Netlify. Data tersimpan di Supabase (database
gratis), jadi bukan cuma tersimpan di satu HP/browser.

## ✨ Fitur

- Catat pemasukan & pengeluaran dengan kategori, subkategori (khusus Belanja), dompet, dan catatan
- Kategori Tabungan & Investasi otomatis ditandai sebagai **Alokasi** — dipisah dari pengeluaran konsumtif di ringkasan
- Dashboard bulanan: total pemasukan, pengeluaran konsumtif, alokasi, dan sisa saldo
- Grafik donat breakdown pengeluaran per kategori
- Saldo per dompet (Cash / Bank / E-Wallet, bisa tambah sendiri)
- Riwayat transaksi dengan filter (tipe, kategori, dompet, konsumtif/alokasi)
- Kelola kategori & subkategori sendiri (tambah/hapus, pilih ikon & warna)
- Tanpa login/password — cukup share link Netlify ke suami

## 🧱 Struktur Project

```
pengeluaran-app/
  supabase/schema.sql   ← jalankan ini di Supabase SQL Editor
  src/                  ← source code React
  .env.example          ← contoh isi file .env
  netlify.toml          ← konfigurasi deploy Netlify
```

## 🚀 Setup (sekali saja)

### 1. Buat project Supabase (gratis)

1. Buka [supabase.com](https://supabase.com) → Sign up / Login → **New Project**.
2. Kasih nama bebas (mis. "catatan-kami"), pilih region terdekat (Singapore), set password database (simpan baik-baik, tapi tidak dipakai lagi setelah ini).
3. Tunggu ~2 menit sampai project selesai dibuat.

### 2. Jalankan skema database

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon di sidebar kiri) → **New query**.
2. Buka file `supabase/schema.sql` di project ini, copy semua isinya, paste ke SQL Editor.
3. Klik **Run**. Ini akan membuat tabel `wallets`, `categories`, `subcategories`, `transactions`,
   plus mengisi kategori & dompet awal (Kebutuhan Pokok, Makan di Luar, Belanja, dst).

### 3. Ambil API key

1. Di dashboard Supabase, buka **Project Settings** (ikon gear) → **API**.
2. Salin dua nilai ini:
   - **Project URL** (bentuknya `https://xxxxx.supabase.co`)
   - **anon public** key (di bagian Project API keys)

### 4. Konfigurasi lokal (untuk coba dulu di komputer)

1. Copy `.env.example` jadi `.env`:
   ```
   cp .env.example .env
   ```
2. Isi `.env` dengan Project URL & anon key dari langkah 3.
3. Install dependencies & jalankan:
   ```
   npm install
   npm run dev
   ```
4. Buka link yang muncul di terminal (biasanya `http://localhost:5173`).

### 5. Deploy ke Netlify

**Cara termudah (drag & drop):**
1. Jalankan `npm run build` — ini akan membuat folder `dist/`.
2. Buka [app.netlify.com](https://app.netlify.com) → Sign up/login → **Add new site** → **Deploy manually**.
3. Drag folder `dist` ke area upload.
4. Setelah live, buka **Site settings → Environment variables**, tambahkan:
   - `VITE_SUPABASE_URL` = Project URL kamu
   - `VITE_SUPABASE_ANON_KEY` = anon key kamu
5. Karena env variable baru ditambah setelah deploy manual, **build ulang secara lokal**
   (`npm run build`) lalu drag folder `dist` sekali lagi supaya env-nya kepakai — atau gunakan
   cara GitHub di bawah supaya Netlify yang build otomatis.

**Cara yang lebih sustain (lewat GitHub, direkomendasikan):**
1. Push folder project ini ke repository GitHub baru.
2. Di Netlify: **Add new site → Import an existing project → GitHub**, pilih repo-nya.
3. Build command: `npm run build`, Publish directory: `dist` (sudah otomatis lewat `netlify.toml`).
4. Di **Site settings → Environment variables**, tambahkan `VITE_SUPABASE_URL` dan
   `VITE_SUPABASE_ANON_KEY` seperti di atas, lalu **Deploy site**.
5. Setiap kali ada perubahan kode di GitHub, Netlify otomatis build ulang. Ini juga jadi
   backup kode kamu, jadi lebih tahan lama / sustain.

Setelah selesai, kamu akan dapat link seperti `https://nama-app-kamu.netlify.app` —
share link ini ke suami, langsung bisa dipakai bareng tanpa perlu login.

## 🔒 Catatan soal keamanan

Karena kamu minta tanpa password, database diset supaya bisa diakses siapa saja yang
punya link app-nya (data tidak dilindungi login). Ini aman selama link Netlify-nya tidak
disebar ke publik. Kalau nanti berubah pikiran dan mau ditambah proteksi (misal password
sederhana), tinggal bilang — bisa ditambahkan belakangan tanpa mengubah struktur data.

## 🛠️ Kalau mau ubah kategori/warna/ikon lewat kode

Kategori awal ada di `supabase/schema.sql`. Tapi setelah app jalan, kategori & subkategori
juga bisa ditambah/dihapus langsung dari tab **Pengaturan** di dalam aplikasinya — tidak
perlu sentuh database manual lagi.
