<?php

namespace App\Http\Controllers;

use App\Helpers\PhoneHelper;
use App\Http\Requests\RegisterMemberRequest;
use App\Http\Requests\SaleRequest;
use App\Models\Category;
use App\Models\Customer;
use App\Models\LoyaltyPointHistory;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        $products = Product::with('category')
            ->where('is_active', true)
            ->orderBy('name')
            ->get([
                'id',
                'category_id',
                'sku',
                'barcode',
                'name',
                'selling_price',
                'stock',
                'minimum_stock',
                'unit',
                'image_path',
            ]);

        $categories = Category::orderBy('name')->get(['id', 'name']);

        $customers = Customer::orderBy('name')->get([
            'id',
            'name',
            'phone',
            'is_member',
            'loyalty_points',
            'member_discount_percent',
        ]);

        return Inertia::render('pos/index', [
            'products' => $products,
            'categories' => $categories,
            'customers' => $customers,
            'loyaltySettings' => [
                'rateAmount' => (float) Setting::get('loyalty_rate_amount', 10000), // Rp 10.000 = 1 pt
                'redeemRate' => (float) Setting::get('loyalty_redeem_rate', 100),   // 1 pt = Rp 100
                'defaultDiscountPercent' => (float) Setting::get('member_discount_percent', 5.00),
            ],
        ]);
    }

    /**
     * Search customer / member by phone number.
     */
    public function searchMember(Request $request): JsonResponse
    {
        $phoneInput = (string) $request->input('phone', '');

        if (trim($phoneInput) === '') {
            return response()->json([
                'found' => false,
                'message' => 'Silakan masukkan nomor HP member.',
            ]);
        }

        $variations = PhoneHelper::searchVariations($phoneInput);
        $customer = Customer::whereIn('phone', $variations)->first();

        if (! $customer) {
            $digitsOnly = preg_replace('/[^0-9]/', '', $phoneInput);
            if (strlen($digitsOnly) >= 5) {
                $customer = Customer::where('phone', 'like', "%{$digitsOnly}%")->first();
            }
        }

        if ($customer) {
            return response()->json([
                'found' => true,
                'customer' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'formatted_phone' => $customer->formatted_phone,
                    'is_member' => (bool) $customer->is_member,
                    'loyalty_points' => (int) $customer->loyalty_points,
                    'member_discount_percent' => (float) ($customer->member_discount_percent ?? 5.00),
                ],
            ]);
        }

        return response()->json([
            'found' => false,
            'message' => 'Nomor HP belum terdaftar sebagai member.',
        ]);
    }

    /**
     * Fast-register a member from POS.
     */
    public function registerMember(RegisterMemberRequest $request): JsonResponse
    {
        $customer = Customer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'is_member' => true,
            'loyalty_points' => 0,
            'member_discount_percent' => 5.00,
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member baru berhasil didaftarkan.',
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'formatted_phone' => $customer->formatted_phone,
                'is_member' => true,
                'loyalty_points' => 0,
                'member_discount_percent' => 5.00,
            ],
        ]);
    }

    public function checkout(SaleRequest $request): RedirectResponse
    {
        try {
            $receiptData = DB::transaction(function () use ($request) {
                $todayPrefix = date('Ymd');
                $countToday = Sale::whereDate('created_at', today())->count() + 1;
                $invoiceNumber = 'INV-'.$todayPrefix.'-'.str_pad((string) $countToday, 4, '0', STR_PAD_LEFT);

                $itemsInput = $request->items;
                $subtotal = 0;
                $processedItems = [];

                foreach ($itemsInput as $item) {
                    /** @var Product $product */
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                    $qty = (float) $item['quantity'];

                    if ($product->stock < $qty) {
                        throw new \InvalidArgumentException("Stok {$product->name} tidak mencukupi (sisa: {$product->stock} {$product->unit}).");
                    }

                    $unitPrice = (float) $product->selling_price;
                    $itemSubtotal = $qty * $unitPrice;
                    $subtotal += $itemSubtotal;

                    $processedItems[] = [
                        'product' => $product,
                        'quantity' => $qty,
                        'unit_price' => $unitPrice,
                        'subtotal' => $itemSubtotal,
                    ];
                }

                // 1. Customer & Member Benefits
                /** @var Customer|null $customer */
                $customer = null;
                $memberDiscount = 0;
                $pointsRedeemed = 0;
                $pointDiscount = 0;

                if ($request->customer_id) {
                    $customer = Customer::lockForUpdate()->find($request->customer_id);

                    if ($customer && $customer->is_member) {
                        // Apply member discount if requested or by default
                        if ($request->boolean('apply_member_discount', true)) {
                            $memberDiscountPercent = (float) ($customer->member_discount_percent ?? 5.00);
                            $memberDiscount = round($subtotal * ($memberDiscountPercent / 100), 2);
                        }

                        // Point redemption
                        $requestedPoints = (int) ($request->points_to_redeem ?? 0);
                        if ($requestedPoints > 0) {
                            if ($customer->loyalty_points < $requestedPoints) {
                                throw new \InvalidArgumentException("Saldo point member tidak mencukupi (Tersedia: {$customer->loyalty_points} point).");
                            }

                            $redeemRate = (float) Setting::get('loyalty_redeem_rate', 100); // 1 point = Rp 100
                            $calculatedDiscount = $requestedPoints * $redeemRate;
                            $maxRedeemDiscount = max(0, $subtotal - $memberDiscount);

                            $pointDiscount = min($calculatedDiscount, $maxRedeemDiscount);
                            $pointsRedeemed = $requestedPoints;
                        }
                    }
                }

                $manualDiscount = (float) ($request->discount ?? 0);
                $totalDiscount = $memberDiscount + $pointDiscount + $manualDiscount;
                $tax = (float) ($request->tax ?? 0);
                $total = max(0, $subtotal - $totalDiscount + $tax);
                $amountPaid = (float) $request->amount_paid;

                if ($amountPaid < $total) {
                    throw new \InvalidArgumentException('Nominal uang yang dibayarkan kurang dari total belanja.');
                }

                $change = max(0, $amountPaid - $total);

                // 2. Loyalty points earned calculation (Rp 10.000 = 1 point)
                $pointsEarned = 0;
                if ($customer && $customer->is_member && $total > 0) {
                    $rateAmount = (float) Setting::get('loyalty_rate_amount', 10000);
                    $rateAmount = $rateAmount > 0 ? $rateAmount : 10000;
                    $pointsEarned = (int) floor($total / $rateAmount);
                }

                $sale = Sale::create([
                    'invoice_number' => $invoiceNumber,
                    'user_id' => Auth::id(),
                    'customer_id' => $customer?->id,
                    'sale_date' => now(),
                    'subtotal' => $subtotal,
                    'discount' => $totalDiscount,
                    'tax' => $tax,
                    'total' => $total,
                    'status' => 'completed',
                    'notes' => $request->notes,
                    'points_earned' => $pointsEarned,
                    'points_redeemed' => $pointsRedeemed,
                    'point_discount_amount' => $pointDiscount,
                    'member_discount_amount' => $memberDiscount,
                ]);

                // 3. Process stock & items
                $receiptItems = [];

                foreach ($processedItems as $pItem) {
                    /** @var Product $product */
                    $product = $pItem['product'];
                    $qty = $pItem['quantity'];

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'quantity' => $qty,
                        'unit_price' => $pItem['unit_price'],
                        'discount' => 0,
                        'subtotal' => $pItem['subtotal'],
                    ]);

                    $stockBefore = (float) $product->stock;
                    $stockAfter = $stockBefore - $qty;

                    $product->update(['stock' => $stockAfter]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'sale',
                        'quantity' => -$qty,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'sale',
                        'reference_id' => $sale->id,
                        'notes' => "Penjualan {$sale->invoice_number}",
                    ]);

                    $receiptItems[] = [
                        'name' => $product->name,
                        'sku' => $product->sku,
                        'unit' => $product->unit,
                        'quantity' => $qty,
                        'unit_price' => $pItem['unit_price'],
                        'subtotal' => $pItem['subtotal'],
                    ];
                }

                // 4. Record Payment
                Payment::create([
                    'sale_id' => $sale->id,
                    'payment_method' => $request->payment_method,
                    'amount' => $amountPaid,
                    'paid_at' => now(),
                    'reference_number' => $request->reference_number,
                    'notes' => $request->notes,
                ]);

                // 5. Update Customer loyalty points & statistics
                $balanceAfterTransaction = 0;

                if ($customer && $customer->is_member) {
                    // Deduct redeemed points
                    if ($pointsRedeemed > 0) {
                        $customer->loyalty_points = max(0, $customer->loyalty_points - $pointsRedeemed);

                        LoyaltyPointHistory::create([
                            'customer_id' => $customer->id,
                            'sale_id' => $sale->id,
                            'type' => 'redeemed',
                            'points' => -$pointsRedeemed,
                            'balance_after' => $customer->loyalty_points,
                            'description' => "Penukaran {$pointsRedeemed} point (Diskon Rp ".number_format($pointDiscount, 0, ',', '.').") faktur {$sale->invoice_number}",
                        ]);
                    }

                    // Add earned points
                    if ($pointsEarned > 0) {
                        $customer->loyalty_points += $pointsEarned;

                        LoyaltyPointHistory::create([
                            'customer_id' => $customer->id,
                            'sale_id' => $sale->id,
                            'type' => 'earned',
                            'points' => $pointsEarned,
                            'balance_after' => $customer->loyalty_points,
                            'description' => "Perolehan {$pointsEarned} point dari faktur {$sale->invoice_number}",
                        ]);
                    }

                    $customer->total_spending += $total;
                    $customer->total_transactions += 1;
                    $customer->save();

                    $balanceAfterTransaction = $customer->loyalty_points;
                }

                return [
                    'store_name' => Setting::get('store_name', 'WarunkPakEdy'),
                    'store_phone' => Setting::get('store_phone', '0812-3456-7890'),
                    'store_address' => Setting::get('store_address', 'Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217'),
                    'receipt_footer' => Setting::get('receipt_footer', 'Terima kasih atas kunjungan Anda!'),
                    'invoice_number' => $sale->invoice_number,
                    'date' => $sale->sale_date->format('d M Y, H:i'),
                    'cashier' => Auth::user()->name,
                    'customer' => $customer ? $customer->name : 'Pelanggan Umum',
                    'customer_phone' => $customer ? $customer->formatted_phone : null,
                    'is_member' => (bool) ($customer?->is_member ?? false),
                    'points_earned' => $pointsEarned,
                    'points_redeemed' => $pointsRedeemed,
                    'point_discount' => $pointDiscount,
                    'member_discount' => $memberDiscount,
                    'loyalty_balance' => $balanceAfterTransaction,
                    'subtotal' => $subtotal,
                    'discount' => $totalDiscount,
                    'tax' => $tax,
                    'total' => $total,
                    'amount_paid' => $amountPaid,
                    'change' => $change,
                    'payment_method' => $request->payment_method,
                    'items' => $receiptItems,
                ];
            });

            return redirect()->route('pos.index')
                ->with('success', 'Transaksi berhasil disimpan.')
                ->with('receipt', $receiptData);
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan sistem saat memproses transaksi: '.$e->getMessage());
        }
    }
}
