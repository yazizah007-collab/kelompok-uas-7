# 🌊 LautKu

**Platform Marketplace & Manajemen Hasil Laut**
Tugas UAS Pengembangan Web Back-End — Tema: Blue Economy

---

## 🔗 Link Aplikasi Live

| Layanan | URL |
|---|---|
| **Frontend (Web Browser)** | https://frontend-uas-seven-production.up.railway.app |
| **Backend (API / Postman)** | https://blue-eco-seven-uas-production.up.railway.app |

> Untuk pengujian API lewat Postman, gunakan base URL backend di atas sebagai pengganti `http://localhost:3000` pada seluruh contoh endpoint di dokumen ini.

---

## 👥 Anggota Kelompok 7

| Nama | Peran | Modul Backend | Modul Frontend | Tanggung Jawab Tambahan |
|---|---|---|---|---|
| Ruth | Ketua | Autentikasi & Manajemen Pengguna | Landing Page, Login & Register, Dashboard Admin, Manajemen Pengguna, Dashboard Nelayan, Produk Saya, Tambak Saya | Integrasi seluruh modul backend dari anggota lain, pengujian akhir menyeluruh, deployment backend & frontend ke Railway, penyusunan dokumentasi dan berkas submission |
| Suci | Anggota | Monitoring, Cuaca & Artikel | Manajemen Artikel, Siklus Panen, Pengeluaran, Monitoring Air, Katalog, Detail Produk, Keranjang, Riwayat Order, Artikel Publik & Detail Artikel | Pengujian modul monitoring, cuaca, dan artikel di lingkungan production |
| Rizky | Anggota | Produk & Marketplace | Tampilan awal halaman Produk & Order | Pengujian modul produk & order di lingkungan production |
| Siti | Anggota | Manajemen Tambak & Budidaya | Tampilan awal halaman Tambak & Budidaya | Pengujian modul tambak, panen, dan pengeluaran di lingkungan production |

---

## 📖 Tentang Aplikasi

LautKu adalah platform web terpadu yang mendukung ekosistem perikanan dan budidaya laut di Indonesia. Aplikasi ini menggabungkan tiga modul utama:

- **Marketplace hasil laut** — transaksi jual-beli langsung antara nelayan dan pembeli
- **Manajemen tambak & budidaya** — pencatatan siklus panen dan pengeluaran operasional
- **Monitoring kualitas air & cuaca** — pemantauan kondisi tambak berbasis data

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Backend | Node.js + Express.js |
| Database | Firebase Firestore |
| Frontend | Vue.js 3 (Composition API) |
| State Management | Pinia |
| Routing | Vue Router 4 |
| Autentikasi | JWT (jsonwebtoken) |
| Enkripsi Password | Bcryptjs |
| HTTP Client | Axios |
| API Cuaca | Open-Meteo (gratis, tanpa API key) |
| Hosting Backend | Railway |
| Hosting Frontend | Railway (Vite preview) |

---

## 📁 Struktur Folder

### Backend (`lautku/`)

```
lautku/
├── config/
│   ├── db.js
│   └── serviceAccountKey.json     (tidak di-commit ke Git)
├── middleware/
│   ├── auth.js
│   └── role.js
├── routes/
├── controllers/
├── models/
├── public/uploads/
├── .env                            (tidak di-commit ke Git)
├── app.js
└── package.json
```

### Frontend (`lautku-frontend/`)

```
lautku-frontend/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   ├── api/
│   ├── views/
│   │   ├── admin/
│   │   ├── nelayan/
│   │   ├── pembeli/
│   │   └── publik/
│   ├── components/
│   └── assets/
├── index.html
├── vite.config.js
├── .env
└── package.json
```

---

## ⚙️ Instalasi & Menjalankan Secara Lokal

### 1. Clone Repository

```bash
git clone <url-repository>
cd lautku
```

### 2. Setup Backend

```bash
cd lautku
npm install
```

Buat file `.env`:

```env
PORT=3000
JWT_SECRET=lautku_secret_key_2026
JWT_EXPIRES_IN=7d
```

Letakkan file `serviceAccountKey.json` (Firebase Admin SDK) di dalam folder `config/`.

Jalankan server:

```bash
npm run dev
```

Server berjalan di `http://localhost:3000`

### 3. Setup Frontend

```bash
cd lautku-frontend
npm install
```

Buat file `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## 🔑 Role & Hak Akses

| Role | Hak Akses |
|---|---|
| **Admin** | Kelola pengguna, kelola artikel, lihat statistik global |
| **Nelayan** | Kelola produk, tambak, siklus panen, pengeluaran, monitoring air |
| **Pembeli** | Belanja produk, kelola keranjang, checkout, lihat riwayat order |

---

## 📡 Daftar API Endpoint

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Users
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/suspend
```

### Produk & Kategori
```
GET    /api/produk
GET    /api/produk/milik-saya
GET    /api/produk/:id
POST   /api/produk
PUT    /api/produk/:id
DELETE /api/produk/:id
GET    /api/produk/kategori
POST   /api/produk/kategori
DELETE /api/produk/kategori/:id
```

### Order & Keranjang
```
GET    /api/orders/keranjang
POST   /api/orders/keranjang
PUT    /api/orders/keranjang/:id
DELETE /api/orders/keranjang/:id
POST   /api/orders/checkout
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status
PUT    /api/orders/:id/cancel
```

