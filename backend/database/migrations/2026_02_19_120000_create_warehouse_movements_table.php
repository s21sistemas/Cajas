<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabla para movimientos de almacén (ingresos y egresos)
     */
    public function up(): void
    {
        Schema::create('warehouse_movements', function (Blueprint $table) {
            $table->id();
            
            // Referencia al item del inventario
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->cascadeOnDelete();
            
            // Tipo de movimiento
            $table->enum('movement_type', [
                'income',      // Ingreso al almacén
                'expense',    // Egreso del almacén
                'adjustment', // Ajuste de inventario
                'transfer'    // Transferencia entre ubicaciones
            ]);
            
            // Cantidad
            $table->decimal('quantity', 15, 3);
            
            // Cantidad antes y después del movimiento
            $table->decimal('quantity_before', 15, 3)->default(0);
            $table->decimal('quantity_after', 15, 3)->default(0);
            
            // Ubicación origen y destino (para transferencias)
            $table->foreignId('warehouse_location_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            $table->foreignId('warehouse_location_to_id')->nullable()->constrained('warehouse_locations')->nullOnDelete();
            
            // Referencia externa (orden de compra, orden de producción, etc.)
            $table->string('reference_type')->nullable(); // purchase_order, work_order, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            
            // Datos adicionales
            $table->text('notes')->nullable();
            $table->string('performed_by')->nullable(); // Usuario que realizó el movimiento
            
            // Estado
            $table->enum('status', [
                'pending',
                'completed',
                'cancelled'
            ])->default('completed');
            
            $table->timestamps();
            
            // Índices
            $table->index(['inventory_item_id', 'movement_type']);
            $table->index(['movement_type', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_movements');
    }
};
