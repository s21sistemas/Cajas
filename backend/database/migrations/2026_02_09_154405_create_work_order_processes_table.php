<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabla consolidada de work_order_processes:
     * - Estructura base (2026_02_09_154405)
     * - Campos MES (2026_02_17_000001)
     */
    public function up(): void
    {
        Schema::create('work_order_processes', function (Blueprint $table) {
            $table->id();
            
            // Relaciones
            $table->foreignId('work_order_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_process_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('previous_process_id')->nullable();
            $table->foreign('previous_process_id')
                ->references('id')
                ->on('work_order_processes')
                ->onDelete('set null');
            
            // Estado MES
            $table->enum('status', ['PENDING', 'READY', 'RUNNING', 'PAUSED', 'COMPLETED'])
                ->default('PENDING');

            // Cantidades
            $table->unsignedInteger('quantity_done')->default(0);
            $table->unsignedInteger('completed_quantity')->default(0);
            $table->unsignedInteger('scrap_quantity')->default(0);
            $table->unsignedInteger('available_quantity')->default(0);
            $table->unsignedInteger('rework_quantity')->default(0);
            $table->unsignedInteger('planned_quantity')->default(0);

            // Control de reprocesos
            $table->boolean('is_rework_process')->default(false);

            // Fechas
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('paused_at')->nullable();

            // Notas
            $table->text('notes')->nullable();

            $table->timestamps();

            // Índices
            $table->index(['status', 'is_rework_process']);
            $table->index(['work_order_id', 'status']);
            $table->index(['product_process_id', 'status']);
            $table->index(['started_at']);
            $table->index(['planned_quantity']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_processes');
    }
};
