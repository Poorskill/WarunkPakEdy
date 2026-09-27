# WarunkPakEdy — Database Design

Dokumen ini menjadi acuan struktur database untuk **WarunkPakEdy POS System**.

Database dirancang untuk mendukung:

* Produk
* Kategori
* Supplier
* Pelanggan
* Pengguna
* Stok
* Pembelian
* Penjualan
* Pembayaran
* Retur
* Pergerakan stok
* Laporan

Database menggunakan **MySQL**.

---

# 1. Database Configuration

Database:

```text
warunkpakedy
```

DBMS:

```text
MySQL
```

Configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=warunkpakedy
DB_USERNAME=root
DB_PASSWORD=
```

---

# 2. Database Principles

Struktur database mengikuti beberapa prinsip:

1. Hindari data duplikat.
2. Gunakan foreign key untuk relasi.
3. Gunakan transaction untuk proses penting.
4. Data transaksi tidak boleh bergantung pada data master yang dapat berubah.
5. Perubahan stok harus dapat dilacak.
6. Penghapusan data penting sebaiknya menggunakan soft delete jika diperlukan.
7. Nominal uang menggunakan tipe `decimal`, bukan `float`.
8. Quantity menggunakan tipe numerik yang sesuai kebutuhan produk.
9. Semua tabel utama memiliki timestamp.
10. Business logic tidak disimpan di frontend.

---

# 3. Entity Overview

Struktur utama:

```text
users
categories
products
suppliers
customers

purchases
purchase_items

sales
sale_items
payments

stock_movements
stock_opnames
stock_opname_items

returns
return_items
```

Relasi bisnis:

```text
Category
   ↓
Product
   ↓
Stock Movement
   ↑
Purchase
   ↑
Supplier

Product
   ↓
Sale Item
   ↑
Sale
   ↓
Payment

Sale
   ↓
Return
   ↓
Return Item
```

---

# 4. Users

Table:

```text
users
```

Digunakan untuk authentication dan pengguna sistem.

### Fields

| Field              | Type         | Keterangan       |
| ------------------ | ------------ | ---------------- |
| id                 | BIGINT       | Primary key      |
| name               | VARCHAR(255) | Nama pengguna    |
| email              | VARCHAR(255) | Email            |
| password           | VARCHAR(255) | Password         |
| role               | VARCHAR(50)  | Role pengguna    |
| two_factor_enabled | BOOLEAN      | Status 2FA       |
| created_at         | TIMESTAMP    | Waktu dibuat     |
| updated_at         | TIMESTAMP    | Waktu diperbarui |

### Role

```text
owner
admin
cashier
```

Catatan:

Authorization tetap dilakukan pada backend.

---

# 5. Categories

Table:

```text
categories
```

Menyimpan kategori produk.

### Fields

| Field       | Type         | Keterangan       |
| ----------- | ------------ | ---------------- |
| id          | BIGINT       | Primary key      |
| name        | VARCHAR(100) | Nama kategori    |
| description | TEXT         | Deskripsi        |
| created_at  | TIMESTAMP    | Waktu dibuat     |
| updated_at  | TIMESTAMP    | Waktu diperbarui |

### Relationship

```text
categories
    1
    │
    │
    N
