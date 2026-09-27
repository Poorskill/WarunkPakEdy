<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SaleHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $paymentMethod = $request->input('payment_method', '');
        $date = $request->input('date', '');

        $sales = Sale::with(['customer', 'user', 'payments', 'items'])
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            }))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($paymentMethod, fn ($q) => $q->whereHas('payments', fn ($pq) => $pq->where('payment_method', $paymentMethod)))
            ->when($date, fn ($q) => $q->whereDate('sale_date', $date))
            ->orderBy('sale_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('sales/index', [
            'sales' => $sales,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'date' => $date,
            ],
        ]);
    }

    public function show(Sale $sale): Response
    {
        $sale->load(['customer', 'user', 'payments', 'items.product', 'returns.items']);

        return Inertia::render('sales/show', [
            'sale' => $sale,
        ]);
    }
}
