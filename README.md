# WarunkPakEdy POS System

**WarunkPakEdy** adalah aplikasi **Point of Sale (POS) dan Inventory Management** yang dirancang untuk kebutuhan warung, toko sembako, minimarket kecil, toko makanan/minuman, dan bisnis retail UMKM di Indonesia.

Aplikasi ini dibuat dengan fokus pada proses operasional toko sehari-hari: mengelola produk, stok, pembelian, penjualan, pembayaran, pelanggan, supplier, retur, serta laporan.

> **Simple. Cepat. Jelas.**

---

## 1. Project Overview

WarunkPakEdy dirancang sebagai aplikasi bisnis yang:

* mudah digunakan oleh kasir
* mudah dipantau oleh pemilik toko
* memiliki pengelolaan stok yang jelas
* mendukung transaksi penjualan
* mencatat pergerakan inventory
* menyediakan laporan bisnis
* responsive pada desktop, tablet, dan mobile
* memiliki role dan permission pengguna
* dapat dikembangkan menjadi aplikasi production

Project ini juga dikembangkan sebagai **portfolio project** dengan pendekatan software development yang realistis dan maintainable.

---

## 2. Main Features

### Dashboard

* Ringkasan penjualan
* Jumlah transaksi
* Keuntungan
* Stok menipis
* Grafik penjualan
* Transaksi terbaru
* Informasi produk yang perlu direstock

### Kasir / POS

* Pencarian produk
* Scan barcode
* Product catalog
* Shopping cart
* Quantity control
* Diskon
* Pajak jika diperlukan
* Pembayaran tunai
* QRIS
* Transfer
* E-Wallet
* Perhitungan kembalian
* Nomor transaksi
* Cetak struk
* Transaksi baru
* Keyboard shortcut

### Produk

* CRUD produk
* Kategori produk
* SKU
* Barcode
* Harga beli
* Harga jual
* Stok
* Minimum stok
* Status stok
* Pencarian
* Filter
* Pagination

### Inventory

* Stok tersedia
* Stok masuk
* Stok keluar
* Pergerakan stok
* Stock opname
* Penyesuaian stok
* Peringatan stok menipis
* Status stok habis

### Pembelian

* Data pembelian
* Supplier
* Detail pembelian
* Harga beli
* Quantity
* Total pembelian
* Penambahan stok otomatis

### Supplier

* Nama supplier
* Nomor telepon
* Alamat
* Catatan
* Status supplier

### Pelanggan

* Data pelanggan
* Nomor telepon
* Alamat
* Riwayat transaksi
* Total transaksi

### Penjualan

* Riwayat transaksi
* Detail transaksi
* Kasir
* Pelanggan
* Metode pembayaran
* Total transaksi
* Status transaksi

### Retur

* Retur barang
* Detail barang yang diretur
* Quantity retur
* Alasan retur
* Penyesuaian stok
* Riwayat retur

### Laporan

* Laporan penjualan
* Laporan stok
* Laporan keuntungan
* Produk terlaris
* Periode laporan
* Filter tanggal
* Ringkasan transaksi

### User Management

Role utama:

* Owner
* Admin
* Kasir

Permission digunakan untuk mengontrol akses terhadap fitur.

---

## 3. Tech Stack

### Backend

* Laravel 13
* PHP 8.3
* MySQL

### Frontend

* React
* TypeScript
* Inertia.js
* Tailwind CSS
* shadcn/ui

### Development Tools

* Vite
* Composer
* NPM
* Git
* GitHub
* Laragon

---

## 4. Project Structure

Struktur utama yang direncanakan:

```text
warunkpakedy/
│
├── app/
│   ├── Http/
│   ├── Models/
│   ├── Policies/
│   └── Services/
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── resources/
│   ├── css/
│   └── js/
│       ├── components/
│       ├── hooks/
│       ├── layouts/
│       ├── lib/
│       ├── pages/
│       └── types/
│
├── routes/
│   ├── web.php
│   └── settings.php
│
├── public/
│
├── storage/
│
├── tests/
│
├── DESIGN.md
├── README.md
├── refrensi.md
├── database.md
└── flowchart.md
```