products
```

Satu kategori dapat memiliki banyak produk.

---

# 6. Products

Table:

```text
products
```

Menyimpan data master produk.

### Fields

| Field          | Type          | Keterangan       |
| -------------- | ------------- | ---------------- |
| id             | BIGINT        | Primary key      |
| category_id    | BIGINT        | FK categories    |
| sku            | VARCHAR(100)  | Kode produk      |
| barcode        | VARCHAR(100)  | Barcode          |
| name           | VARCHAR(255)  | Nama produk      |
| description    | TEXT          | Deskripsi        |
| purchase_price | DECIMAL(15,2) | Harga beli       |
| selling_price  | DECIMAL(15,2) | Harga jual       |
| stock          | DECIMAL(15,3) | Stok saat ini    |
| minimum_stock  | DECIMAL(15,3) | Batas minimum    |
| unit           | VARCHAR(50)   | Satuan           |
| is_active      | BOOLEAN       | Status produk    |
| created_at     | TIMESTAMP     | Waktu dibuat     |
| updated_at     | TIMESTAMP     | Waktu diperbarui |
| deleted_at     | TIMESTAMP     | Soft delete      |

### Contoh Unit

```text
pcs
box
pack
kg
gram
liter
botol
dus
```

---

# 7. Suppliers

Table:

```text
suppliers
```

Menyimpan data supplier.

### Fields

| Field      | Type         | Keterangan       |
| ---------- | ------------ | ---------------- |
| id         | BIGINT       | Primary key      |
| name       | VARCHAR(255) | Nama supplier    |
| phone      | VARCHAR(50)  | Nomor telepon    |
| email      | VARCHAR(255) | Email            |
| address    | TEXT         | Alamat           |
| notes      | TEXT         | Catatan          |
| is_active  | BOOLEAN      | Status supplier  |
| created_at | TIMESTAMP    | Waktu dibuat     |
| updated_at | TIMESTAMP    | Waktu diperbarui |
| deleted_at | TIMESTAMP    | Soft delete      |

---

# 8. Customers

Table:

```text
customers
```

Menyimpan data pelanggan.

### Fields

| Field      | Type         | Keterangan       |
| ---------- | ------------ | ---------------- |
| id         | BIGINT       | Primary key      |
| name       | VARCHAR(255) | Nama pelanggan   |
| phone      | VARCHAR(50)  | Nomor telepon    |
| email      | VARCHAR(255) | Email            |
| address    | TEXT         | Alamat           |
| notes      | TEXT         | Catatan          |
| created_at | TIMESTAMP    | Waktu dibuat     |
| updated_at | TIMESTAMP    | Waktu diperbarui |
| deleted_at | TIMESTAMP    | Soft delete      |

Pelanggan dapat bersifat opsional pada transaksi.

---

# 9. Purchases

Table:

```text
purchases
```

Header transaksi pembelian dari supplier.

### Fields

| Field           | Type          | Keterangan        |
| --------------- | ------------- | ----------------- |
| id              | BIGINT        | Primary key       |
| purchase_number | VARCHAR(50)   | Nomor pembelian   |
| supplier_id     | BIGINT        | FK supplier       |
| user_id         | BIGINT        | User pembuat      |
| purchase_date   | DATETIME      | Tanggal pembelian |
| subtotal        | DECIMAL(15,2) | Subtotal          |
| discount        | DECIMAL(15,2) | Diskon            |
| tax             | DECIMAL(15,2) | Pajak             |
| total           | DECIMAL(15,2) | Total             |
| status          | VARCHAR(30)   | Status            |
| notes           | TEXT          | Catatan           |
| created_at      | TIMESTAMP     | Waktu dibuat      |
| updated_at      | TIMESTAMP     | Waktu diperbarui  |

### Status

```text
draft
completed
cancelled
```

---

# 10. Purchase Items

Table:

```text
purchase_items
```

Detail produk dalam pembelian.

### Fields

| Field          | Type          | Keterangan       |
| -------------- | ------------- | ---------------- |
| id             | BIGINT        | Primary key      |
| purchase_id    | BIGINT        | FK purchases     |
| product_id     | BIGINT        | FK products      |
| quantity       | DECIMAL(15,3) | Quantity         |
| purchase_price | DECIMAL(15,2) | Harga beli       |
| subtotal       | DECIMAL(15,2) | Subtotal         |
| created_at     | TIMESTAMP     | Waktu dibuat     |
| updated_at     | TIMESTAMP     | Waktu diperbarui |

Relationship:

```text
purchase
   1
   │
   N
purchase_items
   │
   N
   │
   1
