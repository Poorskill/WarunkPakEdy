# WarunkPakEdy — Design References

Dokumen ini berisi sumber referensi, keputusan desain, dan acuan visual yang digunakan dalam pengembangan **WarunkPakEdy POS System**.

Dokumen ini digunakan bersama:

```text
DESIGN.md
README.md
```

`DESIGN.md` menjadi aturan desain, sedangkan dokumen ini menjelaskan **asal referensi dan bagaimana referensi tersebut digunakan dalam implementasi**.

---

# 1. Primary Design Reference

## Google Stitch

Project:

**WarunkPakEdy POS System**

Project ID:

```text
16989339253138949736
```

Project:

```text
https://stitch.withgoogle.com/projects/16989339253138949736
```

Google Stitch digunakan sebagai referensi utama untuk struktur visual dan layout interface.

---

# 2. Screen References

Project memiliki empat screen utama yang digunakan sebagai acuan.

## 2.1 Kasir POS Modern

Screen:

```text
WarunkPakEdy - Layar Kasir POS Modern
```

ID:

```text
5442e913cc964b158c40f35548cec23f
```

### Digunakan sebagai referensi untuk

* layout POS
* product catalog
* product search
* barcode input
* cart
* quantity control
* subtotal
* discount
* total
* payment
* payment modal
* transaction success
* receipt

### Prinsip implementasi

Area produk dan cart harus memiliki hierarchy yang jelas.

Kasir harus dapat melakukan transaksi dengan jumlah klik seminimal mungkin.

---

# 3. Dashboard Pemilik Toko

Screen:

```text
WarunkPakEdy - Dashboard Pemilik Toko
```

ID:

```text
d6da1b599cac4c5a8068af99ac4dc228
```

### Digunakan sebagai referensi untuk

* dashboard layout
* KPI
* sales chart
* recent transactions
* low stock
* summary information
* date filtering
* owner-oriented information

### Prinsip implementasi

Dashboard tidak boleh hanya menjadi kumpulan card.

Informasi harus membantu owner memahami kondisi toko dengan cepat.

Prioritas:

```text
Penjualan
↓
Transaksi
↓
Keuntungan
↓
Stok
↓
Detail
```

---

# 4. Product & Inventory

Screen:

```text
WarunkPakEdy - Manajemen Produk & Stok Barang
```

ID:

```text
282302b2c3794210a6254327ea9c713a
```

### Digunakan sebagai referensi untuk

* product table
* product information
* stock information
* category
* SKU
* barcode
* price
* stock status
* search
* filter
* product form

### Prinsip implementasi

Data produk harus mudah dicari dan dipahami.

Informasi penting tidak boleh disembunyikan terlalu dalam.

Status stok:

```text
Normal
Menipis
Habis
```

---

# 5. Transaction & Sales Report

Screen:

```text
WarunkPakEdy - Riwayat Transaksi & Laporan Penjualan
```

ID:

```text
ba4a53c1ef5a47d283b5140ea999ec79
```

### Digunakan sebagai referensi untuk

* transaction history
* sales table
* transaction status
* sales summary
* report filtering
* date range
* sales analytics

### Prinsip implementasi

Laporan harus memprioritaskan informasi yang relevan terhadap keputusan operasional.

---

# 6. Exported Stitch Files

Export design menyediakan:

```text
code.html
screen.png
DESIGN.md
```

Untuk masing-masing screen.

### Penggunaan

`screen.png` digunakan sebagai:

* visual comparison
* layout reference
* spacing reference
* color reference

`code.html` digunakan sebagai:

* reference structure
* reference component placement
* reference content
* reference interaction concept

---

# 7. Stitch Code Policy

Kode dari Stitch **tidak langsung digunakan sebagai production code**.

Stitch merupakan sumber referensi UI.

Implementasi production menggunakan:

```text
Laravel 13
React
TypeScript
Inertia.js
Tailwind CSS
shadcn/ui
```

Alasannya:

* menjaga architecture tetap konsisten
* menghindari duplikasi
* memudahkan maintenance
* memudahkan integrasi database
* memudahkan penggunaan reusable component
* menjaga type safety

---

# 8. Visual Elements

Referensi Stitch menggunakan karakter visual:

```text
Modern
Clean
Professional
Friendly
Practical
Business-oriented
```

Tidak diarahkan menjadi:

```text
Futuristic
Cyberpunk
Glassmorphism-heavy
Neon
Over-animated
```

---

# 9. Color Reference

Primary:

```text
#047857
```

Secondary:

```text
#10B981
```

Information:

```text
#2563EB
```

Background:

```text
#F8FAFC
```

Surface:

```text
#FFFFFF
```

Primary text:

```text
#0F172A
```

Secondary text:

```text
#64748B
```

Border:

```text
#E2E8F0
```

Success:

```text
#16A34A
```

Warning:

```text
#D97706
```

Danger:

```text
#DC2626
```

---

# 10. Typography Reference

Font utama:

```text
Plus Jakarta Sans
```

Typography digunakan untuk menjaga interface terasa modern namun tetap mudah dibaca.

Hierarchy:

```text
Page Title
↓
Section Title
↓
Card Title
↓
Body
↓
Metadata
```

Ukuran font tidak boleh dibuat terlalu besar hanya untuk membuat dashboard terlihat menarik.

---

# 11. Layout Reference

Desktop:

```text
Sidebar
   +
Header
   +
Main Content
```

Sidebar target:

```text
240px
```

Content menggunakan spacing yang konsisten.

POS:

```text
Product Area
        +
Cart Area
```

Target:

```text
Product ≈ 65%
Cart ≈ 35%
```

