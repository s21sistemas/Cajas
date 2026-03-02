<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agregar sale_id y client_id a productions para vincular con ventas y clientes
     */
    public function up(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            // Agregar sale_id para vincular con la venta
            $table->foreignId('sale_id')
                ->nullable()
                ->constrained('sales')
                ->nullOnDelete();
            
            // Agregar client_id para vincular directamente con el cliente
            $table->foreignId('client_id')
                ->nullable()
                ->constrained('clients')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            $table->dropForeign(['sale_id']);
            $table->dropForeign(['client_id']);
            $table->dropColumn(['sale_id', 'client_id']);
        });
    }
};