Struktur dapat berkembang selama proses development.

---

## 5. Application Architecture

WarunkPakEdy menggunakan pendekatan:

```text
Browser
   ↓
React + TypeScript
   ↓
Inertia.js
   ↓
Laravel
   ↓
Models / Services / Policies
   ↓
MySQL
```

Frontend bertanggung jawab terhadap:

* interface
* interaction
* state
* form
* validation feedback
* responsive UI

Laravel bertanggung jawab terhadap:

* business logic
* authentication
* authorization
* database
* transaction processing
* validation
* reporting
* security

---

## 6. Main Business Flow

### Penjualan

```text
Kasir
  ↓
Cari / Scan Produk
  ↓
Tambah ke Cart
  ↓
Atur Quantity
  ↓
Hitung Total
  ↓
Pilih Pembayaran
  ↓
Konfirmasi
  ↓
Simpan Transaksi
  ↓
Kurangi Stok
  ↓
Catat Payment
  ↓
Cetak / Tampilkan Struk
```

### Pembelian

```text
Pilih Supplier
  ↓
Tambah Produk
  ↓
Masukkan Quantity
  ↓
Masukkan Harga Beli
  ↓
Konfirmasi Pembelian
  ↓
Simpan Purchase
  ↓
Tambah Stok
  ↓
Catat Inventory Movement
```

---

## 7. Roles

### Owner

Memiliki akses penuh terhadap sistem.

Akses utama:

* Dashboard
* Kasir
* Produk
* Stok
* Pembelian
* Supplier
* Pelanggan
* Penjualan
* Retur
* Laporan
* Pengguna
* Pengaturan

### Admin

Bertanggung jawab terhadap operasional toko.

Akses dapat mencakup:

* Produk
* Stok
* Pembelian
* Supplier
* Pelanggan
* Penjualan
* Retur
* Laporan sesuai permission

### Kasir

Berfokus pada transaksi penjualan.

Akses utama:

* Kasir
* Penjualan
* Pelanggan sesuai kebutuhan
* Riwayat transaksi sesuai permission

> Permission backend tetap wajib diterapkan. Menyembunyikan menu di frontend saja tidak dianggap sebagai security.

---

## 8. Design System

Design system utama disimpan pada:

```text
DESIGN.md
```

Prinsip visual:

* Modern
* Clean
* Professional
* Simple
* Practical
* Responsive

Brand color utama:

```text
Primary: #047857
Secondary: #10B981
Information: #2563EB
Background: #F8FAFC
Surface: #FFFFFF
Text: #0F172A
Muted: #64748B
```

Font:

```text
Plus Jakarta Sans
```

Detail lengkap terdapat di `DESIGN.md`.

---

## 9. Design Reference

Desain UI dibuat berdasarkan project Google Stitch:

**Project:** WarunkPakEdy POS System

**Project ID:**

```text
16989339253138949736
```

Screen utama:

```text
1. WarunkPakEdy - Layar Kasir POS Modern
2. WarunkPakEdy - Dashboard Pemilik Toko
3. WarunkPakEdy - Manajemen Produk & Stok Barang
4. WarunkPakEdy - Riwayat Transaksi & Laporan Penjualan
```

Detail referensi terdapat di:

```text
refrensi.md
```

---

## 10. Installation

### Requirements

Pastikan sudah terinstall:

```text
PHP >= 8.3
Composer
Node.js
NPM
MySQL
Git
```

---

### Clone Repository

```bash
git clone <repository-url>
cd warunkpakedy
```

---

### Install PHP Dependencies

```bash
composer install
```

---

### Install Node Dependencies

```bash
npm install
```

---

### Environment

Copy:

```text
.env.example
```

menjadi:

```text
.env
```

Kemudian konfigurasi database.

Contoh:

```env
APP_NAME=WarunkPakEdy
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://warunkpakedy.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=warunkpakedy
DB_USERNAME=root
DB_PASSWORD=
```

