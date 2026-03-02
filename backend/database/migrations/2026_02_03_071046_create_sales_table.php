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
            $table->string('code')->unique();

            $table->foreignId('client_id')->constrained('clients');
            $table->string('client_name')->nullable();

            $table->foreignId('quote_id')
                ->nullable()
                ->constrained('quotes')
                ->onDelete('set null')
                ->unique();
            $table->string('quote_ref')->nullable()->unique();

            $table->unsignedInteger('items')->default(0);

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(16);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->enum('status', [
                'pending',
                'paid',
                'overdue',
                'cancelled'
            ])->default('pending');
            // Nuevo campo para tipo de pago
            $table->enum('payment_type', ['cash', 'credit'])->default('cash');
            // Nuevo campo para días de crédito
            $table->integer('credit_days')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('client_id');
            $table->index('quote_id');
            $table->index('status');
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

