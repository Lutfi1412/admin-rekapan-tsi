# Admin Rekapan Narsum — DIT TSI

Panel admin untuk mengelola data kegiatan narasumber Direktorat TSI. Aplikasi ini hanya berisi
halaman admin (login, tabel dengan aksi update/hapus, form input multi-kegiatan, dan logout);
halaman publik untuk user dibuat terpisah.

- **Stack:** React 19 + Vite 8 + TypeScript + Tailwind CSS v4
- **API:** `https://api-rekapan-narsum.vercel.app` (Bun + Elysia, DB PostgreSQL di VPS)
- **Auth:** JWT dari `POST /login`, disimpan di `localStorage` (`arn.token`)
- **Repo:** https://github.com/Lutfi1412/admin-rekapan-tsi

## Daftar isi

1. [Menjalankan di lokal](#menjalankan-di-lokal)
2. [Menjalankan dengan Docker](#menjalankan-dengan-docker)
3. [Deploy ke Vercel](#deploy-ke-vercel)
4. [Konfigurasi](#konfigurasi)
5. [Fitur](#fitur)
6. [Struktur folder](#struktur-folder)
7. [Endpoint yang dipakai](#endpoint-yang-dipakai)

## Menjalankan di lokal

```bash
bun install       # atau: npm install
bun run dev       # http://localhost:5173
```

Perintah lain:

```bash
bun run typecheck   # tsc --noEmit
bun run build       # tsc -b && vite build -> dist/
bun run preview     # cek hasil build
```

Butuh Node/Bun versi baru (Vite 8 mensyaratkan Node >= 20.19 atau Bun >= 1.2).

## Menjalankan dengan Docker

Build dua tahap: `oven/bun:1-alpine` untuk kompilasi, lalu `nginx:1.29-alpine` untuk menyajikan
`dist/`. Konfigurasi nginx ada di `deploy/nginx.conf` (SPA fallback, gzip, cache aset, `/healthz`).

```bash
# pastikan .env berisi VITE_API_BASE_URL
docker compose up -d --build     # build + jalankan
open http://localhost:8080       # port bisa diganti lewat APP_PORT
docker compose logs -f           # lihat log nginx
docker compose down              # hentikan
```

Tanpa compose:

```bash
docker build   --build-arg VITE_API_BASE_URL=https://api-rekapan-narsum.vercel.app   --build-arg VITE_APP_NAME="Rekapan Narsum DIT TSI"   -t admin-rekapan-tsi:latest .

docker run -d --name admin-rekapan-tsi -p 8080:80 admin-rekapan-tsi:latest
curl -s http://localhost:8080/healthz    # -> ok
```

Catatan penting: **Vite menanam env saat build**, bukan saat runtime. Kalau `VITE_API_BASE_URL`
berubah, image harus di-build ulang (`docker compose up -d --build`). Mengecek nilai yang
tertanam di bundle:

```bash
docker run --rm admin-rekapan-tsi:latest sh -c   "grep -o 'https://[^\"]*vercel.app' /usr/share/nginx/html/assets/*.js | head -1"
```

Isi image hanya file statis `dist/` + nginx. Tidak ada secret di dalamnya (kredensial admin
divalidasi API, bukan disimpan di frontend).

## Deploy ke Vercel

Project Vercel: **admin-rekapan-tsi** — static build, tanpa serverless function.

| Setting          | Nilai           |
| ---------------- | --------------- |
| Framework        | Vite            |
| Build command    | `bun run build` |
| Output directory | `dist`          |
| Install command  | `bun install`   |
| Root directory   | `.`             |

Environment variables (Production + Preview + Development):

| Key                 | Nilai                                   |
| ------------------- | --------------------------------------- |
| `VITE_API_BASE_URL` | `https://api-rekapan-narsum.vercel.app` |
| `VITE_APP_NAME`     | `Rekapan Narsum DIT TSI`                |

Deploy dari CLI:

```bash
vercel link --yes --project admin-rekapan-tsi
vercel env add VITE_API_BASE_URL production
vercel env add VITE_APP_NAME production
vercel deploy --prod
```

Atau lewat Git: repo GitHub sudah di-connect ke project Vercel, sehingga setiap `git push` ke
`main` otomatis memicu deployment produksi (`vercel git connect --yes`).

`vercel.json` berisi rewrite SPA supaya `/dashboard` dan `/login` tidak 404 saat di-refresh:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Setelah mengubah env di dashboard Vercel, lakukan **Redeploy** — nilai env ikut terkunci saat
build.

## Konfigurasi

Semua endpoint berada di `.env` (jangan hardcode di kode):

```env
VITE_API_BASE_URL=https://api-rekapan-narsum.vercel.app
VITE_APP_NAME="Rekapan Narsum DIT TSI"
```

Ganti `VITE_API_BASE_URL` bila API pindah host/domain, lalu restart dev server. Untuk build
produksi (Vercel maupun Docker), jalankan build ulang setelah mengubahnya.

Kredensial admin tidak disimpan di frontend; login divalidasi oleh API (`ADMIN_USERNAME` /
`ADMIN_PASSWORD` di sisi server).

## Fitur

1. **Login** — username + password, indikator status API, pesan error dari server, sesi
   kedaluwarsa otomatis (401 → kembali ke halaman login).
2. **Tabel data** — 10 baris per halaman, pencarian (nama/instansi/topik/lokasi/tanggal),
   filter mode pelaksanaan, badge mode, skeleton loading, dan empty state.
3. **Form input banyak sekaligus** — isi satu kegiatan → **Tambah ke daftar** → muncul pertanyaan
   "mau input kegiatan lagi atau kirim sekarang?"; entri yang sudah masuk daftar tetap tersimpan dan
   bisa dihapus satu per satu. Setelah ditambahkan, instansi/topik/lokasi/tanggal tetap terisi agar
   tinggal mengganti nama untuk narasumber berikutnya pada kegiatan yang sama. Semua entri dikirim
   dalam satu request (`POST /create` menerima array) sehingga diproses paralel oleh worker API.
4. **Update** — tombol pensil membuka form terisi data lama, lalu `PUT /update/:id`.
5. **Hapus** — dialog konfirmasi berisi ringkasan data sebelum `DELETE /delete/:id`.
6. **Logout** — menghapus token dari `localStorage` dan kembali ke halaman login.

## Struktur folder

```
├── deploy/
│   └── nginx.conf          konfigurasi nginx (SPA fallback, cache, gzip)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/         Button, Input/Select/Textarea, Modal, Badge
│   │   ├── layout/         Navbar, Footer
│   │   └── narsum/         StatCards, NarsumTable, NarsumForm, DeleteDialog
│   ├── contexts/           AuthContext (token, user, login, logout)
│   ├── hooks/              useAuth, useNarsum
│   ├── pages/              Login, Dashboard
│   ├── routes/             AppRoutes, ProtectedRoute
│   ├── services/           api (fetch wrapper), authService, narsumService
│   ├── utils/              formatDate, relativeTime, validation
│   ├── App.tsx             provider + router + toaster
│   ├── main.tsx            entry point
│   └── index.css           Tailwind + tema font
├── Dockerfile              multi-stage build (bun -> nginx)
├── docker-compose.yaml     jalankan container di port 8080
├── vercel.json             rewrite SPA
├── .env / .env.example     konfigurasi endpoint
└── vite.config.ts          plugin React + Tailwind v4
```

## Endpoint yang dipakai

| Method | Path           | Keterangan                                    |
| ------ | -------------- | --------------------------------------------- |
| POST   | `/login`       | `{ username, password }` → `{ token, user }`  |
| GET    | `/me`          | validasi token saat aplikasi dibuka           |
| GET    | `/admin`       | daftar semua data (Bearer token)              |
| POST   | `/create`      | satu object atau array object (bulk)          |
| PUT    | `/update/:id`  | update satu data (full replace)               |
| DELETE | `/delete/:id`  | hapus satu data                               |
| GET    | `/health`      | indikator status API di halaman login         |

Field data: `Nama`, `Instansi`, `Topik`, `Tanggal Mulai`, `Tanggal Selesai`, `Lokasi`,
`Mode Pelaksanaan` (`Online` / `Offline` / `Hybrid`). Tanggal dikirim sebagai `YYYY-MM-DD` dan
dikembalikan API dalam format `8 January 2026`.

Kode status yang ditangani: `201` (semua tersimpan), `207` (sebagian gagal — daftar error
ditampilkan di form), `409` (duplikat `nama + topik + tanggal mulai`), `422` (validasi), `401`
(token kedaluwarsa).
