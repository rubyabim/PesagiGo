# PesagiGo Backend API Guide

Dokumen ini menjelaskan struktur database dan endpoint API utama untuk aplikasi PesagiGo.

## 1. Struktur Database (Prisma)

Model inti:
- `User`: data akun pendaki/admin.
- `Mountain`: data gunung.
- `Trail`: jalur pendakian per gunung.
- `ClimbSession`: sesi pendakian per tanggal, menyimpan kuota total dan kuota terpakai.
- `Booking`: transaksi pemesanan tiket.
- `Payment`: status pembayaran online untuk booking.

Relasi utama:
- `User 1..n Booking`
- `Mountain 1..n Trail`
- `Mountain 1..n ClimbSession`
- `ClimbSession 1..n Booking`
- `Booking 1..1 Payment`

## 2. Alur API Utama

1. Pengguna registrasi: `POST /api/auth/register`
2. Pengguna login: `POST /api/auth/login`
3. Lihat gunung dan jalur: `GET /api/mountains`, `GET /api/mountains/:id/trails`
4. Lihat kuota sesi real-time: `GET /api/sessions`
5. Lihat informasi cuaca pendakian: `GET /api/weather`
6. Buat booking (JWT): `POST /api/bookings`
7. Bayar booking (JWT): `POST /api/bookings/:id/pay`
8. Ambil tiket (JWT): `GET /api/bookings/:id/ticket`
9. Lihat riwayat booking (JWT): `GET /api/bookings/my`

## 3. Endpoint Seed Data

Untuk data awal development:
- `POST /api/seed`

Endpoint ini membuat data contoh Gunung Pesagi, jalur pendakian, dan sesi kuota.

## 4. Variabel Environment

Contoh ada di `.env.example`:
- `DATABASE_URL`: koneksi database Postgres.
- `JWT_SECRET`: secret token JWT.
- `PORT`: port backend.
- `CORS_ORIGINS`: daftar origin frontend yang diizinkan.

## 5. Prisma Studio (Edit Data PostgreSQL)

- Jalankan `npm run prisma:studio` untuk membuka Prisma Studio.
- Jika browser tidak otomatis terbuka, jalankan `npm run prisma:studio:local` lalu buka URL yang muncul.
- Cek status koneksi database dengan `npm run prisma:status`.

## 6. Menjalankan Backend (Windows)

- Gunakan `npm run start:dev`.
- Script `prestart:dev` akan otomatis menutup proses yang memakai port `3001` agar backend langsung jalan.

## 7. Catatan Integrasi Web/Mobile

- Web Next.js gunakan `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`.
- Android emulator gunakan host API `http://10.0.2.2:3001`.
- iOS simulator gunakan host API `http://localhost:3001`.
