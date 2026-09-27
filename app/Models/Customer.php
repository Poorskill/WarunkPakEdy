<?php

namespace App\Models;

use App\Helpers\PhoneHelper;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'notes',
        'is_member',
        'loyalty_points',
        'total_spending',
        'total_transactions',
        'member_discount_percent',
        'joined_at',
    ];

    protected $appends = [
        'formatted_phone',
    ];

    protected function casts(): array
    {
        return [
            'is_member' => 'boolean',
            'loyalty_points' => 'integer',
            'total_spending' => 'decimal:2',
            'total_transactions' => 'integer',
            'member_discount_percent' => 'decimal:2',
            'joined_at' => 'datetime',
        ];
    }

    protected function formattedPhone(): Attribute
    {
        return Attribute::make(
            get: fn () => PhoneHelper::format($this->phone)
        );
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function loyaltyPointHistories(): HasMany
    {
        return $this->hasMany(LoyaltyPointHistory::class)->orderBy('created_at', 'desc');
    }
}
