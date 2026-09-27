<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\LoyaltyPointHistory;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SaleHistoryAndReturnTest extends TestCase
{
    use RefreshDatabase;

    protected User $cashier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->cashier = User::where('role', 'cashier')->first();
    }

    protected function createCompletedSale(int $qty = 5): Sale
    {
        $product = Product::first();
        $customer = Customer::first();
        $unitPrice = (float) $product->selling_price;
        $subtotal = $qty * $unitPrice;

        $sale = Sale::create([
            'invoice_number' => 'INV-TEST-0001',
            'user_id' => $this->cashier->id,
            'customer_id' => $customer->id,
            'sale_date' => now(),
            'subtotal' => $subtotal,
            'discount' => 0,
            'tax' => 0,
            'total' => $subtotal,
            'status' => 'completed',
        ]);

        $sale->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'discount' => 0,
            'subtotal' => $subtotal,
        ]);

        $sale->payments()->create([
            'payment_method' => 'cash',
            'amount' => $subtotal,
            'paid_at' => now(),
        ]);

        return $sale;
    }

    public function test_sales_history_index_can_be_rendered(): void
    {
        $this->createCompletedSale();

        $response = $this->actingAs($this->cashier)->get('/sales');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('sales/index')
            ->has('sales')
        );
    }

    public function test_sales_show_can_be_rendered(): void
    {
        $sale = $this->createCompletedSale();

        $response = $this->actingAs($this->cashier)->get("/sales/{$sale->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('sales/show')
            ->has('sale')
        );
    }

    public function test_returns_index_can_be_rendered(): void
    {
        $response = $this->actingAs($this->cashier)->get('/returns');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('returns/index')
            ->has('returns')
        );
    }

    public function test_returns_create_page_can_be_rendered(): void
    {
        $sale = $this->createCompletedSale();

        $response = $this->actingAs($this->cashier)->get("/returns/create?sale_id={$sale->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('returns/create')
            ->has('selectedSale')
            ->has('completedSales')
        );
    }

    public function test_returns_store_successfully_increases_stock_and_creates_movements(): void
    {
        $sale = $this->createCompletedSale(5);
        $saleItem = $sale->items->first();
        $product = Product::find($saleItem->product_id);
        $initialStock = (float) $product->stock;
        $returnQty = 2;

        $response = $this->actingAs($this->cashier)->post('/returns', [
            'sale_id' => $sale->id,
            'reason' => 'Barang kemasan penyok dari pabrik',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => $returnQty,
                ],
            ],
        ]);

        $response->assertRedirect('/returns');

        $return = SaleReturn::where('sale_id', $sale->id)->first();
        $this->assertNotNull($return);
        $this->assertEquals('completed', $return->status);
        $this->assertEquals('Barang kemasan penyok dari pabrik', $return->reason);
        $this->assertEquals($returnQty * (float) $saleItem->unit_price, (float) $return->total);

        // Check stock increased
        $product->refresh();
        $this->assertEquals($initialStock + $returnQty, (float) $product->stock);

        // Check stock movement created with type 'return'
        $movement = StockMovement::where('product_id', $product->id)
            ->where('reference_type', 'return')
            ->where('reference_id', $return->id)
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals('return', $movement->type);
        $this->assertEquals($returnQty, (float) $movement->quantity);
        $this->assertEquals($initialStock + $returnQty, (float) $movement->stock_after);
    }

    public function test_returns_fails_if_quantity_exceeds_available_returnable_amount(): void
    {
        $sale = $this->createCompletedSale(3);
        $saleItem = $sale->items->first();

        $response = $this->actingAs($this->cashier)->post('/returns', [
            'sale_id' => $sale->id,
            'reason' => 'Retur melebihi pembelian',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 10, // purchased was only 3
                ],
            ],
        ]);

        $response->assertSessionHas('error');
    }

    public function test_returns_updates_sale_status_to_returned_when_fully_returned(): void
    {
        $sale = $this->createCompletedSale(2);
        $saleItem = $sale->items->first();

        $response = $this->actingAs($this->cashier)->post('/returns', [
            'sale_id' => $sale->id,
            'reason' => 'Semua barang diretur',
            'items' => [
                [
                    'sale_item_id' => $saleItem->id,
                    'quantity' => 2,
                ],
            ],
        ]);

        $response->assertRedirect('/returns');
        $sale->refresh();

        $this->assertEquals('returned', $sale->status);
    }

    public function test_returns_show_can_be_rendered(): void
    {
        $sale = $this->createCompletedSale(2);
        $saleItem = $sale->items->first();

        $saleReturn = SaleReturn::create([
            'return_number' => 'RET-TEST-0001',
            'sale_id' => $sale->id,
            'user_id' => $this->cashier->id,
            'return_date' => now(),
            'reason' => 'Salah beli',
            'total' => 20000,
            'status' => 'completed',
        ]);

        $saleReturn->items()->create([
            'sale_item_id' => $saleItem->id,
            'product_id' => $saleItem->product_id,
            'quantity' => 1,
            'unit_price' => $saleItem->unit_price,
            'subtotal' => $saleItem->unit_price,
        ]);

        $response = $this->actingAs($this->cashier)->get("/returns/{$saleReturn->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('returns/show')
            ->has('return')
        );
    }

    public function test_return_reverses_member_loyalty_points(): void
    {
        $member = Customer::create([
            'name' => 'Return Member',
            'phone' => '081999999999',
            'is_member' => true,
            'loyalty_points' => 20,
            'member_discount_percent' => 0,
        ]);

        $product = Product::first();
        $unitPrice = (float) $product->selling_price;
        $qty = 2;
        $subtotal = $unitPrice * $qty;

        $sale = Sale::create([
            'invoice_number' => 'INV-TEST-RET-01',
            'user_id' => $this->cashier->id,
            'customer_id' => $member->id,
            'sale_date' => now(),
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'status' => 'completed',
            'points_earned' => 10,
        ]);

        $saleItem = $sale->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);

        LoyaltyPointHistory::create([
            'customer_id' => $member->id,
            'sale_id' => $sale->id,
            'type' => 'earned',
            'points' => 10,
            'balance_after' => 30,
        ]);
        $member->update(['loyalty_points' => 30]);

        $response = $this->actingAs($this->cashier)->post('/returns', [
            'sale_id' => $sale->id,
            'reason' => 'Barang retur',
            'items' => [
                ['sale_item_id' => $saleItem->id, 'quantity' => $qty],
            ],
        ]);

        $response->assertRedirect('/returns');
        $member->refresh();

        // 10 points reversed
        $this->assertEquals(20, $member->loyalty_points);
        $this->assertDatabaseHas('loyalty_point_histories', [
            'customer_id' => $member->id,
            'sale_id' => $sale->id,
            'type' => 'return_reversal',
            'points' => -10,
        ]);
    }
}
