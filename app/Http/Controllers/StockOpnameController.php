<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockOpnameRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    public function index(Request $request): Response
    {
        $opnames = StockOpname::with(['user', 'items.product'])
            ->withCount('items')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('inventory/opnames/index', [
            'opnames' => $opnames,
        ]);
    }

    public function create(Request $request): Response
    {
        $categoryId = $request->input('category_id', '');

        $products = Product::with('category')
            ->where('is_active', true)
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->orderBy('name')
            ->get(['id', 'category_id', 'sku', 'barcode', 'name', 'unit', 'stock', 'minimum_stock']);

        $categories = Category::orderBy('name')->get(['id', 'name']);

        return Inertia::render('inventory/opnames/create', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategoryId' => $categoryId,
        ]);
    }

    public function store(StockOpnameRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $todayPrefix = date('Ymd');
                $countToday = StockOpname::whereDate('created_at', today())->count() + 1;
                $opnameNumber = 'OPN-'.$todayPrefix.'-'.str_pad((string) $countToday, 4, '0', STR_PAD_LEFT);

                $opname = StockOpname::create([
                    'opname_number' => $opnameNumber,
                    'user_id' => Auth::id(),
                    'opname_date' => now(),
                    'status' => 'completed',
                    'notes' => $request->notes,
                ]);

                foreach ($request->items as $itemData) {
                    /** @var Product $product */
                    $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);

                    $systemStock = (float) $product->stock;
                    $actualStock = (float) $itemData['actual_stock'];
                    $diff = $actualStock - $systemStock;

                    StockOpnameItem::create([
                        'stock_opname_id' => $opname->id,
                        'product_id' => $product->id,
                        'system_stock' => $systemStock,
                        'actual_stock' => $actualStock,
                        'notes' => $itemData['notes'] ?? null,
                    ]);

                    if ($diff != 0) {
                        $product->update(['stock' => $actualStock]);

                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => Auth::id(),
                            'type' => 'opname',
                            'quantity' => $diff,
                            'stock_before' => $systemStock,
                            'stock_after' => $actualStock,
                            'reference_type' => 'stock_opname',
                            'reference_id' => $opname->id,
                            'notes' => $itemData['notes'] ?? "Penyesuaian hasil {$opname->opname_number}",
                        ]);
                    }
                }
            });

            return redirect()->route('stock-opnames.index')
                ->with('success', 'Stock Opname berhasil disimpan dan stok produk telah diperbarui.');
        } catch (\Throwable $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kegagalan saat menyimpan Stock Opname: '.$e->getMessage());
        }
    }

    public function show(StockOpname $stockOpname): Response
    {
        $stockOpname->load(['user', 'items.product.category']);

        return Inertia::render('inventory/opnames/show', [
            'opname' => $stockOpname,
        ]);
    }
}
