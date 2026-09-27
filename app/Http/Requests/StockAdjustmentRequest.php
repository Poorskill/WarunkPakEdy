<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'type' => ['required', 'in:addition,subtraction'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'notes' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'notes.required' => 'Alasan penyesuaian stok wajib diisi.',
            'quantity.min' => 'Jumlah penyesuaian harus lebih dari 0.',
        ];
    }
}
