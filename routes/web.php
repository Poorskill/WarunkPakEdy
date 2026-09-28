<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ReturnController;
use App\Http\Controllers\SaleHistoryController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::get('demo-login/{role}', function (string $role) {
    if (! in_array($role, ['owner', 'admin', 'cashier'])) {
        return redirect()->route('login');
    }

    $user = User::where('role', $role)->first();
    if (! $user) {
        return redirect()->route('login');
    }

    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();

    auth()->login($user, true);
    request()->session()->regenerate();

    if ($user->isCashier()) {
        return redirect()->route('pos.index');
    }

    return redirect()->route('dashboard');
})->name('demo.login');

Route::get('storage/{path}', function (string $path) {
    $disk = \Illuminate\Support\Facades\Storage::disk('public');
    if (! $disk->exists($path)) {
        abort(404);
    }

    return $disk->response($path);
})->where('path', '.*')->name('storage.local');

// Indonesian URL aliases
Route::redirect('admin', '/dashboard');
Route::redirect('kasir', '/pos');
Route::redirect('stok', '/inventory');
Route::redirect('produk', '/products');
Route::redirect('kategori', '/categories');
Route::redirect('pembelian', '/purchases');
Route::redirect('penjualan', '/sales');
Route::redirect('retur', '/returns');
Route::redirect('pelanggan', '/customers');
Route::redirect('supplier', '/suppliers');
Route::redirect('pengguna', '/users');
Route::redirect('pengaturan', '/settings/store');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // POS Kasir, Transaksi, Retur, & Pelanggan
    Route::get('pos', [PosController::class, 'index'])->name('pos.index');
    Route::get('pos/member/search', [PosController::class, 'searchMember'])->name('pos.member.search');
    Route::post('pos/member/register', [PosController::class, 'registerMember'])->name('pos.member.register');
    Route::post('pos/checkout', [PosController::class, 'checkout'])->name('pos.checkout');

    Route::get('sales', [SaleHistoryController::class, 'index'])->name('sales.index');
    Route::get('sales/{sale}', [SaleHistoryController::class, 'show'])->name('sales.show');
    Route::resource('returns', ReturnController::class)->only(['index', 'create', 'store', 'show']);

    Route::get('customers/{customer}/point-history', [CustomerController::class, 'pointHistory'])->name('customers.point-history');
    Route::resource('customers', CustomerController::class)->except(['create', 'show', 'edit']);

    // Admin & Owner restricted: Produk, Stok, Pembelian, Laporan, Pengguna, Pengaturan
    Route::middleware(['role:owner,admin'])->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'show', 'edit']);
        Route::resource('products', ProductController::class);
        Route::resource('suppliers', SupplierController::class)->except(['create', 'show', 'edit']);

        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory/adjust', [InventoryController::class, 'adjustStock'])->name('inventory.adjust');
        Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements');
        Route::resource('stock-opnames', StockOpnameController::class)->only(['index', 'create', 'store', 'show']);

        Route::resource('purchases', PurchaseController::class)->only(['index', 'create', 'store', 'show']);
        Route::post('purchases/{purchase}/complete', [PurchaseController::class, 'complete'])->name('purchases.complete');
        Route::post('purchases/{purchase}/cancel', [PurchaseController::class, 'cancel'])->name('purchases.cancel');

        Route::get('reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('reports/stock', [ReportController::class, 'stock'])->name('reports.stock');
        Route::get('reports/profit', [ReportController::class, 'profit'])->name('reports.profit');

        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::get('settings/store', [StoreSettingController::class, 'index'])->name('settings.store');
        Route::put('settings/store', [StoreSettingController::class, 'update'])->name('settings.store.update');
    });
});

require __DIR__.'/settings.php';
