# WarunkPakEdy — System Flowchart

Dokumen ini berisi alur kerja utama sistem **WarunkPakEdy POS System**.

Flowchart digunakan sebagai acuan sebelum implementasi:

* Database
* Migration
* Model
* Controller
* Service
* React Page
* Form
* Permission
* Transaction
* Inventory
* Reporting

Prinsip utama sistem:

> **Produk → Stok → Transaksi → Perubahan Stok → Laporan**

---

# 1. System Overview

Alur besar WarunkPakEdy:

```text
                         ┌──────────────┐
                         │    LOGIN     │
                         └──────┬───────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Authentication   │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Role & Permission│
                       └────────┬────────┘
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
        ┌──────────┐      ┌──────────┐      ┌───────────┐
        │ Dashboard│      │   Kasir  │      │ Master    │
        │          │      │   POS    │      │ Data      │
        └────┬─────┘      └────┬─────┘      └─────┬─────┘
             │                 │                  │
             │                 ▼                  │
             │          ┌──────────────┐          │
             │          │  Penjualan   │          │
             │          └──────┬───────┘          │
             │                 │                  │
             │                 ▼                  │
             │          ┌──────────────┐          │
             │          │ Stock Update │          │
             │          └──────┬───────┘          │
             │                 │                  │
             └─────────────────┼──────────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   Laporan   │
                        └─────────────┘
```

---

# 2. Authentication Flow

```text
START
  │
  ▼
Open Application
  │
  ▼
Is User Logged In?
  │
  ├── NO ──► Login Page
  │             │
  │             ▼
  │        Input Email
  │        + Password
  │             │
  │             ▼
  │        Validate Login
  │             │
  │       ┌─────┴─────┐
  │       │           │
  │     FAIL         SUCCESS
  │       │           │
  │       ▼           ▼
  │   Show Error    Check 2FA
  │                   │
  │             ┌─────┴─────┐
  │             │           │
  │            YES          NO
  │             │           │
  │             ▼           │
  │        Verify 2FA      │
  │             │           │
  │             └─────┬─────┘
  │                   ▼
  │              Dashboard
  │
  └── YES ─────────► Dashboard
```

---

# 3. Authorization Flow

Setelah login:

```text
User Login
    │
    ▼
Get User Role
    │
    ▼
Check Permission
    │
    ├── Allowed ──► Access Page
    │
    └── Denied ───► 403 / Access Denied
```

Authorization wajib dilakukan di backend.

Frontend hanya digunakan untuk menampilkan interface sesuai permission.

---

# 4. Main Navigation Flow

```text
Dashboard
│
├── Kasir
│
├── Produk
│
├── Stok
│
├── Pembelian
│
├── Supplier
│
├── Pelanggan
│
├── Penjualan
│
├── Retur
│
├── Laporan Penjualan
│
├── Laporan Stok
│
├── Laporan Keuntungan
│
├── Pengguna
│
└── Pengaturan
```

---

# 5. Dashboard Flow

```text
Open Dashboard
      │
      ▼
Check Permission
      │
      ▼
Load Summary Data
      │
      ├── Sales
      ├── Transactions
      ├── Profit
      ├── Low Stock
      └── Recent Transactions
      │
      ▼
Display Dashboard
```

Dashboard tidak mengubah data transaksi.

Dashboard hanya membaca dan menampilkan data yang sudah tersimpan.

---

# 6. Category Flow

```text
Open Categories
      │
      ▼
Display Categories
      │
      ├──────────────┐
      │              │
      ▼              ▼
Add Category     Edit Category
      │              │
      ▼              ▼
Validate         Validate
      │              │
      └──────┬───────┘
             ▼
        Save Category
             │
             ▼
       Refresh List
```

Delete category harus memperhatikan apakah category masih digunakan oleh product.

---

# 7. Product Flow

```text
Open Products
      │
      ▼
Display Product List
      │
      ├──────────────┬───────────────┐
      │              │               │
      ▼              ▼               ▼
 Add Product     Edit Product     View Product
      │              │
      ▼              ▼
  Validate       Validate
      │              │
      └───────┬──────┘
              ▼
         Save Product
              │
              ▼
         Product List
```

Data product:

```text
Category
SKU
Barcode
Name
Purchase Price
Selling Price
Stock
Minimum Stock
Unit
Status
```

---

# 8. Add Product Flow

