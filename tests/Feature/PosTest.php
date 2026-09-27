<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosTest extends TestCase
{
    use RefreshDatabase;

    protected User $cashier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->cashier = User::where('role', 'cashier')->first();
    }

    public function test_pos_page_can_be_rendered(): void
    {
        $response = $this->actingAs($this->cashier)->get('/pos');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('pos/index')
            ->has('products')
            ->has('categories')
            ->has('customers')
        );
    }

    public function test_pos_checkout_successfully_creates_sale_and_deducts_stock_with_movement(): void
    {
        $product = Product::where('stock', '>=', 5)->first();
        $initialStock = (float) $product->stock;
        $qty = 2;
        $expectedTotal = (float) $product->selling_price * $qty;
        $amountPaid = $expectedTotal + 10000;

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                ],
            ],
            'discount' => 0,
            'tax' => 0,
            'payment_method' => 'cash',
            'amount_paid' => $amountPaid,
        ]);

        $response->assertRedirect('/pos');
        $response->assertSessionHas('success');
        $response->assertSessionHas('receipt');

        // Check sale created
        $sale = Sale::latest('id')->first();
        $this->assertNotNull($sale);
        $this->assertEquals($expectedTotal, (float) $sale->total);
        $this->assertEquals('completed', $sale->status);
        $this->assertEquals($this->cashier->id, $sale->user_id);

        // Check sale item created with snapshots
        $saleItem = $sale->items()->first();
        $this->assertNotNull($saleItem);
        $this->assertEquals($product->name, $saleItem->product_name);
        $this->assertEquals($product->sku, $saleItem->sku);
        $this->assertEquals($qty, (float) $saleItem->quantity);

        // Check stock deducted
        $product->refresh();
        $this->assertEquals($initialStock - $qty, (float) $product->stock);

        // Check stock movement created
        $movement = StockMovement::where('product_id', $product->id)
            ->where('reference_type', 'sale')
            ->where('reference_id', $sale->id)
            ->first();

        $this->assertNotNull($movement);
        $this->assertEquals('sale', $movement->type);
        $this->assertEquals(-$qty, (float) $movement->quantity);
        $this->assertEquals($initialStock, (float) $movement->stock_before);
        $this->assertEquals($initialStock - $qty, (float) $movement->stock_after);

        // Check payment created
        $payment = Payment::where('sale_id', $sale->id)->first();
        $this->assertNotNull($payment);
        $this->assertEquals('cash', $payment->payment_method);
        $this->assertEquals($amountPaid, (float) $payment->amount);
    }

    public function test_pos_checkout_fails_if_stock_is_insufficient(): void
    {
        $product = Product::first();
        $excessiveQty = (float) $product->stock + 1000;

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => $excessiveQty,
                ],
            ],
            'payment_method' => 'cash',
            'amount_paid' => 1000000,
        ]);

        $response->assertSessionHas('error');
    }

    public function test_pos_checkout_fails_if_cash_amount_is_less_than_total(): void
    {
        $product = Product::first();
        $qty = 2;
        $total = (float) $product->selling_price * $qty;

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => $qty,
                ],
            ],
            'payment_method' => 'cash',
            'amount_paid' => $total - 1000, // Less than total
        ]);

        $response->assertSessionHas('error');
    }

    public function test_pos_checkout_with_customer_attaches_customer_id(): void
    {
        $customer = Customer::first();
        $product = Product::first();

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'payment_method' => 'cash',
            'amount_paid' => 500000,
        ]);

        $response->assertRedirect('/pos');

        $sale = Sale::latest('id')->first();
        $this->assertEquals($customer->id, $sale->customer_id);
    }

    public function test_pos_checkout_with_qris_or_transfer_records_payment(): void
    {
        $product = Product::first();
        $price = (float) $product->selling_price;

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => null,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 1,
                ],
            ],
            'payment_method' => 'qris',
            'amount_paid' => $price,
            'reference_number' => 'QRIS-REF-998811',
        ]);

        $response->assertRedirect('/pos');

        $sale = Sale::latest('id')->first();
        $payment = Payment::where('sale_id', $sale->id)->first();
        $this->assertEquals('qris', $payment->payment_method);
        $this->assertEquals('QRIS-REF-998811', $payment->reference_number);
    }

    public function test_search_member_by_phone(): void
    {
        $customer = Customer::create([
            'name' => 'Baruna Dwi Cahya',
            'phone' => '081234567890',
            'is_member' => true,
            'loyalty_points' => 1250,
            'member_discount_percent' => 5.00,
        ]);

        // Exact search
        $response = $this->actingAs($this->cashier)->get('/pos/member/search?phone=081234567890');
        $response->assertOk();
        $response->assertJson([
            'found' => true,
            'customer' => [
                'id' => $customer->id,
                'name' => 'Baruna Dwi Cahya',
                'loyalty_points' => 1250,
            ],
        ]);

        // Search with +62 variation
        $response2 = $this->actingAs($this->cashier)->get('/pos/member/search?phone=+6281234567890');
        $response2->assertOk();
        $response2->assertJson(['found' => true]);

        // Not found
        $response3 = $this->actingAs($this->cashier)->get('/pos/member/search?phone=089999999999');
        $response3->assertOk();
        $response3->assertJson(['found' => false]);
    }

    public function test_register_member_from_pos_normalizes_and_prevents_duplicate(): void
    {
        $response = $this->actingAs($this->cashier)->postJson('/pos/member/register', [
            'name' => 'Member Baru Test',
            'phone' => '+62812-9988-7766',
        ]);

        $response->assertOk();
        $response->assertJson([
            'success' => true,
            'customer' => [
                'name' => 'Member Baru Test',
                'phone' => '081299887766',
                'is_member' => true,
                'loyalty_points' => 0,
            ],
        ]);

        $this->assertDatabaseHas('customers', [
            'name' => 'Member Baru Test',
            'phone' => '081299887766',
            'is_member' => true,
        ]);

        // Attempt duplicate registration
        $dupResponse = $this->actingAs($this->cashier)->postJson('/pos/member/register', [
            'name' => 'Member Duplicate',
            'phone' => '081299887766',
        ]);

        $dupResponse->assertStatus(422);
    }

    public function test_member_checkout_earns_loyalty_points(): void
    {
        $member = Customer::create([
            'name' => 'Loyal Member',
            'phone' => '081300000000',
            'is_member' => true,
            'loyalty_points' => 10,
            'member_discount_percent' => 0, // no discount for pure point test
        ]);

        $product = Product::first();
        $qty = 10;
        $total = (float) $product->selling_price * $qty;

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => $member->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => $qty],
            ],
            'payment_method' => 'cash',
            'amount_paid' => $total + 50000,
        ]);

        $response->assertRedirect('/pos');
        $member->refresh();

        // Total / 10.000 = earned points
        $expectedPoints = (int) floor($total / 10000);
        $this->assertEquals(10 + $expectedPoints, $member->loyalty_points);
        $this->assertEquals($total, (float) $member->total_spending);
        $this->assertEquals(1, $member->total_transactions);

        // Check history
        $this->assertDatabaseHas('loyalty_point_histories', [
            'customer_id' => $member->id,
            'type' => 'earned',
            'points' => $expectedPoints,
        ]);
    }

    public function test_member_checkout_can_redeem_points_and_fails_if_insufficient(): void
    {
        $member = Customer::create([
            'name' => 'Redeem Member',
            'phone' => '081500000000',
            'is_member' => true,
            'loyalty_points' => 100, // 100 points = Rp 10.000
            'member_discount_percent' => 0,
        ]);

        $product = Product::first(); // e.g. price > 10.000
        $qty = 2;
        $subtotal = (float) $product->selling_price * $qty;
        $expectedTotal = $subtotal - 10000; // 100 pt redeemed

        $response = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => $member->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => $qty],
            ],
            'points_to_redeem' => 100,
            'payment_method' => 'cash',
            'amount_paid' => $expectedTotal,
        ]);

        $response->assertRedirect('/pos');
        $member->refresh();

        // 100 redeemed, plus earned points from $expectedTotal
        $earned = (int) floor($expectedTotal / 10000);
        $this->assertEquals(0 + $earned, $member->loyalty_points);

        $this->assertDatabaseHas('loyalty_point_histories', [
            'customer_id' => $member->id,
            'type' => 'redeemed',
            'points' => -100,
        ]);

        // Insufficient balance test
        $failResponse = $this->actingAs($this->cashier)->post('/pos/checkout', [
            'customer_id' => $member->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'points_to_redeem' => 9999, // exceed balance
            'payment_method' => 'cash',
            'amount_paid' => 100000,
        ]);

        $failResponse->assertSessionHas('error');
    }
}
