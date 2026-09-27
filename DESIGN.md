# WarunkPakEdy — Design System & UI Guidelines

> **Project:** WarunkPakEdy POS System
> **Purpose:** POS, Inventory, Sales & Retail Management System
> **Target:** UMKM, warung kelontong, toko sembako, minimarket kecil, dan retail lokal Indonesia
> **Frontend:** React + TypeScript + Inertia.js
> **Backend:** Laravel 13
> **Styling:** Tailwind CSS
> **Design Reference:** Google Stitch

---

## 1. Design Direction

WarunkPakEdy menggunakan pendekatan **Modern Corporate Utility** yang berfokus pada:

* cepat digunakan
* mudah dipahami
* tidak terlihat rumit
* nyaman digunakan dalam waktu lama
* cocok untuk kasir dan pemilik toko
* tetap profesional untuk kebutuhan portfolio maupun penggunaan nyata

Prinsip utama:

> **Simple enough for a new cashier, powerful enough for a store owner.**

Interface harus terasa seperti aplikasi bisnis yang benar-benar digunakan sehari-hari, bukan sekadar dashboard template.

### Karakter Visual

* Modern
* Clean
* Professional
* Reliable
* Practical
* Friendly
* Operational
* Data-oriented
* Tidak berlebihan

### Hindari

Jangan menggunakan:

* glassmorphism berlebihan
* gradient sebagai dekorasi utama
* background terlalu ramai
* shadow terlalu tebal
* kartu terlalu banyak
* border-radius berlebihan
* animasi dekoratif
* neon/futuristic UI
* typography terlalu besar
* warna terlalu banyak
* layout dashboard template generik
* efek visual yang mengganggu pekerjaan kasir

---

# 2. Brand Identity

## Brand Name

**WarunkPakEdy**

## Product Description

**Kasir & Manajemen Warung**

## Brand Personality

WarunkPakEdy harus terasa:

* dekat dengan pengguna UMKM
* terpercaya
* sederhana
* cepat
* modern
* tidak mengintimidasi pengguna non-teknis

Brand bukan dibuat seperti aplikasi enterprise yang terlalu formal, tetapi juga bukan aplikasi kasir yang terlihat sederhana atau murahan.

---

# 3. Color System

## Primary

```text
Primary: #047857
```

Emerald Green digunakan untuk:

* tombol utama
* Bayar
* Simpan
* Checkout
* active navigation
* selected tab
* CTA utama
* angka penting
* status positif

Hover:

```text
#065F46
```

Pressed:

```text
#064E3B
```

---

## Secondary

```text
Secondary: #10B981
```

Digunakan sebagai accent:

* active state
* quick action
* positive highlight
* badge
* indicator
* interactive element

Soft background:

```text
#D1FAE5
#ECFDF5
```

---

## Tertiary / Information

```text
Tertiary: #2563EB
```

Digunakan untuk:

* informasi
* supplier
* reorder
* analytic information
* non-monetary metrics
* informational charts

Jangan menggunakan biru sebagai warna utama aplikasi.

---

## Neutral

### Background

```text
#F8FAFC
```

### Surface

```text
#FFFFFF
```

### Border

```text
#E2E8F0
```

### Primary Text

```text
#0F172A
```

### Secondary Text

```text
#64748B
```

### Muted Text

```text
#94A3B8
```

---

# 4. Semantic Colors

## Success

```text
#16A34A
```

Digunakan untuk:

* transaksi berhasil
* pembayaran berhasil
* stok normal
* status aktif
* receipt berhasil

Soft:

```text
#DCFCE7
```

---

## Warning

```text
#D97706
```

Digunakan untuk:

* stok menipis
* transaksi tertunda
* pembayaran sebagian
* peringatan

Soft:

```text
#FEF3C7
```

---

## Danger

```text
#DC2626
```

Digunakan untuk:

* stok habis
* hapus
* void
* retur
* transaksi gagal
* kondisi kritis

Soft:

```text
#FEF2F2
```

---

# 5. Typography

Font utama:

```text
Plus Jakarta Sans
```

