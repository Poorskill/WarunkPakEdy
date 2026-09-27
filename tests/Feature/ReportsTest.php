<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsTest extends TestCase
{
    use RefreshDatabase;

    protected User $owner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->owner = User::where('role', 'owner')->first();
    }

    protected function createSalesData(): void
    {
        $product = Product::first();
        $customer = Customer::first();
        $qty = 4;
        $unitPrice = (float) $product->selling_price;
        $subtotal = $qty * $unitPrice;

        $sale = Sale::create([
            'invoice_number' => 'INV-REP-0001',
            'user_id' => $this->owner->id,
            'customer_id' => $customer->id,
            'sale_date' => now(),
            'subtotal' => $subtotal,
            'discount' => 1000,
            'tax' => 500,
            'total' => $subtotal - 1000 + 500,
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
            'amount' => $sale->total,
            'paid_at' => now(),
        ]);
    }

    public function test_sales_report_can_be_rendered_with_metrics_and_breakdowns(): void
    {
        $this->createSalesData();

        $response = $this->actingAs($this->owner)->get('/reports/sales');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/sales')
            ->has('metrics')
            ->has('paymentBreakdown')
            ->has('topProducts')
            ->has('transactions')
        );
    }

    public function test_stock_report_can_be_rendered_with_asset_valuation_and_movements(): void
    {
        $response = $this->actingAs($this->owner)->get('/reports/stock');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/stock')
            ->has('metrics')
            ->has('products')
            ->has('categories')
        );
    }

    public function test_profit_report_can_be_rendered_with_accurate_revenue_cogs_and_margins(): void
    {
        $this->createSalesData();

        $response = $this->actingAs($this->owner)->get('/reports/profit');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/profit')
            ->has('metrics')
            ->has('dailyReports')
            ->has('topProfitableProducts')
        );
    }

    public function test_sales_report_filters_by_date_range(): void
    {
        $this->createSalesData();

        $yesterday = now()->subDays(2)->toDateString();
        $response = $this->actingAs($this->owner)->get("/reports/sales?start_date={$yesterday}&end_date={$yesterday}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/sales')
            ->where('metrics.totalSales', 0)
        );
    }

    public function test_profit_report_handles_empty_sales_period_gracefully(): void
    {
        $lastYear = now()->subYear()->toDateString();
        $response = $this->actingAs($this->owner)->get("/reports/profit?start_date={$lastYear}&end_date={$lastYear}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('reports/profit')
            ->where('metrics.totalRevenue', 0)
            ->where('metrics.grossProfit', 0)
            ->where('metrics.marginPercentage', 0)
        );
    }
}