### Tambak, Panen & Pengeluaran
```
GET    /api/tambak
GET    /api/tambak/:id
POST   /api/tambak
PUT    /api/tambak/:id
DELETE /api/tambak/:id
GET    /api/tambak/:id/panen
POST   /api/tambak/:id/panen
PUT    /api/tambak/panen/:id
GET    /api/tambak/:id/pengeluaran
POST   /api/tambak/:id/pengeluaran
PUT    /api/tambak/pengeluaran/:id
DELETE /api/tambak/pengeluaran/:id
GET    /api/tambak/:id/laporan?dari=YYYY-MM-DD&sampai=YYYY-MM-DD

GET    /api/panen/tambak/:tambak_id
GET    /api/panen/:id
POST   /api/panen
PUT    /api/panen/:id
DELETE /api/panen/:id
```

> Parameter `dari` dan `sampai` pada endpoint laporan bersifat opsional. Kalau tidak disertakan, backend memakai rentang tanggal default yang sangat luas supaya tetap menampilkan seluruh data.

### Monitoring & Cuaca
```
GET    /api/monitoring/:tambak_id
POST   /api/monitoring
DELETE /api/monitoring/:id
GET    /api/cuaca/:tambak_id
```

### Artikel
```
GET    /api/artikel
GET    /api/artikel/admin
GET    /api/artikel/:id
POST   /api/artikel
PUT    /api/artikel/:id
DELETE /api/artikel/:id
```

---

## 🗄️ Struktur Collection Firestore

| Collection | Deskripsi |
|---|---|
| `users` | Data pengguna (admin, nelayan, pembeli) |
| `kategori` | Kategori produk hasil laut |
| `produk` | Data produk yang dijual nelayan |
| `keranjang` | Keranjang belanja pembeli |
| `orders` | Data pesanan |
| `order_detail` | Detail item dalam setiap pesanan |
| `tambak` | Data tambak milik nelayan |
| `siklus_panen` | Siklus tebar dan panen |
| `pengeluaran_tambak` | Pencatatan pengeluaran operasional |
| `monitoring_air` | Data kualitas air tambak |
| `artikel` | Artikel edukasi budidaya |

### ⚠️ Catatan Penting Firestore

- Konfigurasi `db.js` menyertakan `db.settings({ ignoreUndefinedProperties: true })` supaya field opsional yang bernilai `undefined` tidak menyebabkan error saat disimpan.
- Beberapa query yang memfilter lebih dari satu field (misalnya `pengeluaran_tambak` berdasarkan `tambak_id` dan `tanggal`, atau `monitoring_air` berdasarkan `tambak_id` dan urutan `tanggal`) membutuhkan **composite index**. Kalau muncul error `FAILED_PRECONDITION: The query requires an index`, buka link yang tertera di pesan error tersebut di browser, lalu klik **Create Index** dan tunggu status berubah menjadi **Enabled**.

---

## 🚀 Deployment

### Backend (Railway)

```bash
cd lautku
railway login
railway link            # hubungkan ke project yang sudah ada, atau railway init untuk buat baru
railway variables set PORT=3000
railway variables set JWT_SECRET=lautku_secret_key_2026
railway variables set JWT_EXPIRES_IN=7d
railway up
railway domain
```

Contoh URL production: `https://blue-eco-seven-uas-production.up.railway.app` (backend sudah aktif dan siap diakses)

### Frontend (Railway)

```bash
cd lautku-frontend
```

Update `.env` dengan URL backend production:

```env
VITE_API_URL=https://blue-eco-seven-uas-production.up.railway.app/api
```

Tambahkan script start untuk serve hasil build:

```bash
npm pkg set scripts.start="vite preview --host 0.0.0.0 --port $PORT"
```

Deploy:

```bash
railway init
railway up
railway domain
```

URL production yang sudah aktif: `https://frontend-uas-seven-production.up.railway.app`

### Verifikasi Setelah Deploy

1. Test backend production langsung dari browser/Postman (`GET /` harus mengembalikan pesan server aktif)
2. Register ulang akun admin, nelayan, dan pembeli di database production (karena Firestore production dikosongkan sebelum deploy final)
3. Test seluruh endpoint utama tiap modul di Postman menggunakan URL production
4. Buka frontend production di browser, uji alur penuh tiap role (login, fitur inti, logout)

---

## 📦 Checklist Submission

- [ ] Database Firestore production sudah bersih dari data testing lokal, hanya berisi data demo yang relevan
- [ ] Backend live di `https://blue-eco-seven-uas-production.up.railway.app` dan frontend live di `https://frontend-uas-seven-production.up.railway.app`, keduanya sudah diuji ulang
- [ ] File `Tim.txt` sudah dibuat, berisi nama tim, anggota beserta NIM, teknologi yang dipakai, kedua link hosting di atas, dan kredensial admin
- [ ] Source code backend & frontend disiapkan tanpa `node_modules/`, `.env`, `serviceAccountKey.json`, dan folder `dist/`
- [ ] Video demo sudah direkam seluruh anggota dan digabung menjadi satu file (maksimal 15 menit)
- [ ] File zip berisi `Tim.txt`, source code backend, source code frontend, dan video demo
- [ ] Link Google Drive submission sudah diatur ke **Anyone with the link** dan sudah diuji buka di jendela **incognito** sebelum dikirim ke dosen

---

## 📝 Catatan Keamanan

- File `serviceAccountKey.json` dan `.env` **tidak** disertakan dalam repository maupun file submission, tercantum di `.gitignore`
- Password pengguna dienkripsi menggunakan bcrypt sebelum disimpan
- Setiap endpoint yang membutuhkan otentikasi dilindungi middleware JWT
- Otorisasi berbasis role diterapkan pada endpoint yang bersifat sensitif

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan Tugas UAS mata kuliah Pengembangan Web Back-End, Kelompok 7.
