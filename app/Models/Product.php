<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'sku',
        'barcode',
        'name',
        'description',
        'purchase_price',
        'selling_price',
        'stock',
        'minimum_stock',
        'unit',
        'image_path',
        'is_active',
    ];

    protected $appends = [
        'image_url',
    ];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if (! $this->image_path) {
                    return null;
                }

                if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
                    return $this->image_path;
                }

                return Storage::disk('public')->url($this->image_path);
            },
        );
    }

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'stock' => 'decimal:3',
            'minimum_stock' => 'decimal:3',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function stockOpnameItems(): HasMany
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    public function returnItems(): HasMany
    {
        return $this->hasMany(ReturnItem::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock > 0 && $this->stock <= $this->minimum_stock;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock <= 0;
    }

    public function stockStatus(): string
    {
        if ($this->isOutOfStock()) {
            return 'habis';
        }

        if ($this->isLowStock()) {
            return 'menipis';
        }

        return 'normal';
    }
}