---

### Generate Application Key

```bash
php artisan key:generate
```

---

### Run Migration

```bash
php artisan migrate
```

Jika seed data tersedia:

```bash
php artisan db:seed
```

atau:

```bash
php artisan migrate --seed
```

---

## 11. Run Development Server

Terminal pertama:

```bash
php artisan serve
```

Terminal kedua:

```bash
npm run dev
```

Jika menggunakan Laragon, project juga dapat dijalankan melalui virtual host Laragon.

---

## 12. Development Workflow

Development dilakukan secara bertahap.

### Phase 1 — Foundation

* Project setup
* MySQL
* Authentication
* Layout
* Sidebar
* Header
* Role & permission

### Phase 2 — Master Data

* Category
* Product
* Supplier
* Customer

### Phase 3 — Inventory

* Stock
* Stock movement
* Purchase
* Stock opname

### Phase 4 — POS

* Product search
* Barcode
* Cart
* Discount
* Payment
* Receipt

### Phase 5 — Transaction

* Sales history
* Transaction detail
* Return

### Phase 6 — Dashboard & Reports

* Dashboard
* Sales report
* Stock report
* Profit report

### Phase 7 — Quality

* Validation
* Error handling
* Loading state
* Empty state
* Responsive
* Accessibility
* Keyboard shortcuts

### Phase 8 — Deployment

* Production build
* Server configuration
* Database production
* Storage
* Backup
* Monitoring

---

## 13. Development Rules

### Jangan

* copy-paste HTML Stitch langsung ke production
* membuat halaman hanya dengan dummy data
* membuat business logic di frontend
* mengandalkan frontend untuk authorization
* membuat komponen duplikat
* menggunakan library yang tidak diperlukan
* menambahkan fitur tanpa kebutuhan
* membuat UI terlalu ramai

### Harus

* TypeScript
* reusable components
* server-side authorization
* validation
* error handling
* database transaction untuk proses penting
* responsive layout
* accessible UI
* consistent design system
* clean naming
* maintainable code

---

## 14. Testing

Sebelum production, minimal test:

### Authentication

* Login
* Logout
* Registration
* Password confirmation
* 2FA jika digunakan

### Product

* Create
* Read
* Update
* Delete
* Validation

### Stock

* Stock in
* Stock out
* Stock adjustment
* Stock opname

### POS

* Add product
* Change quantity
* Remove product
* Calculate total
* Payment
* Change calculation
* Transaction creation
* Stock deduction

### Permission

* Owner
* Admin
* Kasir

Setiap role harus hanya dapat mengakses fitur yang diizinkan.

---

## 15. Production Considerations

Sebelum deployment:

* `APP_DEBUG=false`
* gunakan database production
* konfigurasi storage
* gunakan HTTPS
* backup database
* validasi permission
* optimasi asset
* jalankan migration secara aman
* test transaction flow
* test stock consistency

---

## 16. Project Goal

WarunkPakEdy dikembangkan bukan hanya sebagai mockup atau dashboard demo.

Target project:

> Membuat sistem POS dan inventory yang realistis, mudah digunakan, memiliki struktur kode yang baik, dan dapat dikembangkan menjadi aplikasi yang benar-benar digunakan oleh bisnis retail UMKM.

---

## 17. Current Status

```text
[x] Project Laravel dibuat
[x] React starter kit
[x] Authentication foundation
[x] Design reference dari Stitch
[x] DESIGN.md
[x] README.md
[x] refrensi.md

[ ] Database design
[ ] ERD
[ ] Flowchart
[ ] MySQL configuration
[ ] Role & permission
[ ] Product management
[ ] Inventory
[ ] Purchase
[ ] POS
[ ] Sales
[ ] Return
[ ] Reports
[ ] Dashboard
[ ] Testing
[ ] Deployment
```

Status akan diperbarui selama development.

---

## 18. License

Project ini dikembangkan sebagai portfolio dan project pembelajaran.

Lisensi dan penggunaan production dapat ditentukan kemudian.
