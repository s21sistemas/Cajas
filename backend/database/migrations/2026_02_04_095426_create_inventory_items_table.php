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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');

            $table->string('category');

            $table->decimal('quantity', 15, 2)->default(0);
            $table->decimal('min_stock', 15, 2)->default(0);
            $table->decimal('max_stock', 15, 2)->nullable();

            $table->decimal('unit_cost', 15, 2);
            $table->string('unit')->nullable();
            $table->string('warehouse', 100)->nullable();

            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations');

            $table->timestamp('last_movement')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('category');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