```text
START
  │
  ▼
Open Add Product
  │
  ▼
Input Product Data
  │
  ▼
Validate
  │
  ├── Invalid ──► Show Validation Error
  │                    │
  │                    └──► Back to Form
  │
  └── Valid
       │
       ▼
Check SKU
       │
       ├── Exists ──► Error
       │
       └── Available
              │
              ▼
          Check Barcode
              │
              ├── Exists ──► Error
              │
              └── Available
                     │
                     ▼
                 Save Product
                     │
                     ▼
                Product List
```

---

# 9. Inventory Flow

Inventory mempunyai beberapa sumber perubahan:

```text
                    ┌─────────────┐
                    │   PRODUCT   │
                    └──────┬──────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Current Stock    │
                  └────────┬─────────┘
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
        ▼                  ▼                   ▼
    Purchase             Sale              Return
        │                  │                   │
        ▼                  ▼                   ▼
      Stock +           Stock -            Stock +
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                           ▼
                   Stock Movement
```

Selain itu:

```text
Stock Adjustment
       │
       ▼
Stock ±
       │
       ▼
Stock Movement

Stock Opname
       │
       ▼
Compare System vs Physical
       │
       ▼
Adjustment
       │
       ▼
Stock Movement
```

---

# 10. Purchase Flow

```text
START
  │
  ▼
Open Purchase
  │
  ▼
Select Supplier
  │
  ▼
Add Products
  │
  ▼
Set Quantity
  │
  ▼
Set Purchase Price
  │
  ▼
Calculate Subtotal
  │
  ▼
Discount / Tax
  │
  ▼
Calculate Total
  │
  ▼
Save as Draft?
  │
  ├── YES ──► Save Draft
  │
  └── NO
       │
       ▼
Confirm Purchase
       │
       ▼
Create Purchase
       │
       ▼
Create Purchase Items
       │
       ▼
Increase Product Stock
       │
       ▼
Create Stock Movement
       │
       ▼
Completed
```

Purchase yang berstatus `draft` belum mengubah stok.

---

# 11. Purchase Validation

Sebelum purchase diselesaikan:

```text
Supplier exists?
     │
     ├── NO ──► Error
     │
     └── YES
          │
          ▼
Product exists?
          │
          ├── NO ──► Error
          │
          └── YES
               │
               ▼
Quantity > 0?
               │
               ├── NO ──► Error
               │
               └── YES
                    │
                    ▼
                Continue
```

---

# 12. POS Main Flow

Alur utama kasir:

```text
START
  │
  ▼
Open POS
  │
  ▼
Search / Scan Product
  │
  ▼
Product Found?
  │
  ├── NO ──► Show "Produk tidak ditemukan"
  │                │
  │                └──► Search Again
  │
  └── YES
       │
       ▼
Check Stock
       │
       ├── Insufficient ──► Show Stock Error
       │
       └── Available
              │
              ▼
          Add to Cart
              │
              ▼
        Set Quantity
              │
              ▼
        Calculate Cart
              │
              ▼
         Add Discount?
              │
              ├── YES ──► Apply Discount
              │
              └── NO
                   │
                   ▼
               Calculate Total
                   │
                   ▼
              Payment
```

---

# 13. POS Cart Flow

```text
Product
   │
   ▼
Add to Cart
   │
   ▼
Cart Item
   │
   ├── Increase Quantity
   │
   ├── Decrease Quantity
   │
   └── Remove Item
          │
          ▼
      Recalculate
          │
          ▼
       Cart Total
```

Setiap perubahan quantity harus memeriksa stok.

---

# 14. Payment Flow

```text
Cart
 │
 ▼
Checkout
 │
 ▼
Calculate Total
 │
 ▼
Select Payment Method
 │
 ├──────────┬───────────┬───────────┬───────────┐
 │          │           │           │
 ▼          ▼           ▼           ▼
Cash       QRIS       Transfer    E-Wallet
 │          │           │           │
 ▼          ▼           ▼           ▼
Input      Confirm     Reference    Reference
Amount     Payment     Number       Number
 │          │           │           │
 ▼          └──────┬────┴───────────┘
 │                 │
 ▼                 ▼
Calculate       Validate
Change          Payment
 │                 │
 └────────┬────────┘
          ▼
      Confirm Sale
```

---

# 15. Cash Payment

```text
Total
 │
 ▼
Input Cash
 │
 ▼
Cash >= Total?
 │
 ├── NO ──► Show "Pembayaran kurang"
 │
 └── YES
      │
      ▼
Change = Cash - Total
      │
      ▼
Confirm
```

---

# 16. Non-Cash Payment

Untuk QRIS, Transfer, dan E-Wallet:

