# 🌊 LautKu

**Platform Marketplace & Manajemen Hasil Laut**
Tugas UAS Pengembangan Web Back-End — Tema: Blue Economy

---

## 👥 Anggota Kelompok 7

| Nama | Peran | Modul Backend | Modul Frontend |
|---|---|---|---|
| Ruth | Ketua | Autentikasi & Manajemen Pengguna | Seluruh halaman frontend (Vue.js) |
| Rizky | Anggota | Produk & Marketplace | - |
| Siti | Anggota | Manajemen Tambak & Budidaya | - |
| Suci | Anggota | Monitoring, Cuaca & Artikel | - |

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
| Hosting Frontend | Railway / Vercel / Netlify |

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
GET    /api/tambak/:id/laporan

GET    /api/panen/tambak/:tambak_id
GET    /api/panen/:id
POST   /api/panen
PUT    /api/panen/:id
DELETE /api/panen/:id
```

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

---

## 🚀 Deployment

### Backend (Railway)

```bash
railway login
railway init
railway variables set JWT_SECRET=lautku_secret_key_2026
railway variables set JWT_EXPIRES_IN=7d
railway up
railway domain
```

### Frontend

Update `VITE_API_URL` di `.env` frontend dengan URL backend Railway, lalu build:

```bash
npm run build
```

Deploy folder `dist/` ke Railway, Vercel, atau Netlify.

---

## 📝 Catatan Keamanan

- File `serviceAccountKey.json` dan `.env` **tidak** disertakan dalam repository, tercantum di `.gitignore`
- Password pengguna dienkripsi menggunakan bcrypt sebelum disimpan
- Setiap endpoint yang membutuhkan otentikasi dilindungi middleware JWT
- Otorisasi berbasis role diterapkan pada endpoint yang bersifat sensitif

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan Tugas UAS mata kuliah Pengembangan Web Back-End, Kelompok 7.
