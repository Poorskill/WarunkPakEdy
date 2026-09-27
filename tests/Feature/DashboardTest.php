<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard_and_receive_trend_data(): void
    {
        $this->seed(DatabaseSeeder::class);
        $owner = User::where('role', 'owner')->first();

        // Create a completed sale for today
        $product = Product::first();
        $customer = Customer::first();
        $qty = 2;
        $unitPrice = (float) $product->selling_price;
        $subtotal = $qty * $unitPrice;

        $sale = Sale::create([
            'invoice_number' => 'INV-DASH-0001',
            'user_id' => $owner->id,
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

        $response = $this->actingAs($owner)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('metrics')
            ->has('weeklyTrend', 7) // exactly 7 days
            ->has('lowStockProducts')
            ->has('recentSales')
            ->has('recentMovements')
            ->where('metrics.todayTransactions', 1)
            ->where('metrics.todaySales', fn ($val) => (float) $val === (float) $subtotal)
        );
    }
}
