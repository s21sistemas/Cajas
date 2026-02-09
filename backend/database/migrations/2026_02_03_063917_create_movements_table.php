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
        Schema::create('movements', function (Blueprint $table) {
            $table->id();
            $table->date('date')->index();

            $table->enum('type', [
                'income',
                'expense',
                'transfer'
            ])->index();

            $table->string('category')->nullable();
            $table->string('description')->nullable();

            $table->string('reference')->nullable();

            $table->foreignId('bank_account_id')->constrained('bank_accounts');

            $table->decimal('amount', 14, 2);

            // balance resultante DESPUÉS del movimiento
            $table->decimal('balance', 14, 2);

            $table->enum('status', [
                'completed',
                'pending',
                'cancelled'
            ])->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
