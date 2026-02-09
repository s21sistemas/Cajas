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
        Schema::create('guard_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->string('employee_name');

            $table->string('department');

            $table->date('date');

            $table->enum('shift', [
                'day',
                'night',
                'weekend',
                'holiday'
            ]);

            $table->decimal('hours', 8, 2);
            $table->decimal('rate', 15, 2);
            $table->decimal('amount', 15, 2);

            $table->enum('status', [
                'pending',
                'approved',
                'paid'
            ])->default('pending');

            $table->text('notes')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('employee_id');
            $table->index('date');
            $table->index('shift');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guard_payments');
    }
};
