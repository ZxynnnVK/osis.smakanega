# Papan Aspirasi OSIS

Website papan aspirasi online berbasis HTML, CSS, JavaScript, dan Supabase.

## Yang sudah tersedia
- Form pengiriman kritik/saran, nama opsional (anonim).
- Mading cork-board dengan catatan seperti kertas ditempel.
- Filter Kritik dan Saran.
- Realtime untuk pesan baru.
- Status `pending` dan `responded`: pesan yang sudah ditanggapi tidak tampil lagi di mading publik.
- Halaman admin sebagai rancangan antarmuka moderasi.

## Setup database
1. Buat project di https://supabase.com.
2. Buka SQL Editor, jalankan isi `supabase.sql`.
3. Di Project Settings > API, salin Project URL dan anon/publishable key.
4. Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `app.js`.
5. Isi URL dan key yang sama di `admin.js`.
6. Aktifkan Realtime untuk tabel `aspirations` di Database > Publications.

## Jalankan
Karena menggunakan JavaScript module, jalankan lewat web server lokal atau hosting statis (misalnya Netlify, Vercel, atau GitHub Pages). Upload seluruh file dalam folder ini.

## Catatan keamanan penting
`admin.html` dan `admin.js` adalah tampilan awal, belum aman untuk dipakai publik sebagai panel pengurus. Jangan deploy halaman admin dengan hak update terbuka ke anon. Untuk penggunaan nyata, tambahkan Supabase Auth untuk akun pengurus dan kebijakan RLS khusus pengurus sebelum fitur "Tandai sudah ditanggapi" diaktifkan. Jangan pernah memasukkan `service_role` key ke file browser.

## Cara kerja mading
- Aspirasi baru disimpan dengan status `pending`, lalu muncul di papan publik.
- Pengurus menanggapi aspirasi melalui panel admin.
- Setelah status berubah menjadi `responded`, aspirasi otomatis hilang dari papan publik.
- Data yang sudah ditanggapi tetap tersimpan di database sebagai arsip; tidak dihapus permanen.

## Mengaktifkan panel pengurus dengan aman
1. Jalankan SQL terbaru dari `supabase.sql`.
2. Buat akun email/password pengurus melalui Supabase Dashboard > Authentication > Users.
3. Salin UUID akun tersebut, lalu jalankan SQL `insert into public.admin_users (user_id) values ('UUID-AKUN-PENGURUS');` dengan UUID asli.
4. Isi URL dan anon/publishable key di `admin.js`.
5. Buka `admin.html`, login, lalu tekan **Tandai sudah ditanggapi**. Status berubah menjadi `responded`; pesan tersimpan sebagai arsip dan hilang dari mading publik.