Semua halaman harus menggunakan font yang sama agar visual konsisten.

## Heading Large

```text
font-size: 28px
font-weight: 700
line-height: 36px
```

Mobile:

```text
font-size: 24px
line-height: 32px
```

Digunakan untuk:

* Dashboard
* Laporan Penjualan
* Manajemen Produk
* Manajemen Stok

---

## Heading Medium

```text
font-size: 22px
font-weight: 600
line-height: 28px
```

Digunakan untuk:

* section utama
* modal title
* panel POS

---

## Heading Small

```text
font-size: 18px
font-weight: 600
line-height: 24px
```

Digunakan untuk:

* card title
* subsection
* panel title

---

## Body Large

```text
font-size: 16px
font-weight: 500
line-height: 24px
```

Digunakan untuk:

* item keranjang
* informasi penting
* primary content

---

## Body Medium

```text
font-size: 14px
font-weight: 400
line-height: 20px
```

Digunakan sebagai ukuran teks standar.

---

## Body Small

```text
font-size: 13px
font-weight: 400
line-height: 18px
```

Digunakan untuk:

* metadata
* SKU
* deskripsi singkat
* timestamp

---

## Label

```text
font-size: 12px
font-weight: 600
line-height: 16px
```

Digunakan untuk:

* badge
* status
* label tabel
* kategori

---

# 6. Numeric Typography

Semua angka penting harus menggunakan:

```css
font-variant-numeric: tabular-nums;
```

Terutama:

* harga
* total transaksi
* jumlah stok
* SKU
* barcode
* nominal pembayaran
* keuntungan
* laporan penjualan

Contoh:

```text
Rp 1.250.000
Rp 25.000
125
001234567890
```

Angka pada tabel harus rata kanan.

---

# 7. Border Radius

Default:

```text
8px
```

### Small

```text
4px
```

Digunakan untuk:

* badge
* status
* SKU label

### Default

```text
8px
```

Digunakan untuk:

* button
* input
* product card
* table element

### Large

```text
12px - 16px
```

Digunakan untuk:

* modal
* POS cart
* payment dialog
* major container

### Full

```text
9999px
```

Hanya digunakan untuk:

* avatar
* status dot
* circular button
* quantity control tertentu

Jangan membuat semua elemen berbentuk pill.

---

# 8. Spacing System

Gunakan spacing berbasis kelipatan 4px.

```text
4px
8px
12px
16px
24px
32px
```

## Desktop

Content margin:

```text
24px
```

Gutter:

```text
16px
```

## Mobile

Content margin:

```text
16px
```

Gutter:

```text
12px
```

---

# 9. Application Layout

WarunkPakEdy memiliki dua mode utama:

1. POS / Kasir
2. Admin / Back Office

---

# 10. Admin Layout

Desktop menggunakan:

```text
Sidebar + Header + Content
```

Sidebar:

```text
240px expanded
64px collapsed
```

Content menggunakan responsive 12-column grid.

---

## Sidebar Navigation

### UTAMA

* Dashboard
* Kasir

### TOKO

* Produk
* Stok
* Pembelian
* Supplier
* Pelanggan

### TRANSAKSI

* Penjualan
* Retur

### LAPORAN

* Laporan Penjualan
* Laporan Stok
* Laporan Keuntungan

### SISTEM

* Pengguna
* Pengaturan

---

## Sidebar Rules

Sidebar harus:

* sederhana
* mudah dipindai
* memiliki active state yang jelas
* tidak menggunakan icon yang terlalu dekoratif
* memiliki grouping menu
* tetap usable ketika collapsed

Active navigation:

```text
background: #ECFDF5
text: #047857
```

---

# 11. Dashboard

Dashboard digunakan terutama oleh Owner.

Struktur:

```text
Page Header
↓
KPI Cards
↓
Sales Chart + Summary
↓
Recent Transactions
↓
Low Stock
```

## KPI

Minimal:

* Penjualan Hari Ini
* Total Transaksi
* Keuntungan
* Stok Menipis

Card harus compact dan informatif.

Jangan membuat KPI card terlalu besar.

---

# 12. POS / Kasir