product
```

---

# 11. Sales

Table:

```text
sales
```

Header transaksi penjualan.

### Fields

| Field          | Type          | Keterangan       |
| -------------- | ------------- | ---------------- |
| id             | BIGINT        | Primary key      |
| invoice_number | VARCHAR(50)   | Nomor transaksi  |
| user_id        | BIGINT        | Kasir            |
| customer_id    | BIGINT        | Pelanggan        |
| sale_date      | DATETIME      | Waktu transaksi  |
| subtotal       | DECIMAL(15,2) | Subtotal         |
| discount       | DECIMAL(15,2) | Diskon           |
| tax            | DECIMAL(15,2) | Pajak            |
| total          | DECIMAL(15,2) | Total            |
| status         | VARCHAR(30)   | Status           |
| notes          | TEXT          | Catatan          |
| created_at     | TIMESTAMP     | Waktu dibuat     |
| updated_at     | TIMESTAMP     | Waktu diperbarui |

### Status

```text
completed
pending
cancelled
returned
```

Customer bersifat nullable.

---

# 12. Sale Items

Table:

```text
sale_items
```

Detail produk yang dijual.

### Fields

| Field        | Type          | Keterangan       |
| ------------ | ------------- | ---------------- |
| id           | BIGINT        | Primary key      |
| sale_id      | BIGINT        | FK sales         |
| product_id   | BIGINT        | FK products      |
| product_name | VARCHAR(255)  | Snapshot nama    |
| sku          | VARCHAR(100)  | Snapshot SKU     |
| quantity     | DECIMAL(15,3) | Quantity         |
| unit_price   | DECIMAL(15,2) | Harga jual       |
| discount     | DECIMAL(15,2) | Diskon           |
| subtotal     | DECIMAL(15,2) | Subtotal         |
| created_at   | TIMESTAMP     | Waktu dibuat     |
| updated_at   | TIMESTAMP     | Waktu diperbarui |

### Mengapa menyimpan snapshot?

Nama produk atau SKU dapat berubah setelah transaksi.

Data transaksi lama tetap harus menampilkan informasi ketika transaksi terjadi.

---

# 13. Payments

Table:

```text
payments
```

Menyimpan pembayaran transaksi.

### Fields

| Field            | Type          | Keterangan           |
| ---------------- | ------------- | -------------------- |
| id               | BIGINT        | Primary key          |
| sale_id          | BIGINT        | FK sales             |
| payment_method   | VARCHAR(50)   | Metode pembayaran    |
| amount           | DECIMAL(15,2) | Nominal dibayar      |
| paid_at          | DATETIME      | Waktu pembayaran     |
| reference_number | VARCHAR(100)  | Referensi pembayaran |
| notes            | TEXT          | Catatan              |
| created_at       | TIMESTAMP     | Waktu dibuat         |
| updated_at       | TIMESTAMP     | Waktu diperbarui     |

### Payment Method

```text
cash
qris
transfer
ewallet
```

Untuk cash, sistem menghitung:

```text
change = amount - total
```

Nilai kembalian dapat dihitung saat transaksi tanpa harus disimpan sebagai field utama.

---

# 14. Stock Movements

Table:

```text
stock_movements
```

Digunakan untuk mencatat setiap perubahan stok.

### Fields

| Field          | Type          | Keterangan       |
| -------------- | ------------- | ---------------- |
| id             | BIGINT        | Primary key      |
| product_id     | BIGINT        | FK products      |
| user_id        | BIGINT        | User             |
| type           | VARCHAR(30)   | Jenis movement   |
| quantity       | DECIMAL(15,3) | Quantity         |
| stock_before   | DECIMAL(15,3) | Stok sebelum     |
| stock_after    | DECIMAL(15,3) | Stok sesudah     |
| reference_type | VARCHAR(50)   | Tipe sumber      |
| reference_id   | BIGINT        | ID sumber        |
| notes          | TEXT          | Catatan          |
| created_at     | TIMESTAMP     | Waktu dibuat     |
| updated_at     | TIMESTAMP     | Waktu diperbarui |

### Movement Type

```text
purchase
sale
return
adjustment
opname
```

Contoh:

```text
Stok sebelum : 20
Movement    : sale -2
Stok sesudah: 18
```

---

# 15. Stock Opnames

Table:

```text
stock_opnames
```

Header stock opname.

### Fields

| Field         | Type        | Keterangan       |
| ------------- | ----------- | ---------------- |
| id            | BIGINT      | Primary key      |
| opname_number | VARCHAR(50) | Nomor opname     |
| user_id       | BIGINT      | User             |
| opname_date   | DATETIME    | Tanggal          |
| status        | VARCHAR(30) | Status           |
| notes         | TEXT        | Catatan          |
| created_at    | TIMESTAMP   | Waktu dibuat     |
| updated_at    | TIMESTAMP   | Waktu diperbarui |

Status:

```text
draft
completed
cancelled
```

---

# 16. Stock Opname Items

Table:

```text
stock_opname_items
```

Detail hasil stock opname.

### Fields

| Field           | Type          | Keterangan       |
| --------------- | ------------- | ---------------- |
| id              | BIGINT        | Primary key      |
| stock_opname_id | BIGINT        | FK stock_opnames |
| product_id      | BIGINT        | FK products      |
| system_stock    | DECIMAL(15,3) | Stok sistem      |
| actual_stock    | DECIMAL(15,3) | Stok fisik       |
| difference      | DECIMAL(15,3) | Selisih          |
| notes           | TEXT          | Catatan          |
| created_at      | TIMESTAMP     | Waktu dibuat     |
| updated_at      | TIMESTAMP     | Waktu diperbarui |

Formula:

```text
difference = actual_stock - system_stock
```

---

# 17. Returns

Table:

```text
returns
```

Header transaksi retur.

### Fields

| Field         | Type          | Keterangan          |
| ------------- | ------------- | ------------------- |
| id            | BIGINT        | Primary key         |
| return_number | VARCHAR(50)   | Nomor retur         |
| sale_id       | BIGINT        | Transaksi penjualan |
| user_id       | BIGINT        | User                |
| return_date   | DATETIME      | Tanggal             |
| reason        | TEXT          | Alasan              |
| total         | DECIMAL(15,2) | Total retur         |
| status        | VARCHAR(30)   | Status              |
| created_at    | TIMESTAMP     | Waktu dibuat        |
| updated_at    | TIMESTAMP     | Waktu diperbarui    |

---

# 18. Return Items

Table:

```text
return_items
```

Detail produk yang diretur.

### Fields

| Field        | Type          | Keterangan       |
| ------------ | ------------- | ---------------- |
| id           | BIGINT        | Primary key      |
| return_id    | BIGINT        | FK returns       |
| sale_item_id | BIGINT        | FK sale_items    |
| product_id   | BIGINT        | FK products      |
| quantity     | DECIMAL(15,3) | Quantity retur   |
| unit_price   | DECIMAL(15,2) | Harga            |
| subtotal     | DECIMAL(15,2) | Subtotal         |
| created_at   | TIMESTAMP     | Waktu dibuat     |
| updated_at   | TIMESTAMP     | Waktu diperbarui |

---

# 19. Relationship Map

Relasi utama:

```text
users
 │
 ├────────────── purchases
 │                    │
 │                    └── purchase_items ── products
 │
 ├────────────── sales
 │                    │
 │                    ├── sale_items ────── products
 │                    │
 │                    └── payments
 │
 ├────────────── stock_movements
 │
 ├────────────── stock_opnames
 │                    │
 │                    └── stock_opname_items ── products
 │
 └────────────── returns
                      │
                      └── return_items ─────── products


