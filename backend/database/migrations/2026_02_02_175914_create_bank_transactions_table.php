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
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('date');

            $table->string('reference')->nullable();
            $table->string('description');

            $table->enum('type', [
                'income',
                'expense',
                'transfer'
            ]);

            $table->decimal('amount', 15, 2);
            $table->decimal('balance', 15, 2);

            $table->string('bank');

            $table->string('category');

            $table->timestamps();

            // Índices útiles para reportes
            $table->index('date');
            $table->index('type');
            $table->index('bank');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_transactions');
    }
};
