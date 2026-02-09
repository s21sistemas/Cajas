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
        Schema::create('vacation_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees');
            $table->string('employee_name');
            $table->string('department');

            $table->date('start_date');
            $table->date('end_date');

            $table->unsignedInteger('days');
            $table->unsignedInteger('days_available');

            $table->enum('type', [
                'vacation',
                'personal',
                'medical'
            ]);

            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'taken'
            ])->default('pending');

            $table->text('reason')->nullable();

            $table->string('approved_by')->nullable();

            $table->timestamps();

            // Índices clave
            $table->index('employee_id');
            $table->index('status');
            $table->index('type');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vacation_requests');
    }
};
