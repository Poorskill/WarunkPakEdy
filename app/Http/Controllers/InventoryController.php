<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockAdjustmentRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $categoryId = $request->input('category_id', '');
        $stockStatus = $request->input('stock_status', '');

        $products = Product::with('category')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            }))
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->when($stockStatus === 'normal', fn ($q) => $q->whereColumn('stock', '>', 'minimum_stock'))
            ->when($stockStatus === 'low', fn ($q) => $q->where('stock', '>', 0)->whereColumn('stock', '<=', 'minimum_stock'))
            ->when($stockStatus === 'out', fn ($q) => $q->where('stock', '<=', 0))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name']);

        $metrics = [
            'totalSkus' => Product::count(),
            'totalPhysicalStock' => (float) Product::sum('stock'),
            'lowStockCount' => Product::where('stock', '>', 0)->whereColumn('stock', '<=', 'minimum_stock')->count(),
            'outOfStockCount' => Product::where('stock', '<=', 0)->count(),
        ];

        return Inertia::render('inventory/index', [
            'products' => $products,
            'categories' => $categories,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId,
                'stock_status' => $stockStatus,
            ],
        ]);
    }

    public function adjustStock(StockAdjustmentRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                /** @var Product $product */
                $product = Product::lockForUpdate()->findOrFail($request->product_id);

                $stockBefore = (float) $product->stock;
                $quantity = (float) $request->quantity;

                if ($request->type === 'addition') {
                    $stockAfter = $stockBefore + $quantity;
                    $diff = $quantity;
                } else {
                    if ($stockBefore < $quantity) {
                        throw new \InvalidArgumentException('Stok saat ini tidak mencukupi untuk pengurangan.');
                    }
                    $stockAfter = $stockBefore - $quantity;
                    $diff = -$quantity;
                }

                $product->update(['stock' => $stockAfter]);

                StockMovement::create([
                    'product_id' => $product->id,
                    'user_id' => Auth::id(),
                    'type' => 'adjustment',
                    'quantity' => $diff,
                    'stock_before' => $stockBefore,
                    'stock_after' => $stockAfter,
                    'reference_type' => 'manual_adjustment',
                    'notes' => $request->notes,
                ]);
            });

            return redirect()->back()->with('success', 'Penyesuaian stok berhasil disimpan.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat memperbarui stok.');
        }
    }

    public function movements(Request $request): Response
    {
        $search = $request->input('search', '');
        $type = $request->input('type', '');

        $movements = StockMovement::with(['product.category', 'user'])
            ->when($search, fn ($q) => $q->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            })->orWhere('notes', 'like', "%{$search}%"))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inventory/movements', [
            'movements' => $movements,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
        ]);
    }
}
