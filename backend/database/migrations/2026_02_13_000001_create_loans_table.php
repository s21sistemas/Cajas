<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('loan_type_id')->nullable()->constrained('loan_types')->onDelete('set null');
            $table->string('code')->unique();
            $table->string('type')->comment('personal, emergency, advance');
            $table->decimal('amount', 12, 2);
            $table->decimal('paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2);
            $table->integer('installments')->default(1);
            $table->integer('paid_installments')->default(0);
            $table->decimal('installment_amount', 12, 2);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('pending');
            $table->text('reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