POS merupakan halaman paling penting dalam sistem.

Desktop:

```text
┌─────────────────────────────────────────────┐
│ Search / Barcode / Category                 │
├─────────────────────────────┬───────────────┤
│                             │               │
│ Product Catalog             │ Cart          │
│                             │               │
│ 65%                         │ 35%           │
│                             │               │
│                             │ Total         │
│                             │ BAYAR         │
└─────────────────────────────┴───────────────┘
```

Pada desktop:

```text
65% Product Area
35% Cart
```

Cart minimum:

```text
380px
```

---

## Product Search

Search harus mendukung:

* nama produk
* SKU
* barcode

Placeholder:

```text
Cari produk atau scan barcode...
```

Barcode scanner harus dapat bekerja seperti input keyboard biasa.

---

## Product Card

Product card menampilkan:

* gambar produk
* nama
* harga
* stok
* kategori jika diperlukan

Contoh:

```text
Indomie Goreng
Rp 3.500
Stok 24
```

Click product:

```text
Add to cart
```

Feedback harus cepat.

---

# 13. Cart

Cart menampilkan:

* nama produk
* harga
* quantity
* subtotal
* remove
* discount jika tersedia

Quantity control:

```text
−   2   +
```

Total:

```text
Subtotal
Diskon
Pajak
Total
```

Total harus menjadi elemen visual paling menonjol di panel cart.

---

# 14. Payment

Metode pembayaran:

* Tunai
* QRIS
* Transfer
* E-Wallet

Payment button:

```text
Bayar (F9)
```

Primary button harus full width pada panel POS.

---

## Cash Payment

Sediakan quick denomination:

```text
Rp 10.000
Rp 20.000
Rp 50.000
Rp 100.000
Uang Pas
```

Input nominal harus menggunakan format Rupiah.

Setelah pembayaran:

```text
Total
Dibayar
Kembalian
```

---

# 15. Payment Success

Setelah transaksi berhasil:

* tampilkan status berhasil
* nomor transaksi
* total
* metode pembayaran
* waktu transaksi

Actions:

```text
Cetak Struk
Transaksi Baru
```

Modal tidak boleh terlalu dekoratif.

---

# 16. Product Management

Halaman Produk harus mendukung:

* daftar produk
* tambah produk
* edit produk
* hapus produk
* kategori
* SKU
* barcode
* harga beli
* harga jual
* stok
* minimum stok

Filter:

* kategori
* status stok
* pencarian

---

# 17. Inventory Management

Inventory harus menyediakan informasi:

* stok saat ini
* stok minimum
* stok masuk
* stok keluar
* penyesuaian stok
* stock opname

Status:

```text
Normal
Menipis
Habis
```

Gunakan semantic color sesuai status.

---

# 18. Purchase

Pembelian digunakan untuk mencatat restock dari supplier.

Informasi:

* supplier
* tanggal
* nomor pembelian
* produk
* quantity
* harga beli
* subtotal
* total
* status

---

# 19. Supplier

Data supplier minimal:

* nama supplier
* nomor telepon
* alamat
* catatan
* status

Supplier dapat digunakan dalam transaksi pembelian.

---

# 20. Customer

Data pelanggan dapat digunakan untuk:

* transaksi
* riwayat pembelian
* transaksi bon/kasbon

Informasi:

* nama
* nomor telepon
* alamat
* total transaksi
* status

---

# 21. Sales History

Riwayat transaksi harus menyediakan:

* nomor transaksi
* tanggal
* kasir
* pelanggan
* total
* metode pembayaran
* status

Status contoh:

```text
Lunas
Bon
Pending
Dibatalkan
Diretur
```

---

# 22. Reports

Laporan harus mudah dibaca.

Jenis:

### Laporan Penjualan

* total penjualan
* jumlah transaksi
* rata-rata transaksi
* produk terlaris
* grafik penjualan

### Laporan Stok

* stok tersedia
* stok menipis
* stok habis
* pergerakan stok

### Laporan Keuntungan

* omzet
* modal
* keuntungan
* margin

Filter:

* hari ini
* minggu ini
* bulan ini
* custom date range