---

# 12. Navigation Reference

Sidebar grouping:

```text
UTAMA
├── Dashboard
└── Kasir

TOKO
├── Produk
├── Stok
├── Pembelian
├── Supplier
└── Pelanggan

TRANSAKSI
├── Penjualan
└── Retur

LAPORAN
├── Laporan Penjualan
├── Laporan Stok
└── Laporan Keuntungan

SISTEM
├── Pengguna
└── Pengaturan
```

Grouping harus tetap digunakan kecuali terdapat alasan UX yang jelas untuk mengubahnya.

---

# 13. Component Reference

Komponen utama:

```text
AppSidebar
AppHeader
PageHeader
StatCard
SearchInput
ProductCard
CartItem
DataTable
StatusBadge
Modal
Dialog
Button
Input
Select
DatePicker
Pagination
Toast
```

Komponen harus dibuat reusable.

---

# 14. POS Reference

POS harus mengutamakan kecepatan.

Workflow utama:

```text
Search / Scan
     ↓
Select Product
     ↓
Cart
     ↓
Quantity
     ↓
Total
     ↓
Payment
     ↓
Success
     ↓
Receipt
```

Keyboard:

```text
F9 → Payment
Esc → Close modal
Enter → Confirm
```

Shortcut dapat berkembang sesuai kebutuhan.

---

# 15. Product Reference

Product list minimal memiliki:

```text
Product
SKU
Barcode
Category
Purchase Price
Selling Price
Stock
Minimum Stock
Status
Action
```

Form produk harus memiliki validation.

---

# 16. Inventory Reference

Inventory harus membedakan:

```text
Stock In
Stock Out
Adjustment
Stock Opname
```

Setiap perubahan stok penting harus memiliki pencatatan inventory movement.

---

# 17. Transaction Reference

Transaction minimal memiliki:

```text
Transaction Number
Date
Cashier
Customer
Total
Payment Method
Status
```

Contoh status:

```text
Lunas
Bon
Pending
Dibatalkan
Diretur
```

---

# 18. Responsive Reference

## Desktop

Menggunakan sidebar permanen dan layout multi-column.

## Tablet

Sidebar dapat collapse.

## Mobile

Sidebar berubah menjadi drawer.

POS:

```text
Products
↓
Cart / Bottom Sheet
```

Table dapat berubah menjadi card/list jika lebar layar tidak cukup.

---

# 19. UX Reference

Interface harus memberikan feedback untuk:

* loading
* success
* error
* empty
* confirmation
* validation

Contoh:

```text
Menyimpan...
Memproses pembayaran...
Transaksi berhasil
Data berhasil disimpan
Produk tidak ditemukan
Stok tidak mencukupi
```

---

# 20. Indonesian Localization

UI menggunakan Bahasa Indonesia.

Gunakan istilah yang familiar bagi pengguna toko.

Contoh:

```text
Kasir
Produk
Stok
Pembelian
Supplier
Pelanggan
Penjualan
Retur
Laporan
Pengguna
Pengaturan
```

Currency:

```text
Rp 10.000
Rp 25.000
Rp 1.250.000
```

Tanggal:

```text
26 September 2026
```

---

# 21. Reference vs Implementation

Tidak semua detail Stitch harus dipertahankan secara literal.

## Harus dipertahankan

* visual hierarchy
* warna utama
* typography
* layout utama
* navigation structure
* interaction concept
* responsive concept

## Dapat disesuaikan

* dummy content
* data
* component structure
* backend integration
* validation
* permission
* database-driven behavior
* accessibility
* performance optimization

---

# 22. Anti AI-Slop Reference

Visual akhir harus terlihat seperti software yang benar-benar dibuat untuk pengguna.

Hindari:

```text
10+ gradient cards
Glassmorphism
Huge hero section
Random decorative icons
Excessive rounded corners
Animated background
Neon color
Unnecessary charts
Fake statistics
Dummy buttons
Placeholder features
```

Gunakan:

```text
Clear hierarchy
Useful information
Consistent spacing
Realistic data structure
Reusable components
Predictable interaction
Clear feedback
```

---

# 23. Design Decision Log

Setiap perubahan besar terhadap desain Stitch sebaiknya dicatat.

Format:

```text
Tanggal:
Bagian:
Perubahan:
Alasan:
Dampak:
```

Contoh:

```text
Tanggal: 2026-09-26
Bagian: POS
Perubahan: Cart dibuat sticky pada desktop
Alasan: Memudahkan kasir melihat total saat scroll product
Dampak: Tidak mengubah struktur transaksi
```

---

# 24. Source Priority

Jika terdapat perbedaan antara beberapa referensi, gunakan urutan:

```text
1. Business Requirement
2. DESIGN.md
3. Stitch Screen
4. refrensi.md
5. README.md
```

Business requirement memiliki prioritas tertinggi.

Desain tidak boleh mengorbankan kebutuhan bisnis hanya demi mempertahankan tampilan.

---

# 25. Final Reference Principle

Semua implementasi WarunkPakEdy harus mengikuti prinsip:

> **Gunakan Stitch sebagai referensi desain, bukan sebagai batasan kode.**

Tujuan akhirnya adalah menghasilkan aplikasi yang:

* terlihat konsisten dengan desain
* memiliki UX yang baik
* menggunakan data nyata
* memiliki architecture yang rapi
* mudah dikembangkan
* mudah dipelihara
* tidak terlihat seperti hasil copy-paste generator UI

---

## Reference Files

```text
DESIGN.md
README.md
refrensi.md
```

Ketiga dokumen tersebut menjadi dokumentasi awal project WarunkPakEdy.
