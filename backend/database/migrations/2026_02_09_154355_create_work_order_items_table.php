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
        Schema::create('work_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')
            ->constrained()
            ->restrictOnDelete();

            // Snapshot del producto (NO dependes del catálogo)
            $table->string('product_name');
            $table->unsignedDecimal('width', 8, 2);
            $table->unsignedDecimal('height', 8, 2);
            $table->unsignedDecimal('depth', 8, 2);

            $table->unsignedInteger('quantity');

            $table->timestamps();

            $table->index('work_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_items');
    }
};
