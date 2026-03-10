<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('sale_id')->constrained('sales')->onDelete('cascade');
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->nullable();
            $table->foreignId('account_statement_id')->constrained('account_statements')->nullable();
            $table->foreignId('supplier_statement_id')->constrained('supplier_statements')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable(); // Transferencia, Cheque, Efectivo
            $table->string('reference')->nullable(); // Número de referencia del pago
            $table->text('notes')->nullable();
            $table->date('payment_date');
            $table->string('status')->default('completed'); // pending, completed, cancelled
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
