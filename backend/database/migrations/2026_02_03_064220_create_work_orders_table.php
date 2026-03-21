<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabla consolidada de work_orders para órdenes de compra:
     * - Estructura base
     * - Campos de proveedor y producto
     * - Campos de precios (subtotal, iva, total)
     * - Campos de pago (contado/crédito)
     */
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('product_id')->constrained('products');
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            
            // Datos básicos
            $table->string('product_name');

            // Producción / Compra
            $table->integer('quantity')->default(0);
            $table->integer('completed')->default(0);
            $table->unsignedTinyInteger('progress')->default(0);

            // Estados
            $table->enum('status', [
                'draft',
                'pending',
                'approved',
                'ordered',
                'partial',
                'received',
                'paused',
                'progress',
                'completed',
                'cancelled'
            ])->default('draft')->index();

            // Prioridad
            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent'
            ])->default('medium');

            // Fechas
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('end_date')->nullable()->comment('Fecha de finalización');

            // Tiempos
            $table->decimal('estimated_time', 8, 2)->default(0);
            $table->decimal('actual_time', 8, 2)->default(0);

            // Cancelación
            $table->string('cancellation_reason')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
