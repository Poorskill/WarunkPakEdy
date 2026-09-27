<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected function parseDateRange(Request $request): array
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (! $startDate || ! $endDate) {
            $startDate = now()->startOfMonth()->toDateString();
            $endDate = now()->toDateString();
        }

        return [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay(),
            $startDate,
            $endDate,
        ];
    }

    public function sales(Request $request): Response
    {
        [$start, $end, $startDateStr, $endDateStr] = $this->parseDateRange($request);

        $salesQuery = Sale::whereBetween('sale_date', [$start, $end])
            ->where('status', 'completed');

        $totalSales = (float) $salesQuery->sum('total');
        $totalTransactions = $salesQuery->count();
        $averageTransaction = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;
        $totalDiscount = (float) $salesQuery->sum('discount');

        // Payment method breakdown
        $paymentBreakdown = DB::table('payments')
            ->join('sales', 'payments.sale_id', '=', 'sales.id')
            ->whereBetween('sales.sale_date', [$start, $end])
            ->where('sales.status', 'completed')
            ->select('payments.payment_method', DB::raw('COUNT(payments.id) as count'), DB::raw('SUM(payments.amount) as total_amount'))
            ->groupBy('payments.payment_method')
            ->get();

        // Top selling products
        $topProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->whereBetween('sales.sale_date', [$start, $end])
            ->where('sales.status', 'completed')
            ->select(
                'sale_items.product_name',
                'sale_items.sku',
                DB::raw('SUM(sale_items.quantity) as total_qty'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue')
            )
            ->groupBy('sale_items.product_name', 'sale_items.sku')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // Paginated transactions
        $transactions = Sale::with(['customer', 'user', 'payments'])
            ->whereBetween('sale_date', [$start, $end])
            ->where('status', 'completed')
            ->orderBy('sale_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('reports/sales', [
            'metrics' => [
                'totalSales' => $totalSales,
                'totalTransactions' => $totalTransactions,
                'averageTransaction' => $averageTransaction,
                'totalDiscount' => $totalDiscount,
            ],
            'paymentBreakdown' => $paymentBreakdown,
            'topProducts' => $topProducts,
            'transactions' => $transactions,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
            ],
        ]);
    }

    public function stock(Request $request): Response
    {
        [$start, $end, $startDateStr, $endDateStr] = $this->parseDateRange($request);
        $categoryId = $request->input('category_id', '');
        $stockStatus = $request->input('stock_status', '');

        // Summary metrics across all products
        $totalAssetValue = (float) Product::select(DB::raw('SUM(stock * purchase_price) as total_value'))->value('total_value');
        $totalPhysicalStock = (float) Product::sum('stock');
        $lowStockCount = Product::where('stock', '>', 0)->whereColumn('stock', '<=', 'minimum_stock')->count();
        $outOfStockCount = Product::where('stock', '<=', 0)->count();

        // Movements summary in selected date range
        $totalStockIn = (float) StockMovement::whereBetween('created_at', [$start, $end])
            ->where('quantity', '>', 0)
            ->sum('quantity');

        $totalStockOut = (float) abs(StockMovement::whereBetween('created_at', [$start, $end])
            ->where('quantity', '<', 0)
            ->sum('quantity'));

        // Products with asset valuation
        $products = Product::with('category')
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($stockStatus === 'normal', fn ($q) => $q->whereColumn('stock', '>', 'minimum_stock'))
            ->when($stockStatus === 'low', fn ($q) => $q->where('stock', '>', 0)->whereColumn('stock', '<=', 'minimum_stock'))
            ->when($stockStatus === 'out', fn ($q) => $q->where('stock', '<=', 0))
            ->select('*', DB::raw('(stock * purchase_price) as asset_value'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('reports/stock', [
            'metrics' => [
                'totalAssetValue' => $totalAssetValue,
                'totalPhysicalStock' => $totalPhysicalStock,
                'lowStockCount' => $lowStockCount,
                'outOfStockCount' => $outOfStockCount,
                'totalStockIn' => $totalStockIn,
                'totalStockOut' => $totalStockOut,
            ],
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
                'category_id' => $categoryId,
                'stock_status' => $stockStatus,
            ],
        ]);
    }

    public function profit(Request $request): Response
    {
        [$start, $end, $startDateStr, $endDateStr] = $this->parseDateRange($request);

        $sales = Sale::with(['items.product'])
            ->whereBetween('sale_date', [$start, $end])
            ->where('status', 'completed')
            ->get();

        $totalRevenue = 0;
        $totalCogs = 0;
        $dailyData = [];

        foreach ($sales as $sale) {
            $saleRevenue = (float) $sale->total;
            $totalRevenue += $saleRevenue;

            $dateKey = $sale->sale_date->format('Y-m-d');
            if (! isset($dailyData[$dateKey])) {
                $dailyData[$dateKey] = [
                    'date' => $dateKey,
                    'transactions_count' => 0,
                    'revenue' => 0,
                    'cogs' => 0,
                ];
            }

            $dailyData[$dateKey]['transactions_count']++;
            $dailyData[$dateKey]['revenue'] += $saleRevenue;

            foreach ($sale->items as $item) {
                $itemCost = (float) $item->quantity * (float) ($item->product->purchase_price ?? 0);
                $totalCogs += $itemCost;
                $dailyData[$dateKey]['cogs'] += $itemCost;
            }
        }

        $grossProfit = $totalRevenue - $totalCogs;
        $marginPercentage = $totalRevenue > 0 ? ($grossProfit / $totalRevenue) * 100 : 0;

        // Format daily table items
        $dailyReports = array_values(array_map(function ($d) {
            $profit = $d['revenue'] - $d['cogs'];
            $margin = $d['revenue'] > 0 ? ($profit / $d['revenue']) * 100 : 0;

            return [
                'date' => $d['date'],
                'transactions_count' => $d['transactions_count'],
                'revenue' => $d['revenue'],
                'cogs' => $d['cogs'],
                'profit' => $profit,
                'margin' => round($margin, 1),
            ];
        }, $dailyData));

        // Sort daily reports descending
        usort($dailyReports, fn ($a, $b) => strcmp($b['date'], $a['date']));

        // Top profitable products
        $topProfitableProducts = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->whereBetween('sales.sale_date', [$start, $end])
            ->where('sales.status', 'completed')
            ->select(
                'sale_items.product_name',
                'sale_items.sku',
                DB::raw('SUM(sale_items.quantity) as qty_sold'),
                DB::raw('SUM(sale_items.subtotal) as total_revenue'),
                DB::raw('SUM(sale_items.quantity * products.purchase_price) as total_cogs'),
                DB::raw('SUM(sale_items.subtotal - (sale_items.quantity * products.purchase_price)) as total_profit')
            )
            ->groupBy('sale_items.product_name', 'sale_items.sku')
            ->orderByDesc('total_profit')
            ->limit(5)
            ->get();

        return Inertia::render('reports/profit', [
            'metrics' => [
                'totalRevenue' => $totalRevenue,
                'totalCogs' => $totalCogs,
                'grossProfit' => $grossProfit,
                'marginPercentage' => round($marginPercentage, 1),
            ],
            'dailyReports' => $dailyReports,
            'topProfitableProducts' => $topProfitableProducts,
            'filters' => [
                'start_date' => $startDateStr,
                'end_date' => $endDateStr,
            ],
        ]);
    }
}
