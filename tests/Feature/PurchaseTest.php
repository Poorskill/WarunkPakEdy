<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->user = User::where('role', 'owner')->first();
    }

    public function test_purchase_index_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/purchases');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('purchases/index')
            ->has('purchases')
        );
    }

    public function test_purchase_create_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/purchases/create');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('purchases/create')
            ->has('suppliers')
            ->has('products')
        );
    }

    public function test_purchase_completed_stores_correctly_increases_stock_and_creates_movements(): void
    {
        $supplier = Supplier::first();
        $product = Product::first();
        $initialStock = (float) $product->stock;
        $orderQty = 25;
        $price = 10000;

        $response = $this->actingAs($this->user)->post('/purchases', [
            'supplier_id' => $supplier->id,
            'purchase_date' => now()->toDateString(),
            'status' => 'completed',
            'discount' => 5000,
            'tax' => 2000,
            'notes' => 'Faktur No. FKT-12345',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => $orderQty,
                    'purchase_price' => $price,
                ],
            ],
        ]);

        $response->assertRedirect('/purchases');

        $purchase = Purchase::where('notes', 'Faktur No. FKT-12345')->first();
        $this->assertNotNull($purchase);
        $this->assertEquals('completed', $purchase->status);
        $this->assertEquals(250000, (float) $purchase->subtotal);
        $this->assertEquals(247000, (float) $purchase->total); // 250000 - 5000 + 2000

        $product->refresh();
        $this->assertEquals($initialStock + $orderQty, (float) $product->stock);

        $movement = StockMovement::where('product_id', $product->id)
            ->where('reference_type', 'purchase')
            ->where('reference_id', $purchase->id)
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals('purchase', $movement->type);
        $this->assertEquals($orderQty, (float) $movement->quantity);
        $this->assertEquals($initialStock + $orderQty, (float) $movement->stock_after);
    }

    public function test_purchase_draft_stores_correctly_without_altering_stock(): void
    {
        $supplier = Supplier::first();
        $product = Product::first();
        $initialStock = (float) $product->stock;

        $response = $this->actingAs($this->user)->post('/purchases', [
            'supplier_id' => $supplier->id,
            'purchase_date' => now()->toDateString(),
            'status' => 'draft',
            'discount' => 0,
            'tax' => 0,
            'notes' => 'Rencana PO Tambahan',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'purchase_price' => 5000,
                ],
            ],
        ]);

        $response->assertRedirect('/purchases');

        $purchase = Purchase::where('notes', 'Rencana PO Tambahan')->first();
        $this->assertNotNull($purchase);
        $this->assertEquals('draft', $purchase->status);

        $product->refresh();
        $this->assertEquals($initialStock, (float) $product->stock);

        $movement = StockMovement::where('reference_id', $purchase->id)->first();
        $this->assertNull($movement);
    }

    public function test_purchase_draft_can_be_completed_and_adds_stock(): void
    {
        $supplier = Supplier::first();
        $product = Product::first();
        $initialStock = (float) $product->stock;
        $orderQty = 12;

        $purchase = Purchase::create([
            'purchase_number' => 'PO-TEST-DRAFT-01',
            'supplier_id' => $supplier->id,
            'user_id' => $this->user->id,
            'purchase_date' => now(),
            'subtotal' => 120000,
            'discount' => 0,
            'tax' => 0,
            'total' => 120000,
            'status' => 'draft',
        ]);

        $purchase->items()->create([
            'product_id' => $product->id,
            'quantity' => $orderQty,
            'purchase_price' => 10000,
            'subtotal' => 120000,
        ]);

        $response = $this->actingAs($this->user)->post("/purchases/{$purchase->id}/complete");
        $response->assertRedirect();

        $purchase->refresh();
        $this->assertEquals('completed', $purchase->status);

        $product->refresh();
        $this->assertEquals($initialStock + $orderQty, (float) $product->stock);

        $movement = StockMovement::where('reference_id', $purchase->id)->first();
        $this->assertNotNull($movement);
        $this->assertEquals($orderQty, (float) $movement->quantity);
    }

    public function test_purchase_draft_can_be_cancelled(): void
    {
        $supplier = Supplier::first();
        $purchase = Purchase::create([
            'purchase_number' => 'PO-TEST-CANCEL-01',
            'supplier_id' => $supplier->id,
            'user_id' => $this->user->id,
            'purchase_date' => now(),
            'subtotal' => 50000,
            'total' => 50000,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->user)->post("/purchases/{$purchase->id}/cancel");
        $response->assertRedirect();

        $purchase->refresh();
        $this->assertEquals('cancelled', $purchase->status);
    }

    public function test_purchase_show_can_be_rendered(): void
    {
        $supplier = Supplier::first();
        $purchase = Purchase::create([
            'purchase_number' => 'PO-TEST-SHOW-01',
            'supplier_id' => $supplier->id,
            'user_id' => $this->user->id,
            'purchase_date' => now(),
            'subtotal' => 50000,
            'total' => 50000,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user)->get("/purchases/{$purchase->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('purchases/show')
            ->has('purchase')
        );
    }
}