```text
Total
 │
 ▼
Select Method
 │
 ▼
Input / Verify Payment Reference
 │
 ▼
Payment Valid?
 │
 ├── NO ──► Error
 │
 └── YES
      │
      ▼
Confirm Payment
```

Integrasi payment gateway dapat ditambahkan pada fase berikutnya.

---

# 17. Complete Sale Flow

Proses penyelesaian transaksi:

```text
START
  │
  ▼
Validate Cart
  │
  ├── Empty ──► Error
  │
  └── Has Items
        │
        ▼
Validate Stock
        │
        ├── Insufficient ──► Error
        │
        └── Available
              │
              ▼
          Begin DB Transaction
              │
              ▼
          Create Sale
              │
              ▼
          Create Sale Items
              │
              ▼
          Create Payment
              │
              ▼
          Reduce Stock
              │
              ▼
          Create Stock Movement
              │
              ▼
          Commit
              │
              ▼
       Transaction Success
              │
              ▼
        Show Receipt
```

Jika terjadi error:

```text
Error
 │
 ▼
Rollback Transaction
 │
 ▼
Stock & Transaction tetap aman
```

---

# 18. Sales History Flow

```text
Open Penjualan
      │
      ▼
Load Transactions
      │
      ▼
Search / Filter
      │
      ├── Invoice
      ├── Date
      ├── Cashier
      ├── Customer
      ├── Payment Method
      └── Status
      │
      ▼
Select Transaction
      │
      ▼
Transaction Detail
```

---

# 19. Transaction Detail

```text
Transaction
     │
     ├── Invoice Number
     ├── Date
     ├── Cashier
     ├── Customer
     ├── Items
     ├── Subtotal
     ├── Discount
     ├── Tax
     ├── Total
     └── Payment
```

Action:

```text
Print Receipt
View Detail
Return
```

Permission menentukan action yang tersedia.

---

# 20. Return Flow

```text
START
  │
  ▼
Open Transaction
  │
  ▼
Search Invoice
  │
  ▼
Select Transaction
  │
  ▼
Select Item
  │
  ▼
Input Return Quantity
  │
  ▼
Validate Quantity
  │
  ├── Invalid ──► Error
  │
  └── Valid
       │
       ▼
Input Return Reason
       │
       ▼
Confirm Return
       │
       ▼
Begin DB Transaction
       │
       ▼
Create Return
       │
       ▼
Create Return Items
       │
       ▼
Increase Stock
       │
       ▼
Create Stock Movement
       │
       ▼
Commit
       │
       ▼
Return Success
```

---

# 21. Return Validation

```text
Transaction exists?
       │
       ├── NO ──► Error
       │
       └── YES
            │
            ▼
Transaction completed?
            │
            ├── NO ──► Error
            │
            └── YES
                 │
                 ▼
Item exists?
                 │
                 ├── NO ──► Error
                 │
                 └── YES
                      │
                      ▼
Return quantity valid?
                      │
                      ├── NO ──► Error
                      │
                      └── YES
                           │
                           ▼
                       Continue
```

---

# 22. Stock Opname Flow

```text
START
  │
  ▼
Open Stock Opname
  │
  ▼
Select Products
  │
  ▼
System Stock
  │
  ▼
Input Physical Stock
  │
  ▼
Calculate Difference
  │
  ▼
Review
  │
  ▼
Confirm Opname
  │
  ▼
Update Stock
  │
  ▼
Create Stock Movement
  │
  ▼
Complete
```

Formula:

```text
difference = actual_stock - system_stock
```

---

# 23. Stock Adjustment Flow

```text
Open Stock
    │
    ▼
Select Product
    │
    ▼
Choose Adjustment
    │
    ├── Increase
    │
    └── Decrease
    │
    ▼
Input Quantity
    │
    ▼
Input Reason
    │
    ▼
Validate
    │
    ▼
Update Stock
    │
    ▼
Create Stock Movement
    │
    ▼
Success
```

Reason wajib diisi untuk adjustment manual.

---

# 24. Supplier Flow

```text
Supplier List
      │
      ├── Add
      │
      ├── Edit
      │
      ├── View
      │
      └── Deactivate
```

Supplier yang sudah digunakan pada purchase sebaiknya tidak langsung dihapus secara permanen.

---

# 25. Customer Flow

```text
Customer List
      │
      ├── Add
      │
      ├── Edit
      │
      ├── View
      │
      └── Deactivate
```

Customer bersifat opsional saat transaksi POS.

Kasir dapat melakukan transaksi tanpa memilih customer.

---

# 26. User Management Flow

