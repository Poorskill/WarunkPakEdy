<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->integer('points_earned')->default(0)->after('notes');
            $table->integer('points_redeemed')->default(0)->after('points_earned');
            $table->decimal('point_discount_amount', 15, 2)->default(0)->after('points_redeemed');
            $table->decimal('member_discount_amount', 15, 2)->default(0)->after('point_discount_amount');
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn([
                'points_earned',
                'points_redeemed',
                'point_discount_amount',
                'member_discount_amount',
            ]);
        });
    }
};
