<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Tabla para evaluaciones de calidad después de producción.
     * Permite 3 decisiones: APROBADO, SCRAP, REPROCESO
     */
    public function up(): void
    {
        Schema::create('quality_evaluations', function (Blueprint $table) {
            $table->id();
            
            // Referencia a la producción evaluada
            $table->unsignedBigInteger('production_id');
            $table->foreign('production_id')
                ->references('id')
                ->on('productions')
                ->onDelete('cascade');
            

            // Cantidad evaluada
            $table->integer('quantity_evaluated')->default(0);
            
            // Decisión de calidad: APPROVED, SCRAP, REWORK
            $table->enum('decision', ['APPROVED', 'SCRAP', 'REWORK'])
                ->nullable();
            
            // Cantidades resultantes
            $table->integer('quantity_approved')->default(0);
            $table->integer('quantity_scrap')->default(0);
            $table->integer('quantity_rework')->default(0);
            
            // Observaciones
            $table->text('observations')->nullable();
            
            // Usuario que evaluó
            $table->unsignedBigInteger('evaluator_id')->nullable();
            $table->foreign('evaluator_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
            
            // Timestamps
            $table->timestamp('evaluated_at')->useCurrent();
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['production_id', 'decision']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quality_evaluations');
    }
};
