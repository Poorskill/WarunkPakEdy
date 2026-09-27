<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Users
        $owner = User::updateOrCreate(
            ['email' => 'owner@warunkpakedy.test'],
            [
                'name' => 'Pak Edy (Owner)',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'email_verified_at' => now(),
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@warunkpakedy.test'],
            [
                'name' => 'Siti Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $cashier = User::updateOrCreate(
            ['email' => 'kasir@warunkpakedy.test'],
            [
                'name' => 'Budi Kasir',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'email_verified_at' => now(),
            ]
        );

        // 2. Categories
        $categoriesData = [
            ['name' => 'Sembako', 'description' => 'Beras, minyak, gula, telur dan kebutuhan pokok harian'],
            ['name' => 'Minuman', 'description' => 'Air mineral, teh botol, kopi, susu, dan minuman kemasan'],
            ['name' => 'Makanan & Snack', 'description' => 'Mie instan, biskuit, keripik, dan camilan warung'],
            ['name' => 'Kebutuhan Rumah', 'description' => 'Sabun cuci piring, deterjen, pasta gigi, dan pembersih'],
            ['name' => 'Bumbu & Dapur', 'description' => 'Kecap, saus, penyedap rasa, dan garam'],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['name']] = Category::firstOrCreate(['name' => $cat['name']], $cat);
        }

        // 3. Suppliers
        $suppliersData = [
            [
                'name' => 'PT Indomarco Adi Prima',
                'phone' => '021-52995000',
                'email' => 'order@indomarco.co.id',
                'address' => 'Kawasan Industri Pulogadung, Jakarta Timur',
                'notes' => 'Distributor resmi produk Indofood & Unilever',
                'is_active' => true,
            ],
            [
                'name' => 'CV Berkah Sembako Nusantara',
                'phone' => '081298765432',
                'email' => 'berkah.sembako@gmail.com',
                'address' => 'Pasar Induk Cipinang Blok B No. 12, Jakarta Timur',
                'notes' => 'Pemasok beras ramos, gula pasir, dan minyak goreng curah/kemasan',
                'is_active' => true,
            ],
            [
                'name' => 'Agen Minuman Sejahtera Mandiri',
                'phone' => '085712348899',
                'email' => 'sejahtera.beverage@yahoo.com',
                'address' => 'Jl. Raya Bogor KM 28, Ciracas, Jakarta Timur',
                'notes' => 'Suplai rutin Aqua, Teh Botol Sosro, Le Minerale kartonan',
                'is_active' => true,
            ],
        ];

        foreach ($suppliersData as $sup) {
            Supplier::firstOrCreate(['name' => $sup['name']], $sup);
        }

        // 4. Customers
        $customersData = [
            [
                'name' => 'Ibu Hajjah Maryam',
                'phone' => '081311223344',
                'email' => null,
                'address' => 'RT 03 / RW 05 No. 18 (Depan Masjid)',
                'notes' => 'Pelanggan tetap sembako bulanan',
            ],
            [
                'name' => 'Pak RT Bambang',
                'phone' => '081288990011',
                'email' => 'bambang.rt03@gmail.com',
                'address' => 'RT 03 / RW 05 No. 01',
                'notes' => 'Sering belanja konsumsi rapat warga',
            ],
            [
                'name' => 'Warung Nasi Bu Siti',
                'phone' => '087855667788',
                'email' => null,
                'address' => 'Jl. Dahlia No. 4B',
                'notes' => 'Pelanggan grosir beras, telur, minyak goreng',
            ],
        ];

        foreach ($customersData as $cust) {
            Customer::firstOrCreate(['name' => $cust['name']], $cust);
        }

        // 5. Products
        $productsData = [
            // Sembako
            [
                'category_name' => 'Sembako',
                'sku' => 'SMB-BRS-001',
                'barcode' => '899100110001',
                'name' => 'Beras Ramos Setra Premium 5kg',
                'description' => 'Beras pulen kualitas premium kemasan karung 5kg',
                'purchase_price' => 67000,
                'selling_price' => 74000,
                'stock' => 25,
                'minimum_stock' => 5,
                'unit' => 'karung',
            ],
            [
                'category_name' => 'Sembako',
                'sku' => 'SMB-MYK-001',
                'barcode' => '899277511201',
                'name' => 'Minyak Goreng Bimoli 1 Liter Pouch',
                'description' => 'Minyak goreng kelapa sawit jernih kemasan 1L',
                'purchase_price' => 17500,
                'selling_price' => 19500,
                'stock' => 48,
                'minimum_stock' => 10,
                'unit' => 'pouch',
            ],
            [
                'category_name' => 'Sembako',
                'sku' => 'SMB-GLA-001',
                'barcode' => '899317553102',
                'name' => 'Gulaku Kuning Premium 1kg',
                'description' => 'Gula pasir tebu murni kemasan 1kg',
                'purchase_price' => 15500,
                'selling_price' => 17500,
                'stock' => 30,
                'minimum_stock' => 8,
                'unit' => 'pack',
            ],
            [
                'category_name' => 'Sembako',
                'sku' => 'SMB-TLR-001',
                'barcode' => null,
                'name' => 'Telur Ayam Negeri Segar (1kg)',
                'description' => 'Telur ayam ras segar pilihan isi sekitar 16 butir',
                'purchase_price' => 27000,
                'selling_price' => 29500,
                'stock' => 20,
                'minimum_stock' => 5,
                'unit' => 'kg',
            ],

            // Minuman
            [
                'category_name' => 'Minuman',
                'sku' => 'MNM-AQU-001',
                'barcode' => '899886610011',
                'name' => 'Aqua Air Mineral Botol 600ml',
                'description' => 'Air mineral pegunungan botol sedang',
                'purchase_price' => 2800,
                'selling_price' => 3500,
                'stock' => 72,
                'minimum_stock' => 24,
                'unit' => 'botol',
            ],
            [
                'category_name' => 'Minuman',
                'sku' => 'MNM-THB-001',
                'barcode' => '899276101103',
                'name' => 'Teh Botol Sosro Kotak 250ml',
                'description' => 'Teh melati wangi khas Sosro kemasan tetrapak 250ml',
                'purchase_price' => 3000,
                'selling_price' => 4000,
                'stock' => 36,
                'minimum_stock' => 12,
                'unit' => 'kotak',
            ],
            [
                'category_name' => 'Minuman',
                'sku' => 'MNM-LMN-001',
                'barcode' => '899600141400',
                'name' => 'Le Minerale 600ml',
                'description' => 'Air mineral dengan mineral alami botol 600ml',
                'purchase_price' => 2600,
                'selling_price' => 3500,
                'stock' => 48,
                'minimum_stock' => 12,
                'unit' => 'botol',
            ],
            [
                'category_name' => 'Minuman',
                'sku' => 'MNM-KPL-001',
                'barcode' => '899100210345',
                'name' => 'Kopi Kapal Api Special Mix 1 Renceng (10 sachet)',
                'description' => 'Kopi bubuk + gula kemasan renceng isi 10 sachet',
                'purchase_price' => 12000,
                'selling_price' => 14000,
                'stock' => 15,
                'minimum_stock' => 5,
                'unit' => 'renceng',
            ],
            [
                'category_name' => 'Minuman',
                'sku' => 'MNM-ULT-001',
                'barcode' => '899100150123',
                'name' => 'Ultra Milk Susu UHT Cokelat 250ml',
                'description' => 'Susu sapi segar rasa cokelat UHT 250ml',
                'purchase_price' => 5800,
                'selling_price' => 7000,
                'stock' => 24,
                'minimum_stock' => 6,
                'unit' => 'kotak',
            ],

            // Makanan & Snack
            [
                'category_name' => 'Makanan & Snack',
                'sku' => 'MKN-IND-001',
                'barcode' => '89686010111',
                'name' => 'Indomie Goreng Spesial 85g',
                'description' => 'Mie instan goreng rasa original legendaris',
                'purchase_price' => 2900,
                'selling_price' => 3500,
                'stock' => 120,
                'minimum_stock' => 30,
                'unit' => 'bungkus',
            ],
            [
                'category_name' => 'Makanan & Snack',
                'sku' => 'MKN-IND-002',
                'barcode' => '89686010222',
                'name' => 'Indomie Kuah Ayam Bawang 69g',
                'description' => 'Mie instan kuah gurih rasa ayam bawang',
                'purchase_price' => 2800,
                'selling_price' => 3500,
                'stock' => 80,
                'minimum_stock' => 20,
                'unit' => 'bungkus',
            ],
            [
                'category_name' => 'Makanan & Snack',
                'sku' => 'MKN-CHT-001',
                'barcode' => '899269640441',
                'name' => 'Chitato Sapi Panggang 68g',
                'description' => 'Keripik kentang bergelombang rasa daging sapi panggang',
                'purchase_price' => 9500,
                'selling_price' => 11500,
                'stock' => 18,
                'minimum_stock' => 6,
                'unit' => 'bungkus',
            ],
            [
                'category_name' => 'Makanan & Snack',
                'sku' => 'MKN-RMK-001',
                'barcode' => '899600130101',
                'name' => 'Roma Biskuit Kelapa 300g',
                'description' => 'Biskuit renyah kelapa asli kaya vitamin B',
                'purchase_price' => 9000,
                'selling_price' => 11000,
                'stock' => 14,
                'minimum_stock' => 5,
                'unit' => 'bungkus',
            ],

            // Kebutuhan Rumah
            [
                'category_name' => 'Kebutuhan Rumah',
                'sku' => 'KRM-SNL-001',
                'barcode' => '899999905201',
                'name' => 'Sunlight Jeruk Nipis 700ml Refill',
                'description' => 'Sabun cuci piring konsentrat ekstrak jeruk nipis asli',
                'purchase_price' => 13500,
                'selling_price' => 15500,
                'stock' => 20,
                'minimum_stock' => 6,
                'unit' => 'pouch',
            ],
            [
                'category_name' => 'Kebutuhan Rumah',
                'sku' => 'KRM-RNS-001',
                'barcode' => '899999907101',
                'name' => 'Rinso Molto Deterjen Bubuk Rose Fresh 770g',
                'description' => 'Deterjen bubuk pembersih noda dengan keharuman bunga rose',
                'purchase_price' => 19000,
                'selling_price' => 22000,
                'stock' => 16,
                'minimum_stock' => 4,
                'unit' => 'bungkus',
            ],
            [
                'category_name' => 'Kebutuhan Rumah',
                'sku' => 'KRM-LFB-001',
                'barcode' => '899999901111',
                'name' => 'Sabun Mandi Batang Lifebuoy Total 10 85g',
                'description' => 'Sabun mandi antibakteri perlindungan kuman',
                'purchase_price' => 3800,
                'selling_price' => 4500,
                'stock' => 36,
                'minimum_stock' => 10,
                'unit' => 'batang',
            ],

            // Bumbu & Dapur
            [
                'category_name' => 'Bumbu & Dapur',
                'sku' => 'BMB-BNG-001',
                'barcode' => '899999951111',
                'name' => 'Kecap Manis Bango Pouch 520ml',
                'description' => 'Kecap manis kedelai hitam mallika pilihan rasa mantap',
                'purchase_price' => 21000,
                'selling_price' => 24000,
                'stock' => 15,
                'minimum_stock' => 4,
                'unit' => 'pouch',
            ],
            [
                'category_name' => 'Bumbu & Dapur',
                'sku' => 'BMB-RYC-001',
                'barcode' => '899999971112',
                'name' => 'Royco Bumbu Pelezat Rasa Ayam 230g',
                'description' => 'Penyedap rasa kaldu ayam ekstrak daging ayam asli',
                'purchase_price' => 9500,
                'selling_price' => 11000,
                'stock' => 22,
                'minimum_stock' => 6,
                'unit' => 'bungkus',
            ],
        ];

        foreach ($productsData as $prod) {
            $category = $categories[$prod['category_name']];

            $product = Product::updateOrCreate(
                ['sku' => $prod['sku']],
                [
                    'category_id' => $category->id,
                    'barcode' => $prod['barcode'],
                    'name' => $prod['name'],
                    'description' => $prod['description'],
                    'purchase_price' => $prod['purchase_price'],
                    'selling_price' => $prod['selling_price'],
                    'stock' => $prod['stock'],
                    'minimum_stock' => $prod['minimum_stock'],
                    'unit' => $prod['unit'],
                    'is_active' => true,
                ]
            );

            // Record initial stock movement if not exists
            StockMovement::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'type' => 'adjustment',
                    'reference_type' => 'initial_seed',
                ],
                [
                    'user_id' => $owner->id,
                    'quantity' => $prod['stock'],
                    'stock_before' => 0,
                    'stock_after' => $prod['stock'],
                    'reference_id' => null,
                    'notes' => 'Stok awal setup sistem',
                ]
            );
        }

        // 6. Store Settings
        Setting::set('store_name', 'WarunkPakEdy');
        Setting::set('store_phone', '0812-3456-7890');
        Setting::set('store_address', 'Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217');
        Setting::set('receipt_footer', 'Terima kasih atas kunjungan Anda!');
    }
}