```text
Open Users
    │
    ▼
Check Permission
    │
    ▼
User List
    │
    ├── Add User
    │
    ├── Edit User
    │
    ├── Change Role
    │
    ├── Activate / Deactivate
    │
    └── Reset Password
```

Role:

```text
Owner
Admin
Cashier
```

---

# 27. Role Access Flow

```text
                    OWNER
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
      Admin         Cashier      Settings


OWNER
 │
 ├── Dashboard
 ├── POS
 ├── Product
 ├── Stock
 ├── Purchase
 ├── Supplier
 ├── Customer
 ├── Sales
 ├── Return
 ├── Reports
 ├── Users
 └── Settings


ADMIN
 │
 ├── Dashboard
 ├── POS
 ├── Product
 ├── Stock
 ├── Purchase
 ├── Supplier
 ├── Customer
 ├── Sales
 ├── Return
 └── Reports


CASHIER
 │
 ├── POS
 ├── Sales
 └── Customer
```

Detail permission dapat dikembangkan menjadi permission-based access.

---

# 28. Sales Report Flow

```text
Open Sales Report
      │
      ▼
Select Date Range
      │
      ▼
Apply Filter
      │
      ├── Cashier
      ├── Payment
      ├── Customer
      └── Status
      │
      ▼
Query Sales
      │
      ▼
Calculate Summary
      │
      ├── Total Sales
      ├── Transactions
      ├── Average Transaction
      └── Payment Breakdown
      │
      ▼
Display Report
```

---

# 29. Stock Report Flow

```text
Open Stock Report
      │
      ▼
Select Filter
      │
      ├── Category
      ├── Stock Status
      └── Product
      │
      ▼
Load Product & Movement Data
      │
      ▼
Display
      │
      ├── Current Stock
      ├── Stock In
      ├── Stock Out
      └── Movement
```

---

# 30. Profit Report Flow

```text
Open Profit Report
      │
      ▼
Select Period
      │
      ▼
Load Sales
      │
      ▼
Calculate Revenue
      │
      ▼
Calculate Cost
      │
      ▼
Calculate Profit
      │
      ▼
Display Report
```

Perhitungan profit harus mengikuti metode costing yang ditetapkan pada implementasi final.

---

# 31. Search Flow

Search digunakan pada:

```text
Products
Customers
Suppliers
Sales
Purchases
```

Flow:

```text
Input Search
     │
     ▼
Debounce
     │
     ▼
Query Backend
     │
     ▼
Filter Result
     │
     ▼
Display Result
```

Search tidak seharusnya mengambil seluruh database ke browser jika data sudah besar.

---

# 32. Notification Flow

### Success

```text
Action
 ↓
Success
 ↓
Toast / Feedback
```

Contoh:

```text
Produk berhasil ditambahkan.
Transaksi berhasil disimpan.
Stok berhasil diperbarui.
```

### Error

```text
Action
 ↓
Error
 ↓
Display Message
```

Pesan error harus mudah dipahami pengguna.

---

# 33. Loading Flow

```text
User Action
     │
     ▼
Request
     │
     ▼
Loading State
     │
     ▼
Response
     │
     ├── Success ──► Display Data
     │
     └── Error ────► Display Error
```

Button submit harus mencegah double submission ketika request sedang diproses.

---

# 34. Empty State

Jika tidak terdapat data:

```text
No Data
  │
  ▼
Display Empty State
  │
  ├── Explanation
  └── Primary Action
```

Contoh:

```text
Belum ada produk.

Tambahkan produk pertama untuk mulai menggunakan sistem.
```

---

# 35. Global Data Flow

```text
                    ┌──────────────┐
                    │    USERS     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     POS      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    SALES     │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
             PAYMENTS          SALE ITEMS
                                    │
                                    ▼
                               PRODUCTS
                                    │
                                    ▼
                                  STOCK
                                    │
                                    ▼
                           STOCK MOVEMENTS
```

Purchase:

```text
SUPPLIER
   │
   ▼
PURCHASE
   │
   ▼
PURCHASE ITEMS
   │
   ▼
PRODUCT
   │
   ▼
STOCK +
   │
   ▼
STOCK MOVEMENT
```

Return:

```text
SALE
 │
 ▼
RETURN
 │
 ▼
RETURN ITEMS
 │
 ▼
STOCK +
 │
 ▼
STOCK MOVEMENT
```

---

# 36. Complete Business Flow

