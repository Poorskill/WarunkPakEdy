<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = now()->startOfDay();

        // 1. Today sales & transactions (filtered for Cashier)
        $todaySalesQuery = Sale::with('items.product')
            ->where('sale_date', '>=', $today)
            ->where('status', 'completed')
            ->when($user->isCashier(), fn ($q) => $q->where('user_id', $user->id));

        $todaySales = (float) $todaySalesQuery->sum('total');
        $todayTransactionsCount = $todaySalesQuery->count();

        // 2. Today gross profit (ONLY for Owner)
        $todayProfit = 0;
        if ($user->isOwner()) {
            $todayCogs = 0;
            foreach ($todaySalesQuery->get() as $sale) {
                foreach ($sale->items as $item) {
                    $todayCogs += ((float) $item->quantity * (float) ($item->product->purchase_price ?? 0));
                }
            }
            $todayProfit = max(0, $todaySales - $todayCogs);
        }

        // 3. General counts
        $totalProductsCount = Product::count();
        $totalCustomersCount = Customer::count();
        $lowStockCount = Product::where('stock', '>', 0)->whereColumn('stock', '<=', 'minimum_stock')->count();
        $outOfStockCount = Product::where('stock', '<=', 0)->count();

        // 4. Low stock products (critical alert)
        $lowStockProducts = Product::with('category')
            ->whereColumn('stock', '<=', 'minimum_stock')
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get();

        // 5. Recent completed sales
        $recentSales = Sale::with(['user', 'customer', 'items'])
            ->when($user->isCashier(), fn ($q) => $q->where('user_id', $user->id))
            ->orderBy('sale_date', 'desc')
            ->limit(5)
            ->get();

        // 6. Recent stock movements (Owner & Admin only, Cashier gets empty)
        $recentMovements = $user->isCashier() ? [] : StockMovement::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // 7. 7-Day sales trend
        $sevenDaysAgo = now()->subDays(6)->startOfDay();
        $pastSales = Sale::whereBetween('sale_date', [$sevenDaysAgo, now()->endOfDay()])
            ->where('status', 'completed')
            ->when($user->isCashier(), fn ($q) => $q->where('user_id', $user->id))
            ->get();

        $dayNames = [
            1 => 'Sen',
            2 => 'Sel',
            3 => 'Rab',
            4 => 'Kam',
            5 => 'Jum',
            6 => 'Sab',
            7 => 'Min',
        ];

        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeekIso; // 1 = Monday, 7 = Sunday

            $salesForDay = $pastSales->filter(fn ($s) => $s->sale_date->format('Y-m-d') === $dateStr);

            $weeklyTrend[] = [
                'date' => $dateStr,
                'day_label' => $dayNames[$dayOfWeek].', '.$date->format('d/m'),
                'total' => (float) $salesForDay->sum('total'),
                'count' => $salesForDay->count(),
            ];
        }

        return Inertia::render('dashboard', [
            'metrics' => [
                'todaySales' => $todaySales,
                'todayTransactions' => $todayTransactionsCount,
                'todayProfit' => $todayProfit,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'totalProducts' => $totalProductsCount,
                'totalCustomers' => $totalCustomersCount,
            ],
            'weeklyTrend' => $weeklyTrend,
            'lowStockProducts' => $lowStockProducts,
            'recentSales' => $recentSales,
            'recentMovements' => $recentMovements,
        ]);
    }
}
