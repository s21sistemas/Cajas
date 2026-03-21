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
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->string('employee_name');

            $table->string('department');

            $table->string('type');

            $table->string('description')->nullable();

            $table->decimal('amount', 15, 2);

            $table->string('period'); // weekly, biweekly, monthly, custom

            $table->enum('status', [
                'active',
                'completed',
                'paused'
            ])->default('active');

            $table->date('start_date');
            $table->date('end_date')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('employee_id');
            $table->index('type');
            $table->index('status');
            $table->index('start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
