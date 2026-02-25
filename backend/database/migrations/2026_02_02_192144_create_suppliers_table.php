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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();

            $table->string('name');
            $table->string('rfc', 20)->unique();

            $table->string('email');
            $table->string('phone', 20);

            $table->string('address');
            $table->string('city');
            $table->string('state')->nullable();

            $table->string('contact');

            $table->string('category');

            $table->unsignedInteger('lead_time')->default(0); // days

            $table->unsignedTinyInteger('rating')->default(0); // 0–5

            $table->decimal('balance', 15, 2)->default(0);

            $table->enum('status', [
                'active',
                'inactive',
                'pending'
            ])->default('pending');

            $table->timestamps();

            // Índices útiles
            $table->index('name');
            $table->index('category');
            $table->index('status');
            $table->index('lead_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
