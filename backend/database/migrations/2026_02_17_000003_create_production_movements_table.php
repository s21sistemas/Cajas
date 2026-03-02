<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabla para trazabilidad de todos los eventos en el flujo MES:
     * - Producción registrada
     * - Scrap registrado
     * - ReprocESO realizado
     * - Aprobación de calidad
     */
    public function up(): void
    {
        Schema::create('production_movements', function (Blueprint $table) {
            $table->id();
            
            // Referencia a la orden de trabajo
            $table->unsignedBigInteger('work_order_id')->nullable();
            $table->foreign('work_order_id')
                ->references('id')
                ->on('work_orders')
                ->onDelete('set null');       
            
            // Referencia a la producción (si aplica)
            $table->unsignedBigInteger('production_id')->nullable();
            $table->foreign('production_id')
                ->references('id')
                ->on('productions')
                ->onDelete('set null');
            
            // Referencia a evaluación de calidad (si aplica)
            $table->unsignedBigInteger('quality_evaluation_id')->nullable();
            $table->foreign('quality_evaluation_id')
                ->references('id')
                ->on('quality_evaluations')
                ->onDelete('set null');
            
            // Tipo de movimiento
            $table->enum('movement_type', [
                'PRODUCTION',      // Producción registrada
                'SCRAP',           // Scrap registrado
                'REWORK_INPUT',    // Entrada a reproceso
                'REWORK_OUTPUT',   // Salida de reproceso
                'QUALITY_APPROVED', // Aprobado por calidad
                'QUALITY_SCRAP',   // Scrap por calidad
                'QUALITY_REWORK',  // Reproceso por calidad
                'PROCESS_RELEASED', // Proceso liberado
                'PROCESS_COMPLETED',// Proceso completado
            ]);
            
            // Cantidades
            $table->integer('quantity')->default(0);
            $table->integer('quantity_before')->default(0)->nullable();
            $table->integer('quantity_after')->default(0)->nullable();
            
            // Proceso origen/destino para trazabilidad
            $table->unsignedBigInteger('source_process_id')->nullable();
            $table->unsignedBigInteger('destination_process_id')->nullable();
            
            // Usuario que realizó la acción
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
            
            // Descripción del movimiento
            $table->text('description')->nullable();
            
            // Metadata adicional en JSON
            $table->json('metadata')->nullable();
            
            // Timestamps
            $table->timestamp('movement_date')->useCurrent();
            $table->timestamps();
            
            // Índices para búsquedas
            $table->index(['work_order_id', 'movement_type']);
            $table->index(['production_id', 'movement_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_movements');
    }
};