categories
    │
    └──────── products

suppliers
    │
    └──────── purchases

customers
    │
    └──────── sales
```

---

# 20. Product & Stock Flow

```text
PRODUCT
   │
   ├── Purchase
   │      ↓
   │   Stock +
   │      ↓
   │   Movement
   │
   ├── Sale
   │      ↓
   │   Stock -
   │      ↓
   │   Movement
   │
   ├── Return
   │      ↓
   │   Stock +
   │      ↓
   │   Movement
   │
   └── Adjustment / Opname
          ↓
       Stock ±
          ↓
       Movement
```

---

# 21. Sales Flow

```text
Kasir
  ↓
Create Sale
  ↓
Sale Items
  ↓
Calculate Subtotal
  ↓
Discount
  ↓
Tax
  ↓
Total
  ↓
Payment
  ↓
Transaction Completed
  ↓
Reduce Product Stock
  ↓
Create Stock Movement
```

Proses transaksi penjualan harus menggunakan database transaction agar proses tidak berhenti pada kondisi setengah selesai.

---

# 22. Purchase Flow

```text
Supplier
   ↓
Purchase
   ↓
Purchase Items
   ↓
Confirm Purchase
   ↓
Increase Stock
   ↓
Create Stock Movement
```

---

# 23. Return Flow

```text
Completed Sale
      ↓
Select Transaction
      ↓
Select Item
      ↓
Quantity Return
      ↓
Reason
      ↓
Confirm Return
      ↓
Create Return
      ↓
Increase Stock
      ↓
Create Stock Movement
```

---

# 24. Indexing

Field yang sering digunakan untuk pencarian harus memiliki index.

Minimal:

```text
products.sku
products.barcode
products.name
products.category_id

sales.invoice_number
sales.sale_date
sales.user_id
sales.customer_id

purchases.purchase_number
purchases.purchase_date
purchases.supplier_id

stock_movements.product_id
stock_movements.created_at
```

Unique:

```text
products.sku
products.barcode
sales.invoice_number
purchases.purchase_number
returns.return_number
stock_opnames.opname_number
```

Barcode dapat dibuat nullable jika terdapat produk tanpa barcode.

---

# 25. Money & Quantity

Semua nilai uang:

```text
DECIMAL(15,2)
```

Contoh:

```text
10000.00
1250000.00
```

Quantity:

```text
DECIMAL(15,3)
```

Digunakan agar produk dengan satuan seperti kilogram atau liter dapat didukung.

Contoh:

```text
1
1.5
2.250
```

---

# 26. Soft Delete

Soft delete dapat digunakan pada master data:

```text
products
suppliers
customers
```

Tujuannya agar data yang sudah digunakan dalam transaksi tidak benar-benar hilang dari database.

Contoh:

Produk lama:

```text
is_active = false
deleted_at = timestamp
```

Data transaksi tetap aman.

---

# 27. Transaction Integrity

Proses berikut wajib menggunakan database transaction:

### Penjualan

```text
Create Sale
Create Sale Items
Create Payment
Update Stock
Create Stock Movement
```

### Pembelian

```text
Create Purchase
Create Purchase Items
Update Stock
Create Stock Movement
```

### Retur

```text
Create Return
Create Return Items
Update Stock
Create Stock Movement
```

### Stock Opname

```text
Create Opname
Create Opname Items
Update Stock
Create Stock Movement
```

Jika salah satu proses gagal, perubahan harus dapat di-rollback.

---

# 28. Stock Rules

Stock tidak boleh menjadi nilai yang berubah tanpa alasan yang dapat dilacak.

Setiap perubahan harus berasal dari:

```text
Purchase
Sale
Return
Adjustment
Stock Opname
```

Contoh:

```text
Stock = 10