```text
                         ┌──────────────┐
                         │     LOGIN    │
                         └──────┬───────┘
                                │
                                ▼
                     ┌────────────────────┐
                     │ ROLE & PERMISSION  │
                     └─────────┬──────────┘
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
          ▼                    ▼                     ▼
     MASTER DATA          PURCHASE                 POS
          │                    │                     │
     ┌────┼────┐              │                     │
     │    │    │              ▼                     ▼
 Product Supplier Customer  STOCK +              SALES
     │                   │                         │
     │                   ▼                         ▼
     │             STOCK MOVEMENT              PAYMENT
     │                                             │
     └──────────────────────┬──────────────────────┘
                            │
                            ▼
                         REPORTS
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
           SALES          STOCK          PROFIT
```

---

# 37. Critical Transaction Principle

Proses berikut harus dianggap sebagai satu kesatuan:

```text
SALE
 ├── Sale
 ├── Sale Items
 ├── Payment
 ├── Stock Update
 └── Stock Movement
```

Tidak boleh terjadi kondisi seperti:

```text
Sale berhasil
Payment berhasil
Stock gagal diperbarui
```

Karena dapat menyebabkan data bisnis tidak konsisten.

Gunakan database transaction.

---

# 38. Development Dependency

Urutan dependency fitur:

```text
Authentication
      ↓
Roles & Permission
      ↓
Category
      ↓
Product
      ↓
Supplier / Customer
      ↓
Inventory
      ↓
Purchase
      ↓
POS
      ↓
Sales
      ↓
Payment
      ↓
Return
      ↓
Reports
      ↓
Dashboard
```

Dashboard dapat dibuat lebih awal secara visual, tetapi data dashboard sebaiknya diimplementasikan setelah modul transaksi utama tersedia.

---

# 39. Recommended Laravel Architecture

Flow bisnis:

```text
React Page
    │
    ▼
Inertia Request
    │
    ▼
Controller
    │
    ▼
Form Request / Validation
    │
    ▼
Service
    │
    ▼
Model / Database
    │
    ▼
Response
    │
    ▼
Inertia Page
```

Untuk proses kompleks seperti transaksi penjualan:

```text
SaleController
      │
      ▼
SaleService
      │
      ├── Validate Stock
      ├── Create Sale
      ├── Create Sale Items
      ├── Create Payment
      ├── Update Stock
      └── Create Stock Movement
```

---

# 40. Error Handling Principle

Jika proses gagal:

```text
Request
  │
  ▼
Validation
  │
  ├── Failed ──► 422 / Validation Error
  │
  ▼
Business Logic
  │
  ├── Failed ──► Business Error
  │
  ▼
Database
  │
  ├── Failed ──► Rollback
  │
  ▼
Success
```

User harus mendapatkan pesan yang jelas tanpa menampilkan informasi teknis yang tidak perlu.

---

# 41. MVP Flow Priority

Untuk versi pertama, fokus pada:

```text
1. Login
2. Role
3. Category
4. Product
5. Stock
6. Supplier
7. Customer
8. Purchase
9. POS
10. Payment
11. Sales History
12. Stock Movement
```

Setelah alur tersebut stabil:

```text
13. Return
14. Stock Opname
15. Sales Report
16. Stock Report
17. Profit Report
18. Dashboard Analytics
```

---

# 42. Final System Principle

WarunkPakEdy harus mengikuti alur:

```text
MASTER DATA
     ↓
INVENTORY
     ↓
TRANSACTION
     ↓
PAYMENT
     ↓
STOCK MOVEMENT
     ↓
REPORT
     ↓
DASHBOARD
```

Semua fitur baru harus memiliki hubungan yang jelas dengan alur bisnis tersebut.

Jika sebuah fitur tidak memiliki kebutuhan bisnis yang jelas, fitur tersebut tidak perlu ditambahkan hanya untuk membuat aplikasi terlihat lebih kompleks.

---

# 43. Development Rule

Sebelum membuat sebuah halaman:

```text
1. Tentukan tujuan halaman
2. Tentukan data yang dibutuhkan
3. Tentukan database table
4. Tentukan permission
5. Tentukan business flow
6. Tentukan validation
7. Tentukan success/error state
8. Baru implementasikan UI
```

Dengan urutan ini, UI tidak menjadi sumber utama business logic.

---

# 44. Final Goal

Flowchart ini digunakan sebagai **blueprint alur bisnis WarunkPakEdy**.

Tujuan akhirnya:

> Membuat sistem POS yang sederhana untuk digunakan kasir, informatif untuk pemilik toko, konsisten dalam pengelolaan stok, dan memiliki data transaksi yang dapat dipertanggungjawabkan.
