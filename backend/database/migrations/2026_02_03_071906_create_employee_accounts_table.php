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
        Schema::create('employee_accounts', function (Blueprint $table) {
            $table->id();
            // Relación con empleados
            $table->foreignId('employee_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('employee_name');
            $table->string('department');

            $table->decimal('base_salary', 12, 2)->default(0);
            $table->decimal('loans', 12, 2)->default(0);
            $table->decimal('discounts', 12, 2)->default(0);
            $table->decimal('overtime', 12, 2)->default(0);
            $table->decimal('guards', 12, 2)->default(0);

            // Calculado o persistido (tú decides)
            $table->decimal('net_balance', 12, 2)->default(0);

            $table->timestamps();

            $table->index('employee_id');
            $table->index('department');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_accounts');
    }
};
