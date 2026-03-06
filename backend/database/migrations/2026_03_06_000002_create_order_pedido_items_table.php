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
        Schema::create('order_pedido_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_pedido_id')->constrained('order_pedidos')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('inventory_items')->nullOnDelete();
            $table->string('product_name')->nullable();
            $table->string('product_code')->nullable();
            $table->integer('quantity')->default(1);
            $table->string('unit')->nullable();
            $table->timestamps();

            $table->index('order_pedido_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_pedido_items');
    }
};
