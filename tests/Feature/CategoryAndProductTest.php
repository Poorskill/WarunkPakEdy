<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryAndProductTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->user = User::where('role', 'owner')->first();
    }

    public function test_category_list_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/categories');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('categories/index'));
    }

    public function test_category_can_be_created(): void
    {
        $response = $this->actingAs($this->user)->post('/categories', [
            'name' => 'Kategori Baru',
            'description' => 'Deskripsi Kategori',
        ]);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['name' => 'Kategori Baru']);
    }

    public function test_category_can_be_updated(): void
    {
        $cat = Category::first();

        $response = $this->actingAs($this->user)->put("/categories/{$cat->id}", [
            'name' => 'Nama Baru Update',
            'description' => 'Update deskripsi',
        ]);

        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $cat->id, 'name' => 'Nama Baru Update']);
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $cat = Category::whereHas('products')->first();

        $response = $this->actingAs($this->user)->delete("/categories/{$cat->id}");
        $response->assertRedirect('/categories');
        $this->assertDatabaseHas('categories', ['id' => $cat->id]);
    }

    public function test_product_list_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/products');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('products/index'));
    }

    public function test_product_can_be_created_with_initial_stock_movement(): void
    {
        $cat = Category::first();

        $response = $this->actingAs($this->user)->post('/products', [
            'category_id' => $cat->id,
            'sku' => 'TEST-SKU-999',
            'barcode' => '899999999999',
            'name' => 'Produk Test Unit',
            'description' => 'Deskripsi test',
            'purchase_price' => 10000,
            'selling_price' => 15000,
            'stock' => 50,
            'minimum_stock' => 10,
            'unit' => 'pcs',
            'is_active' => true,
        ]);

        $response->assertRedirect('/products');

        $product = Product::where('sku', 'TEST-SKU-999')->first();
        $this->assertNotNull($product);

        $movement = StockMovement::where('product_id', $product->id)
            ->where('reference_type', 'initial_stock')
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals(50, $movement->quantity);
        $this->assertEquals(50, $movement->stock_after);
    }

    public function test_product_update_does_not_modify_stock_directly(): void
    {
        $product = Product::first();
        $originalStock = $product->stock;

        $response = $this->actingAs($this->user)->put("/products/{$product->id}", [
            'category_id' => $product->category_id,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'name' => 'Nama Produk Baru',
            'description' => $product->description,
            'purchase_price' => $product->purchase_price,
            'selling_price' => 25000,
            'stock' => 99999, // Should be ignored by controller update
            'minimum_stock' => $product->minimum_stock,
            'unit' => $product->unit,
            'is_active' => true,
        ]);

        $response->assertRedirect('/products');
        $product->refresh();

        $this->assertEquals('Nama Produk Baru', $product->name);
        $this->assertEquals($originalStock, $product->stock);
    }

    public function test_product_can_be_soft_deleted(): void
    {
        $product = Product::first();

        $response = $this->actingAs($this->user)->delete("/products/{$product->id}");
        $response->assertRedirect('/products');

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }
}
