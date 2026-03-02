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
        Schema::create('account_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales')->unique();

            $table->foreignId('client_id')->constrained('clients');
            $table->string('client_name');

            $table->date('date');
            $table->date('due_date')->nullable();

            $table->decimal('amount', 14, 2)->default(0);
            $table->decimal('paid', 14, 2)->default(0);
            $table->decimal('balance', 14, 2)->default(0);

            $table->enum('status', [
                'paid',
                'pending',
                'overdue',
                'partial'
            ])->default('pending');

            $table->string('concept');
            $table->timestamps();

            $table->index(['client_id']);
            $table->index(['status']);
            $table->index(['due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_statements');
    }
};