---

# 23. Tables

Table header:

```text
background: #F8FAFC
border-bottom: 2px solid #E2E8F0
```

Header text:

```text
11px
600
uppercase
#64748B
```

Row:

```text
border-bottom: 1px solid #F1F5F9
```

Hover:

```text
#F8FAFC
```

Numeric column:

```text
text-align: right;
font-variant-numeric: tabular-nums;
```

---

# 24. Buttons

## Primary

```text
background: #047857
color: #FFFFFF
font-weight: 600
```

Hover:

```text
#065F46
```

Active:

```text
#064E3B
```

Minimum height:

```text
Desktop: 40px
Mobile: 44px
```

---

## Secondary

```text
background: #FFFFFF
border: 1px solid #CBD5E1
color: #0F172A
```

Hover:

```text
#F1F5F9
```

---

## Danger

```text
background: #FEF2F2
border: 1px solid #FCA5A5
color: #DC2626
```

Digunakan untuk:

* Hapus
* Void
* Batalkan
* Delete

---

# 25. Form Fields

Default:

```text
background: #FFFFFF
border: 1px solid #CBD5E1
border-radius: 8px
padding: 8px 12px
```

Placeholder:

```text
#94A3B8
```

Focus:

```text
border: #047857
```

Focus ring:

```text
rgba(4, 120, 87, 0.15)
```

Input harus memiliki label yang jelas.

Jangan mengandalkan placeholder sebagai satu-satunya label.

---

# 26. Status Badges

## Lunas

```text
background: #DCFCE7
color: #15803D
```

## Bon / Kasbon

```text
background: #FEF3C7
color: #B45309
```

## Habis

```text
background: #FEE2E2
color: #B91C1C
```

Badge:

```text
padding: 2px 8px
border-radius: 4px
font-size: 12px
font-weight: 600
```

---

# 27. Cards

Default:

```text
background: #FFFFFF
border: 1px solid #E2E8F0
border-radius: 8px
```

Tidak perlu shadow pada keadaan normal.

Card harus memiliki fungsi yang jelas.

Hindari membuat setiap informasi menjadi card terpisah.

---

# 28. Elevation

## Level 0

Application background:

```text
#F8FAFC
```

## Level 1

Cards:

```text
#FFFFFF
border: 1px solid #E2E8F0
```

Tidak membutuhkan shadow.

## Level 2

Dropdown:

```text
box-shadow:
0 4px 6px -1px rgba(15, 23, 42, 0.06),
0 2px 4px -2px rgba(15, 23, 42, 0.04);
```

## Level 3

Modal:

```text
box-shadow:
0 10px 15px -3px rgba(15, 23, 42, 0.1),
0 4px 6px -4px rgba(15, 23, 42, 0.05);
```

Overlay:

```text
rgba(15, 23, 42, 0.5)
```

Jangan menggunakan:

* blur filter
* heavy glassmorphism
* excessive shadows

---

# 29. Responsive Design

## Mobile

```text
< 640px
```

Rules:

* single column
* content margin 16px
* minimum touch target 44px
* tables dapat berubah menjadi card/list
* sidebar menjadi drawer atau bottom navigation
* POS cart menjadi bottom sheet

---

## Tablet

```text
640px - 1023px
```

Rules:

* two-column layout jika memungkinkan
* collapsible sidebar
* floating cart trigger
* touch-friendly controls

---

## Desktop

```text
>= 1024px
```

Rules:

* permanent sidebar
* POS split layout
* full table
* multi-column dashboard
* keyboard-friendly workflow

---

# 30. Accessibility

Semua interactive element harus:

* memiliki visible focus state
* memiliki label yang jelas
* dapat digunakan dengan keyboard
* memiliki touch target minimal 44px pada mobile
* memiliki contrast yang cukup

Jangan menggunakan warna sebagai satu-satunya indikator status.

Contoh:

Jangan hanya:

```text
● Merah
```

Gunakan:

```text
● Stok Habis
```

---

# 31. POS Keyboard Shortcuts

POS harus mendukung workflow keyboard.

Shortcut utama:

