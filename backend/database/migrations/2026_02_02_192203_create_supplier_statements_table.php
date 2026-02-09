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
        Schema::create('supplier_statements', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number');

            $table->foreignId('supplier_id')->constrained('suppliers');
            $table->string('supplier_name');

            $table->date('date');
            $table->date('due_date');

            $table->decimal('amount', 15, 2);
            $table->decimal('paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);

            $table->enum('status', [
                'paid',
                'pending',
                'overdue',
                'partial'
            ])->default('pending');

            $table->string('concept');

            $table->timestamps();

            // Índices útiles
            $table->index('supplier_id');
            $table->index('invoice_number');
            $table->index('status');
            $table->index('due_date');
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_statements');
    }
};
