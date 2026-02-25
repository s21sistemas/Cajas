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
        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

            $table->string('unit')->nullable(); // Unidad
            $table->string('part_number')->nullable(); // Numero de parte

            $table->text('description'); // Descripcion

            $table->decimal('quantity', 12, 2)->default(1);

            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->timestamps();

            $table->index('quote_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_items');
    }
};