```text
F9       → Bayar
Esc      → Tutup modal
Enter    → Konfirmasi
↑ / ↓    → Navigasi produk jika relevan
Delete   → Hapus item yang dipilih
```

Shortcut harus tidak mengganggu input form biasa.

---

# 32. Feedback & Interaction

Gunakan feedback yang cepat dan jelas:

* Toast
* Loading state
* Skeleton
* Empty state
* Error state
* Confirmation dialog
* Success state

Animasi harus singkat.

Gunakan animasi hanya ketika membantu memahami perubahan interface.

Hindari animasi dekoratif.

---

# 33. Loading State

Loading tidak boleh menyebabkan layout berubah drastis.

Gunakan:

* skeleton
* disabled button
* loading spinner pada action

Contoh:

```text
Menyimpan...
Memproses pembayaran...
Memuat data...
```

---

# 34. Empty State

Empty state harus menjelaskan:

1. apa yang kosong
2. mengapa mungkin kosong
3. tindakan yang bisa dilakukan

Contoh:

```text
Belum ada produk

Tambahkan produk pertama untuk mulai menggunakan kasir.

[ Tambah Produk ]
```

---

# 35. Confirmation Dialog

Gunakan confirmation dialog untuk tindakan berisiko:

* hapus produk
* hapus transaksi
* void transaksi
* retur
* perubahan stok besar
* logout jika diperlukan

Dialog harus menjelaskan konsekuensi.

Contoh:

```text
Hapus Produk?

Produk ini akan dihapus dari daftar produk.
Data transaksi sebelumnya tetap dipertahankan.

[Batal] [Hapus Produk]
```

---

# 36. Indonesian Localization

Seluruh UI menggunakan Bahasa Indonesia.

Gunakan istilah yang familiar bagi pengguna UMKM.

Contoh:

