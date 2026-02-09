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
        Schema::create('maintenance_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();

            $table->foreignId('machine_id')->constrained('machines');
            $table->string('machine_name');

            $table->enum('type', [
                'preventive',
                'corrective',
                'predictive',
                'emergency'
            ]);

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'critical'
            ])->default('medium');

            $table->enum('status', [
                'scheduled',
                'in-progress',
                'completed',
                'cancelled'
            ])->default('scheduled');

            $table->text('description')->nullable();

            $table->date('scheduled_date');
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();

            $table->string('technician')->nullable();

            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);

            $table->decimal('estimated_cost', 12, 2)->default(0);
            $table->decimal('actual_cost', 12, 2)->default(0);

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_orders');
    }
};
