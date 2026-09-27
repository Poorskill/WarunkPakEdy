<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryAndStockTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->user = User::where('role', 'owner')->first();
    }

    public function test_inventory_index_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/inventory');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('inventory/index')
            ->has('metrics')
            ->has('products')
            ->has('categories')
        );
    }

    public function test_stock_adjustment_addition_increases_stock_and_creates_movement(): void
    {
        $product = Product::first();
        $initialStock = (float) $product->stock;

        $response = $this->actingAs($this->user)->post('/inventory/adjust', [
            'product_id' => $product->id,
            'type' => 'addition',
            'quantity' => 15,
            'notes' => 'Bonus promo distributor',
        ]);

        $response->assertRedirect();
        $product->refresh();

        $this->assertEquals($initialStock + 15, (float) $product->stock);

        $movement = StockMovement::where('product_id', $product->id)
            ->where('notes', 'Bonus promo distributor')
            ->latest('id')
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals(15, (float) $movement->quantity);
        $this->assertEquals($initialStock, (float) $movement->stock_before);
        $this->assertEquals($initialStock + 15, (float) $movement->stock_after);
        $this->assertEquals('adjustment', $movement->type);
    }

    public function test_stock_adjustment_subtraction_decreases_stock_and_creates_movement(): void
    {
        $product = Product::where('stock', '>=', 10)->first();
        $initialStock = (float) $product->stock;

        $response = $this->actingAs($this->user)->post('/inventory/adjust', [
            'product_id' => $product->id,
            'type' => 'subtraction',
            'quantity' => 5,
            'notes' => 'Barang rusak kemasan basah',
        ]);

        $response->assertRedirect();
        $product->refresh();

        $this->assertEquals($initialStock - 5, (float) $product->stock);

        $movement = StockMovement::where('product_id', $product->id)
            ->where('notes', 'Barang rusak kemasan basah')
            ->latest('id')
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals(-5, (float) $movement->quantity);
        $this->assertEquals($initialStock - 5, (float) $movement->stock_after);
    }

    public function test_stock_adjustment_fails_if_quantity_exceeds_available_stock(): void
    {
        $product = Product::first();
        $initialStock = (float) $product->stock;

        $response = $this->actingAs($this->user)->post('/inventory/adjust', [
            'product_id' => $product->id,
            'type' => 'subtraction',
            'quantity' => $initialStock + 9999,
            'notes' => 'Pengurangan melebihi stok',
        ]);

        $response->assertSessionHas('error');
        $product->refresh();

        $this->assertEquals($initialStock, (float) $product->stock);
    }

    public function test_stock_movements_history_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/inventory/movements');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('inventory/movements')
            ->has('movements')
        );
    }

    public function test_stock_opname_index_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/stock-opnames');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('inventory/opnames/index')
            ->has('opnames')
        );
    }

    public function test_stock_opname_create_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->user)->get('/stock-opnames/create');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('inventory/opnames/create')
            ->has('products')
            ->has('categories')
        );
    }

    public function test_stock_opname_stores_correctly_and_updates_stocks_with_movements(): void
    {
        $p1 = Product::first();
        $p2 = Product::skip(1)->first();

        $newActualStockP1 = 50;
        $systemStockP1 = (float) $p1->stock;
        $diffP1 = $newActualStockP1 - $systemStockP1;

        $response = $this->actingAs($this->user)->post('/stock-opnames', [
            'notes' => 'Opname Akhir Bulan Testing',
            'items' => [
                [
                    'product_id' => $p1->id,
                    'actual_stock' => $newActualStockP1,
                    'notes' => 'Selisih hitung fisik',
                ],
                [
                    'product_id' => $p2->id,
                    'actual_stock' => $p2->stock, // No difference
                    'notes' => 'Sesuai',
                ],
            ],
        ]);

        $response->assertRedirect('/stock-opnames');

        $opname = StockOpname::where('notes', 'Opname Akhir Bulan Testing')->first();
        $this->assertNotNull($opname);
        $this->assertEquals(2, $opname->items()->count());

        $p1->refresh();
        $this->assertEquals($newActualStockP1, (float) $p1->stock);

        if ($diffP1 != 0) {
            $movement = StockMovement::where('product_id', $p1->id)
                ->where('reference_type', 'stock_opname')
                ->where('reference_id', $opname->id)
                ->first();

            $this->assertNotNull($movement);
            $this->assertEquals($diffP1, (float) $movement->quantity);
            $this->assertEquals($newActualStockP1, (float) $movement->stock_after);
        }

        // Detail show test
        $detailResponse = $this->actingAs($this->user)->get("/stock-opnames/{$opname->id}");
        $detailResponse->assertStatus(200);
        $detailResponse->assertInertia(fn ($page) => $page
            ->component('inventory/opnames/show')
            ->has('opname')
        );
    }
}
