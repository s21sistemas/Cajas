<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('loans')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->date('date');
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['payroll', 'cash', 'transfer', 'other']);
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'applied', 'cancelled'])->default('applied');
            $table->timestamps();

            $table->index(['loan_id', 'status']);
            $table->index(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_payments');
    }
};
