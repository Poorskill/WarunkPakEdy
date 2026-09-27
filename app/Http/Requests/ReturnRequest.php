<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sale_id' => ['required', 'exists:sales,id'],
            'reason' => ['required', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sale_item_id' => ['required', 'exists:sale_items,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
        ];
    }

    public function messages(): array
    {
        return [
            'sale_id.required' => 'Faktur penjualan wajib dipilih.',
            'reason.required' => 'Alasan retur barang wajib diisi.',
            'items.required' => 'Minimal harus ada 1 barang yang diretur.',
            'items.*.quantity.min' => 'Jumlah barang yang diretur harus lebih dari 0.',
        ];
    }
}
