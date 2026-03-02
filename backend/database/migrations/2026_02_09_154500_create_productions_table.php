<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Tabla consolidada de productions:
     * - Estructura base (2026_01_20_150059)
     * - work_order_id agregado (2026_02_14_220000)
     * - Campos MES (2026_02_17_000005)
     */
    public function up(): void
    {
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            
            // Relaciones base
            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();
            $table->foreignId('process_id')
                ->constrained('processes')
                ->restrictOnDelete();
            $table->foreignId('machine_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('operator_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
            $table->foreignId('parent_production_id')->nullable()->constrained('productions');
            
            // Campos de producción
            $table->unsignedInteger('target_parts')->default(0);
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('good_parts')->default(0);
            $table->unsignedInteger('scrap_parts')->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->string('pause_reason')->nullable();
            
            //Calidad
            $table->enum('quality_status', ['PENDING', 'APPROVED', 'SCRAP', 'REWORK'])->default('PENDING');
    
            // Timestamps
            $table->timestamps();
            
            // Índices
            $table->index(['machine_id', 'start_time']);
            $table->index(['operator_id', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
