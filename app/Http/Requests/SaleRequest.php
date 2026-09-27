<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'points_to_redeem' => ['nullable', 'integer', 'min:0'],
            'apply_member_discount' => ['nullable', 'boolean'],
            'payment_method' => ['required', 'in:cash,qris,transfer,ewallet'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang belanja masih kosong.',
            'items.*.quantity.min' => 'Jumlah barang belanja harus lebih dari 0.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
            'amount_paid.required' => 'Nominal uang yang dibayarkan wajib diisi.',
        ];
    }
}
