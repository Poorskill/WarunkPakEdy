<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReturnRequest;
use App\Models\Customer;
use App\Models\LoyaltyPointHistory;
use App\Models\Product;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');

        $returns = SaleReturn::with(['sale.customer', 'user', 'items.product'])
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('return_number', 'like', "%{$search}%")
                    ->orWhereHas('sale', fn ($sq) => $sq->where('invoice_number', 'like', "%{$search}%"));
            }))
            ->orderBy('return_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('returns/index', [
            'returns' => $returns,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $saleId = $request->input('sale_id');
        $selectedSale = null;

        if ($saleId) {
            $selectedSale = Sale::with(['customer', 'user', 'items.product', 'items.returnItems'])
                ->where('id', $saleId)
                ->first();
        }

        $completedSales = Sale::with('customer')
            ->whereIn('status', ['completed', 'returned'])
            ->orderBy('sale_date', 'desc')
            ->limit(30)
            ->get(['id', 'invoice_number', 'customer_id', 'total', 'sale_date', 'status']);

        return Inertia::render('returns/create', [
            'selectedSale' => $selectedSale,
            'completedSales' => $completedSales,
        ]);
    }

    public function store(ReturnRequest $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                /** @var Sale $sale */
                $sale = Sale::lockForUpdate()->findOrFail($request->sale_id);

                if (! in_array($sale->status, ['completed', 'returned'])) {
                    throw new \InvalidArgumentException('Hanya transaksi penjualan yang sudah selesai yang dapat diretur.');
                }

                $todayPrefix = date('Ymd');
                $countToday = SaleReturn::whereDate('created_at', today())->count() + 1;
                $returnNumber = 'RET-'.$todayPrefix.'-'.str_pad((string) $countToday, 4, '0', STR_PAD_LEFT);

                $itemsInput = $request->items;
                $totalReturn = 0;
                $processedItems = [];

                foreach ($itemsInput as $input) {
                    $saleItem = SaleItem::findOrFail($input['sale_item_id']);
                    $requestedQty = (float) $input['quantity'];

                    if ($requestedQty <= 0) {
                        continue;
                    }

                    $alreadyReturned = (float) ReturnItem::where('sale_item_id', $saleItem->id)->sum('quantity');
                    $maxReturnable = (float) $saleItem->quantity - $alreadyReturned;

                    if ($requestedQty > $maxReturnable) {
                        throw new \InvalidArgumentException("Jumlah retur {$saleItem->product_name} melebihi batas maksimal yang dapat diretur (tersedia: {$maxReturnable}).");
                    }

                    $unitPrice = (float) $saleItem->unit_price;
                    $itemSubtotal = $requestedQty * $unitPrice;
                    $totalReturn += $itemSubtotal;

                    $processedItems[] = [
                        'sale_item' => $saleItem,
                        'product_id' => $saleItem->product_id,
                        'quantity' => $requestedQty,
                        'unit_price' => $unitPrice,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                if (empty($processedItems)) {
                    throw new \InvalidArgumentException('Minimal harus ada 1 item yang memiliki kuantitas retur valid.');
                }

                $saleReturn = SaleReturn::create([
                    'return_number' => $returnNumber,
                    'sale_id' => $sale->id,
                    'user_id' => Auth::id(),
                    'return_date' => now(),
                    'reason' => $request->reason,
                    'total' => $totalReturn,
                    'status' => 'completed',
                ]);

                foreach ($processedItems as $pItem) {
                    ReturnItem::create([
                        'return_id' => $saleReturn->id,
                        'sale_item_id' => $pItem['sale_item']->id,
                        'product_id' => $pItem['product_id'],
                        'quantity' => $pItem['quantity'],
                        'unit_price' => $pItem['unit_price'],
                        'subtotal' => $pItem['subtotal'],
                    ]);

                    /** @var Product $product */
                    $product = Product::lockForUpdate()->findOrFail($pItem['product_id']);
                    $stockBefore = (float) $product->stock;
                    $stockAfter = $stockBefore + $pItem['quantity'];

                    $product->update(['stock' => $stockAfter]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'return',
                        'quantity' => $pItem['quantity'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'return',
                        'reference_id' => $saleReturn->id,
                        'notes' => "Retur {$saleReturn->return_number} (Faktur {$sale->invoice_number})",
                    ]);
                }

                // Loyalty point adjustment upon return
                if ($sale->customer_id) {
                    $customer = Customer::lockForUpdate()->find($sale->customer_id);

                    if ($customer && $customer->is_member) {
                        $earnedHistory = LoyaltyPointHistory::where('sale_id', $sale->id)
                            ->where('type', 'earned')
                            ->first();

                        if ($earnedHistory && $earnedHistory->points > 0) {
                            $earnedPoints = (int) $earnedHistory->points;
                            $saleTotal = (float) $sale->total;

                            $pointsToReverse = 0;
                            if ($saleTotal > 0) {
                                $pointsToReverse = (int) ceil(($totalReturn / $saleTotal) * $earnedPoints);
                            }
                            $pointsToReverse = min($pointsToReverse, $earnedPoints);

                            if ($pointsToReverse > 0) {
                                $customer->loyalty_points = max(0, $customer->loyalty_points - $pointsToReverse);
                                $customer->total_spending = max(0, $customer->total_spending - $totalReturn);
                                $customer->save();

                                LoyaltyPointHistory::create([
                                    'customer_id' => $customer->id,
                                    'sale_id' => $sale->id,
                                    'return_id' => $saleReturn->id,
                                    'type' => 'return_reversal',
                                    'points' => -$pointsToReverse,
                                    'balance_after' => $customer->loyalty_points,
                                    'description' => "Pengurangan {$pointsToReverse} point karena retur {$saleReturn->return_number} (Faktur {$sale->invoice_number})",
                                ]);
                            }
                        }
                    }
                }

                // Check if all items in the sale have been completely returned
                $totalPurchasedQty = (float) $sale->items()->sum('quantity');
                $totalReturnedQty = (float) ReturnItem::whereIn('sale_item_id', $sale->items()->pluck('id'))->sum('quantity');

                if ($totalReturnedQty >= $totalPurchasedQty) {
                    $sale->update(['status' => 'returned']);
                }
            });

            return redirect()->route('returns.index')
                ->with('success', 'Transaksi retur barang berhasil diproses dan stok telah dikembalikan.');
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem: '.$e->getMessage());
        }
    }

    public function show(SaleReturn $saleReturn): Response
    {
        $saleReturn->load(['sale.customer', 'user', 'items.product', 'items.saleItem']);

        return Inertia::render('returns/show', [
            'return' => $saleReturn,
        ]);
    }
}
