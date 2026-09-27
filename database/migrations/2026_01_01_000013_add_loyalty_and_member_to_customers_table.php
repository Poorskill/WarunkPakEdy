<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('customers', 'is_member')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->boolean('is_member')->default(true)->after('phone');
                $table->integer('loyalty_points')->default(0)->after('is_member');
                $table->decimal('total_spending', 15, 2)->default(0)->after('loyalty_points');
                $table->integer('total_transactions')->default(0)->after('total_spending');
                $table->decimal('member_discount_percent', 5, 2)->default(5.00)->after('total_transactions');
                $table->timestamp('joined_at')->nullable()->after('member_discount_percent');
            });
        }

        if (! Schema::hasTable('loyalty_point_histories')) {
            Schema::create('loyalty_point_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
                $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
                $table->foreignId('return_id')->nullable()->constrained('returns')->nullOnDelete();
                $table->string('type', 30); // earned, redeemed, return_reversal, adjustment
                $table->integer('points'); // positive or negative
                $table->integer('balance_after');
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index(['customer_id', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_point_histories');

        if (Schema::hasColumn('customers', 'is_member')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->dropColumn([
                    'is_member',
                    'loyalty_points',
                    'total_spending',
                    'total_transactions',
                    'member_discount_percent',
                    'joined_at',
                ]);
            });
        }
    }
};
