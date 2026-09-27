<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoundationVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_seeded_data_and_relationships_are_valid(): void
    {
        // 1. Users check
        $owner = User::where('role', 'owner')->first();
        $this->assertNotNull($owner);
        $this->assertTrue($owner->isOwner());

        // 2. Categories & Products relationship
        $category = Category::where('name', 'Sembako')->first();
        $this->assertNotNull($category);
        $this->assertGreaterThan(0, $category->products()->count());

        $product = Product::where('sku', 'SMB-BRS-001')->first();
        $this->assertNotNull($product);
        $this->assertEquals($category->id, $product->category_id);
        $this->assertEquals('karung', $product->unit);
        $this->assertGreaterThan(0, $product->stock);

        // 3. Stock movement relationship
        $movement = StockMovement::where('product_id', $product->id)->first();
        $this->assertNotNull($movement);
        $this->assertEquals($product->id, $movement->product->id);
        $this->assertEquals($product->stock, $movement->stock_after);

        // 4. Supplier & Customer
        $this->assertGreaterThanOrEqual(3, Supplier::count());
        $this->assertGreaterThanOrEqual(3, Customer::count());
    }

    public function test_dashboard_authenticated_access_renders_proper_data(): void
    {
        $owner = User::where('role', 'owner')->first();

        $response = $this->actingAs($owner)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('metrics')
            ->has('lowStockProducts')
            ->has('recentSales')
            ->has('recentMovements')
        );
    }
}