Sale 2
↓
Stock = 8

Purchase 5
↓
Stock = 13
```

---

# 29. Sales Rules

Transaksi tidak boleh diselesaikan apabila:

```text
quantity <= 0
```

atau:

```text
stock < requested_quantity
```

kecuali sistem nantinya secara eksplisit mendukung negative stock.

Untuk versi awal:

```text
Negative stock = disabled
```

---

# 30. Purchase Rules

Pembelian yang sudah:

```text
completed
```

akan:

```text
menambah stok
```

Pembelian:

```text
draft
```

belum memengaruhi stok.

Pembelian:

```text
cancelled
```

tidak boleh menambah stok.

---

# 31. Return Rules

Quantity retur tidak boleh melebihi quantity yang dapat diretur dari transaksi.

Contoh:

```text
Dibeli:
5 pcs

Sudah diretur:
2 pcs

Maksimal retur berikutnya:
3 pcs
```

---

# 32. Reporting Data

Laporan dapat menggunakan data dari:

### Penjualan

```text
sales
sale_items
payments
```

### Stok

```text
products
stock_movements
```

### Pembelian

```text
purchases
purchase_items
```

### Keuntungan

Secara dasar:

```text
Revenue - Cost of Goods Sold
```

Namun perhitungan profit final harus ditentukan ketika metode costing inventory sudah dipilih.

---

# 33. Profit Calculation

Untuk tahap awal, setiap `sale_item` menyimpan:

```text
unit_price
```

Sedangkan harga modal:

```text
purchase_price
```

masih berasal dari data produk atau mekanisme costing yang nantinya ditentukan.

Jika membutuhkan laporan keuntungan yang akurat terhadap perubahan harga beli, sistem sebaiknya dikembangkan menggunakan snapshot cost pada saat penjualan.

Hal ini perlu ditentukan sebelum fitur laporan keuntungan production dibuat.

---

# 34. Future Expansion

Struktur database dapat dikembangkan untuk:

```text
Multi Outlet
Multi Warehouse
Multi Payment
Expense
Cashier Shift
Cash Drawer
Discount Rules
Promotions
Product Variants
Barcode Scanner
Purchase Return
Customer Debt
Supplier Debt
Audit Log
Notifications
```

Fitur tersebut **tidak wajib dibuat pada versi awal**.

---

# 35. Initial MVP Tables

Untuk MVP, tabel prioritas:

```text
users
categories
products
suppliers
customers
purchases
purchase_items
sales
sale_items
payments
stock_movements
```

Setelah MVP stabil:

```text
stock_opnames
stock_opname_items
returns
return_items
```

Kemudian fitur tambahan dapat dikembangkan.

---

# 36. Recommended Development Order

Urutan implementasi database:

```text
1. users
2. categories
3. products
4. suppliers
5. customers
6. purchases
7. purchase_items
8. sales
9. sale_items
10. payments
11. stock_movements
12. stock_opnames
13. stock_opname_items
14. returns
15. return_items
```

---

# 37. Database Development Principle

Database harus mendukung alur bisnis utama:

```text
PRODUCT
   ↓
STOCK
   ↓
PURCHASE / SALE
   ↓
STOCK MOVEMENT
   ↓
REPORT
```

Bukan sekadar membuat tabel berdasarkan halaman UI.

---

# 38. Final Database Goal

Database WarunkPakEdy harus:

* konsisten
* dapat dilacak
* aman terhadap transaksi parsial
* mudah dikembangkan
* mendukung laporan
* mendukung role & permission
* mampu menangani perubahan stok
* menjaga histori transaksi
* tidak bergantung pada dummy data

Database adalah fondasi utama aplikasi.

Karena itu migration Laravel harus dibuat berdasarkan dokumen ini, bukan sebaliknya.
