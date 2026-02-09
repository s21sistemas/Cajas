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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('invoice')->unique();

            $table->foreignId('client_id')->constrained('clients');
            $table->string('client_name');

            $table->string('quote_ref')->nullable();

            $table->unsignedInteger('items')->default(0);

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->decimal('paid', 15, 2)->default(0);

            $table->enum('status', [
                'pending',
                'partial',
                'paid',
                'overdue',
                'cancelled'
            ])->default('pending');

            $table->string('payment_method');

            $table->date('due_date');

            $table->timestamps();

            // Índices útiles
            $table->index('client_id');
            $table->index('status');
            $table->index('due_date');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
