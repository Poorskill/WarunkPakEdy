<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionMatrixTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;
    protected User $admin;
    protected User $cashier;
    protected User $otherCashier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->owner = User::where('role', 'owner')->first();
        $this->admin = User::where('role', 'admin')->first();
        $this->cashier = User::where('role', 'cashier')->first();

        // Create a second cashier to test isolated sales
        $this->otherCashier = User::factory()->create([
            'role' => 'cashier',
            'name' => 'Kasir Dua',
            'email' => 'kasir2@warunkpakedy.test',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | OWNER ACCESS TESTS
    |--------------------------------------------------------------------------
    */

    public function test_owner_has_full_access_to_all_sections(): void
    {
        $this->actingAs($this->owner);

        // Core & POS
        $this->get('/dashboard')->assertOk();
        $this->get('/pos')->assertOk();

        // Catalog & Inventory
        $this->get('/products')->assertOk();
        $this->get('/products/create')->assertOk();
        $this->get('/categories')->assertOk();
        $this->get('/inventory')->assertOk();
        $this->get('/inventory/movements')->assertOk();
        $this->get('/stock-opnames')->assertOk();
        $this->get('/stock-opnames/create')->assertOk();

        // Purchasing & Suppliers
        $this->get('/suppliers')->assertOk();
        $this->get('/purchases')->assertOk();
        $this->get('/purchases/create')->assertOk();

        // Customers & Sales
        $this->get('/customers')->assertOk();
        $this->get('/sales')->assertOk();
        $this->get('/returns')->assertOk();

        // Reports
        $this->get('/reports/sales')->assertOk();
        $this->get('/reports/stock')->assertOk();
        $this->get('/reports/profit')->assertOk();

        // Management & Settings
        $this->get('/users')->assertOk();
        $this->get('/settings/store')->assertOk();
    }

    public function test_owner_can_delete_master_data_and_adjust_stock(): void
    {
        $this->actingAs($this->owner);

        $product = Product::first();
        $this->delete("/products/{$product->id}")->assertRedirect('/products');

        $emptyCat = Category::create(['name' => 'Kategori Kosong']);
        $this->delete("/categories/{$emptyCat->id}")->assertRedirect('/categories');

        $emptySup = Supplier::create(['name' => 'Supplier Baru']);
        $this->delete("/suppliers/{$emptySup->id}")->assertRedirect('/suppliers');

        $customer = Customer::first();
        $this->delete("/customers/{$customer->id}")->assertRedirect('/customers');

        $prod2 = Product::where('id', '!=', $product->id)->first();
        $this->post('/inventory/adjust', [
            'product_id' => $prod2->id,
            'type' => 'addition',
            'quantity' => 10,
            'notes' => 'Owner adjustment test',
        ])->assertRedirect();
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ACCESS TESTS
    |--------------------------------------------------------------------------
    */

    public function test_admin_can_access_operational_areas(): void
    {
        $this->actingAs($this->admin);

        $this->get('/dashboard')->assertOk();
        $this->get('/pos')->assertOk();
        $this->get('/products')->assertOk();
        $this->get('/products/create')->assertOk();
        $this->get('/categories')->assertOk();
        $this->get('/inventory')->assertOk();
        $this->get('/inventory/movements')->assertOk();
        $this->get('/stock-opnames')->assertOk();
        $this->get('/stock-opnames/create')->assertOk();
        $this->get('/suppliers')->assertOk();
        $this->get('/purchases')->assertOk();
        $this->get('/purchases/create')->assertOk();
        $this->get('/customers')->assertOk();
        $this->get('/sales')->assertOk();
        $this->get('/returns')->assertOk();
        $this->get('/reports/sales')->assertOk();
        $this->get('/reports/stock')->assertOk();
    }

    public function test_admin_is_forbidden_from_owner_only_features(): void
    {
        $this->actingAs($this->admin);

        // 1. User management
        $this->get('/users')->assertForbidden();
        $this->post('/users', [
            'name' => 'Hack User',
            'email' => 'hack@warunkpakedy.test',
            'password' => 'secret123',
            'role' => 'owner',
        ])->assertForbidden();

        // 2. Store settings
        $this->get('/settings/store')->assertForbidden();
        $this->put('/settings/store', ['store_name' => 'Hacked Store'])->assertForbidden();

        // 3. Profit report
        $this->get('/reports/profit')->assertForbidden();

        // 4. Stock manual adjustment
        $product = Product::first();
        $this->post('/inventory/adjust', [
            'product_id' => $product->id,
            'type' => 'addition',
            'quantity' => 5,
            'notes' => 'Admin test adjustment',
        ])->assertForbidden();

        // 5. Deletion of master data
        $this->delete("/products/{$product->id}")->assertForbidden();

        $emptyCat = Category::create(['name' => 'Cat Temp']);
        $this->delete("/categories/{$emptyCat->id}")->assertForbidden();

        $emptySup = Supplier::create(['name' => 'Sup Temp']);
        $this->delete("/suppliers/{$emptySup->id}")->assertForbidden();

        $customer = Customer::first();
        $this->delete("/customers/{$customer->id}")->assertForbidden();
    }

    /*
    |--------------------------------------------------------------------------
    | CASHIER ACCESS TESTS
    |--------------------------------------------------------------------------
    */

    public function test_cashier_can_access_pos_products_and_customers(): void
    {
        $this->actingAs($this->cashier);

        $this->get('/dashboard')->assertOk();
        $this->get('/pos')->assertOk();
        $this->get('/products')->assertOk();
        $this->get('/categories')->assertOk();
        $this->get('/inventory')->assertOk();
        $this->get('/customers')->assertOk();
        $this->get('/sales')->assertOk();
        $this->get('/returns')->assertOk();
    }

    public function test_cashier_is_forbidden_from_admin_and_owner_endpoints(): void
    {
        $this->actingAs($this->cashier);

        // User management
        $this->get('/users')->assertForbidden();

        // Store settings
        $this->get('/settings/store')->assertForbidden();

        // Suppliers & Purchases
        $this->get('/suppliers')->assertForbidden();
        $this->post('/suppliers', ['name' => 'Test'])->assertForbidden();
        $this->get('/purchases')->assertForbidden();
        $this->get('/purchases/create')->assertForbidden();

        // Stock opname & movements & adjust
        $this->get('/stock-opnames')->assertForbidden();
        $this->get('/stock-opnames/create')->assertForbidden();
        $this->get('/inventory/movements')->assertForbidden();
        $product = Product::first();
        $this->post('/inventory/adjust', [
            'product_id' => $product->id,
            'type' => 'addition',
            'quantity' => 5,
            'notes' => 'Cashier hack',
        ])->assertForbidden();

        // Product creation & modification & deletion
        $this->get('/products/create')->assertForbidden();
        $this->post('/products', ['name' => 'Cashier Item'])->assertForbidden();
        $this->get("/products/{$product->id}/edit")->assertForbidden();
        $this->put("/products/{$product->id}", ['name' => 'Updated'])->assertForbidden();
        $this->delete("/products/{$product->id}")->assertForbidden();

        // Category modification & deletion
        $this->post('/categories', ['name' => 'Cashier Cat'])->assertForbidden();
        $category = Category::first();
        $this->put("/categories/{$category->id}", ['name' => 'Updated'])->assertForbidden();
        $this->delete("/categories/{$category->id}")->assertForbidden();

        // Customer deletion
        $customer = Customer::first();
        $this->delete("/customers/{$customer->id}")->assertForbidden();

        // Reports
        $this->get('/reports/sales')->assertForbidden();
        $this->get('/reports/stock')->assertForbidden();
        $this->get('/reports/profit')->assertForbidden();
    }

    public function test_cashier_cannot_view_other_cashiers_sales_detail(): void
    {
        $customer = Customer::first();

        // Create sale by otherCashier
        $otherSale = Sale::create([
            'invoice_number' => 'INV-OTHER-001',
            'user_id' => $this->otherCashier->id,
            'customer_id' => $customer->id,
            'sale_date' => now(),
            'subtotal' => 50000,
            'discount' => 0,
            'tax' => 0,
            'total' => 50000,
            'status' => 'completed',
        ]);

        // Cashier 1 attempts to view sale belonging to Cashier 2
        $response = $this->actingAs($this->cashier)->get("/sales/{$otherSale->id}");
        $response->assertForbidden();

        // Cashier 2 can view their own sale
        $response2 = $this->actingAs($this->otherCashier)->get("/sales/{$otherSale->id}");
        $response2->assertOk();

        // Admin & Owner can view any sale
        $this->actingAs($this->admin)->get("/sales/{$otherSale->id}")->assertOk();
        $this->actingAs($this->owner)->get("/sales/{$otherSale->id}")->assertOk();
    }
}
