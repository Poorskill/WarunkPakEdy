<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function index(): Response
    {
        $settings = [
            'store_name' => Setting::get('store_name', 'WarunkPakEdy'),
            'store_phone' => Setting::get('store_phone', '0812-3456-7890'),
            'store_address' => Setting::get('store_address', 'Jl. Gunandar, RT.02/RW.2, Jenar, Kedungjenar, Kec. Blora, Kabupaten Blora, Jawa Tengah 58217'),
            'receipt_footer' => Setting::get('receipt_footer', 'Terima kasih atas kunjungan Anda!'),
        ];

        return Inertia::render('settings/store', [
            'settings' => $settings,
        ]);
    }

    public function update(StoreSettingRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        return redirect()->back()->with('success', 'Pengaturan toko dan struk berhasil diperbarui.');
    }
}
