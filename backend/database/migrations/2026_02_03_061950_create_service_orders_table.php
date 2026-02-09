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
        Schema::create('service_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->index();

            $table->foreignId('client_id')->constrained('clients');
            $table->string('client_name');

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('type', [
                'repair',
                'maintenance',
                'installation',
                'consultation'
            ])->index();

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'urgent'
            ])->default('medium');

            $table->enum('status', [
                'pending',
                'scheduled',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('pending')->index();

            $table->string('assigned_to')->nullable();

            // horas
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->nullable();

            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();

            $table->decimal('cost', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_orders');
    }
};
