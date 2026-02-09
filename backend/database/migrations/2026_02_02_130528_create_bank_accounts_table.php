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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank');
            $table->string('name');
            $table->string('description')->nullable();

            $table->string('account_number')->nullable();
            $table->string('clabe', 18)->nullable();

            $table->enum('type', ['checking', 'savings', 'credit']);
            $table->enum('currency', ['MXN', 'USD']);

            $table->decimal('balance', 15, 2)->default(0);
            $table->decimal('available_balance', 15, 2)->default(0);

            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active');

            $table->timestamp('last_movement')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
