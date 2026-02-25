<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('material_id')->nullable()->constrained('materials')->nullOnDelete();
            $table->string('material_name')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 14, 2)->default(0);
            $table->enum('payment_type', ['cash', 'credit'])->default('cash');
            $table->integer('credit_days')->default(0);
            $table->date('due_date')->nullable()->after('expected_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropForeign(['material_id']);
            $table->dropColumn([
                'material_id',
                'material_name',
                'quantity',
                'unit_price',
                'payment_type',
                'credit_days',
                'due_date',
            ]);
        });
    }
};
