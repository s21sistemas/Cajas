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
        Schema::create('disabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->string('employee_name');

            $table->string('department');

            $table->enum('type', [
                'imss',
                'accident',
                'maternity',
                'illness'
            ]);

            $table->date('start_date');
            $table->date('end_date');

            $table->unsignedInteger('days');

            $table->string('folio')->unique();

            $table->enum('status', [
                'active',
                'completed',
                'pending'
            ])->default('pending');

            $table->text('description')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('employee_id');
            $table->index('type');
            $table->index('status');
            $table->index('start_date');
            $table->index('end_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disabilities');
    }
};