```text
Dashboard
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

Hindari istilah teknis yang tidak diperlukan.

---

# 37. Currency Formatting

Semua nilai uang menggunakan format Indonesia:

```text
Rp 10.000
Rp 25.000
Rp 1.250.000
```

Jangan menggunakan:

```text
10,000
25.00
1,250.00
```

Gunakan `Intl.NumberFormat('id-ID')` pada frontend atau formatter yang konsisten dari backend.

---

# 38. Date & Time

Gunakan format Indonesia.

Contoh:

```text
26 September 2026
14:30
```

Untuk tabel yang membutuhkan informasi ringkas:

```text
26 Sep 2026, 14:30
```

---

# 39. Component Reusability

Komponen yang memiliki pola sama harus dibuat reusable.

Contoh:

```text
Button
Input
Select
Modal
Dialog
Badge
Card
DataTable
Pagination
SearchInput
DatePicker
StatCard
ProductCard
StatusBadge
```

Jangan membuat komponen yang sama berulang kali hanya karena digunakan pada halaman berbeda.

---

# 40. React Architecture

Frontend menggunakan:

```text
React
TypeScript
Inertia.js
Tailwind CSS
shadcn/ui
```

Struktur komponen dianjurkan:

```text
resources/js/
├── components/
├── layouts/
├── pages/
├── hooks/
├── types/
└── lib/
```

Page harus fokus pada:

* data
* state
* composition

Reusable UI dipindahkan ke `components`.

---

# 41. Laravel Architecture

Backend menggunakan:

```text
Laravel 13
PHP 8.3
MySQL
```

Gunakan pemisahan yang jelas antara:

* Models
* Controllers
* Requests
* Policies
* Services
* Resources
* Jobs jika diperlukan

Business logic jangan diletakkan seluruhnya di Controller.

---

# 42. Database-Oriented UI

UI harus dirancang berdasarkan data nyata.

Jangan membuat interface yang hanya cocok dengan dummy data.

Contoh entity utama:

```text
User
Role
Product
Category
Supplier
Customer
Purchase
PurchaseItem
Sale
SaleItem
Payment
InventoryMovement
StockOpname
Return
ReturnItem
AuditLog
```

Struktur final database dapat berkembang selama development.

---

# 43. Role-Based Interface

Minimal role:

```text
Owner
Admin
Kasir
```

### Owner

Akses:

* Dashboard
* Kasir
* Produk
* Stok
* Pembelian
* Supplier
* Pelanggan
* Penjualan
* Retur
* Semua laporan
* Pengguna
* Pengaturan

### Admin

Akses operasional toko sesuai permission.

### Kasir

Fokus pada:

* Kasir
* transaksi
* pelanggan jika diperlukan
* riwayat transaksi sesuai permission

UI harus menampilkan menu berdasarkan permission.

Jangan hanya menyembunyikan tombol tanpa mengamankan endpoint backend.

---

# 44. Performance

WarunkPakEdy harus tetap ringan.

Hindari:

* gambar berukuran terlalu besar
* library yang tidak diperlukan
* animasi berat
* efek blur
* komponen dengan render berlebihan
* request API yang tidak perlu

POS harus terasa cepat ketika:

* mencari produk
* scan barcode
* menambah produk ke cart
* mengubah quantity
* membuka pembayaran

---

# 45. Design Consistency Rules

Semua halaman harus konsisten dalam:

* sidebar
* header
* typography
* spacing
* button
* form
* badge
* table
* modal
* notification
* color
* responsive behavior

Jika sebuah komponen sudah memiliki pola visual, jangan membuat variasi baru tanpa alasan UX yang jelas.

---

# 46. Stitch Implementation Rule

Export dari Google Stitch digunakan sebagai **visual reference dan initial UI reference**.

Jangan melakukan copy-paste HTML Stitch secara mentah ke production code.

Implementasikan ulang menggunakan:

```text
React
TypeScript
Inertia.js
Tailwind CSS
shadcn/ui
```

Pertahankan:

* layout
* hierarchy
* spacing
* typography
* warna
* interaction pattern
* responsive behavior

Tetapi struktur kode harus mengikuti arsitektur aplikasi WarunkPakEdy.

---

# 47. Anti AI-Slop Rules

Kode dan UI harus terlihat seperti aplikasi yang dikembangkan secara sengaja.

### Jangan

* membuat komponen terlalu generik tanpa kebutuhan
* menggunakan nama variable tidak jelas
* membuat file React sangat panjang
* menduplikasi UI
* menggunakan dummy logic pada fitur production
* menambahkan fitur yang tidak dibutuhkan
* membuat semua section menjadi card
* membuat dashboard terlalu penuh
* menggunakan gradient untuk mempercantik UI
* menggunakan animasi hanya untuk terlihat modern

### Harus

* naming konsisten
* component reusable
* type-safe
* business logic jelas
* state management jelas
* validation
* error handling
* loading state
* empty state
* responsive
* accessible
* mudah dipelihara

---

# 48. Visual Priority

Pada setiap halaman tentukan hierarchy.

Contoh POS:

```text
1. Produk
2. Cart
3. Total
4. Bayar
5. Informasi tambahan
```

Contoh Dashboard:

```text
1. Penjualan
2. Transaksi
3. Keuntungan
4. Stok menipis
5. Detail
```

Jangan membuat semua elemen memiliki visual importance yang sama.

---

# 49. Core UX Principle

WarunkPakEdy harus mengikuti prinsip:

> **Simple. Cepat. Jelas.**

Setiap screen harus menjawab tiga pertanyaan:

1. Saya sedang berada di mana?
2. Apa yang bisa saya lakukan?
3. Apa hasil dari tindakan saya?

Jika sebuah elemen tidak membantu pengguna memahami atau menyelesaikan pekerjaan, pertimbangkan untuk menghapusnya.

---

# 50. Final Design Goal

WarunkPakEdy bukan hanya dashboard demo.

Target akhirnya adalah sebuah **aplikasi POS & inventory yang realistis dan usable untuk bisnis retail Indonesia**, dengan interface yang:

* modern
* profesional
* cepat
* sederhana
* responsive
* mudah digunakan
* scalable
* maintainable
* cocok untuk portfolio
* siap dikembangkan menjadi aplikasi production

**Design principle:**

> **Simple. Cepat. Jelas.**
