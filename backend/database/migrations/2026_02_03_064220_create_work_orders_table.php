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
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();

            $table->string('product_name');
            $table->string('client_name');

            $table->integer('quantity')->default(0);
            $table->integer('completed')->default(0);

            $table->enum('status', [
                'draft',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('draft')->index();

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent'
            ])->default('medium');

            $table->string('machine')->nullable();
            $table->string('operator')->nullable();

            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();

            // porcentaje 0–100
            $table->unsignedTinyInteger('progress')->default(0);

            // horas
            $table->decimal('estimated_time', 8, 2)->default(0);
            $table->decimal('actual_time', 8, 2)->default(0);

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
