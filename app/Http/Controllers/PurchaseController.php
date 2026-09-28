<?php

namespace App\Http\Controllers;

use App\Http\Requests\PurchaseRequest;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $purchases = Purchase::with(['supplier', 'user'])
            ->withCount('items')
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            }))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('purchase_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('purchases/index', [
            'purchases' => $purchases,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        $suppliers = Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name', 'phone']);
        $products = Product::where('is_active', true)->orderBy('name')->get([
            'id', 'name', 'sku', 'unit', 'purchase_price', 'stock',
        ]);

        return Inertia::render('purchases/create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(PurchaseRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $todayPrefix = date('Ymd');
                $countToday = Purchase::whereDate('created_at', today())->count() + 1;
                $purchaseNumber = 'PO-'.$todayPrefix.'-'.str_pad((string) $countToday, 4, '0', STR_PAD_LEFT);

                $itemsData = $request->items;
                $subtotal = 0;

                foreach ($itemsData as $item) {
                    $subtotal += ((float) $item['quantity'] * (float) $item['purchase_price']);
                }

                $discount = (float) ($request->discount ?? 0);
                $tax = (float) ($request->tax ?? 0);
                $total = max(0, $subtotal - $discount + $tax);

                $purchase = Purchase::create([
                    'purchase_number' => $purchaseNumber,
                    'supplier_id' => $request->supplier_id,
                    'user_id' => Auth::id(),
                    'purchase_date' => $request->purchase_date,
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax' => $tax,
                    'total' => $total,
                    'status' => $request->status,
                    'notes' => $request->notes,
                ]);

                foreach ($itemsData as $item) {
                    $itemQty = (float) $item['quantity'];
                    $itemPrice = (float) $item['purchase_price'];
                    $itemSubtotal = $itemQty * $itemPrice;

                    PurchaseItem::create([
                        'purchase_id' => $purchase->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $itemQty,
                        'purchase_price' => $itemPrice,
                        'subtotal' => $itemSubtotal,
                    ]);

                    if ($request->status === 'completed') {
                        /** @var Product $product */
                        $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                        $stockBefore = (float) $product->stock;
                        $stockAfter = $stockBefore + $itemQty;

                        $product->update([
                            'stock' => $stockAfter,
                            'purchase_price' => $itemPrice,
                        ]);

                        StockMovement::create([
                            'product_id' => $product->id,
                            'user_id' => Auth::id(),
                            'type' => 'purchase',
                            'quantity' => $itemQty,
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'reference_type' => 'purchase',
                            'reference_id' => $purchase->id,
                            'notes' => "Pembelian {$purchase->purchase_number}",
                        ]);
                    }
                }
            });

            return redirect()->route('purchases.index')
                ->with('success', 'Transaksi pembelian berhasil disimpan.');
        } catch (\Throwable $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kegagalan saat menyimpan transaksi pembelian: '.$e->getMessage());
        }
    }

    public function show(Purchase $purchase): Response
    {
        $purchase->load(['supplier', 'user', 'items.product.category']);

        return Inertia::render('purchases/show', [
            'purchase' => $purchase,
        ]);
    }

    public function complete(Purchase $purchase): RedirectResponse
    {
        if (! in_array(Auth::user()?->role, ['owner', 'admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        if ($purchase->status !== 'draft') {
            return redirect()->back()->with('error', 'Hanya pembelian berstatus draft yang dapat diselesaikan.');
        }

        try {
            DB::transaction(function () use ($purchase) {
                foreach ($purchase->items as $item) {
                    /** @var Product $product */
                    $product = Product::lockForUpdate()->findOrFail($item->product_id);
                    $stockBefore = (float) $product->stock;
                    $stockAfter = $stockBefore + (float) $item->quantity;

                    $product->update([
                        'stock' => $stockAfter,
                        'purchase_price' => (float) $item->purchase_price,
                    ]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'purchase',
                        'quantity' => (float) $item->quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'purchase',
                        'reference_id' => $purchase->id,
                        'notes' => "Penyelesaian draft pembelian {$purchase->purchase_number}",
                    ]);
                }

                $purchase->update(['status' => 'completed']);
            });

            return redirect()->back()->with('success', 'Pembelian diselesaikan dan stok telah ditambahkan.');
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan: '.$e->getMessage());
        }
    }

    public function cancel(Purchase $purchase): RedirectResponse
    {
        if (! in_array(Auth::user()?->role, ['owner', 'admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        if ($purchase->status !== 'draft') {
            return redirect()->back()->with('error', 'Hanya pembelian berstatus draft yang dapat dibatalkan.');
        }

        $purchase->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Draft pembelian berhasil dibatalkan.');
    }
}
