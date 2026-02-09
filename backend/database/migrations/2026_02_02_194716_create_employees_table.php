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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');

            $table->string('position');
            $table->string('department');

            $table->string('email')->unique();
            $table->string('phone')->nullable();

            $table->decimal('salary', 15, 2);

            $table->date('hire_date');

            $table->enum('status', [
                'active',
                'inactive',
                'vacation'
            ])->default('active');

            $table->string('avatar')->nullable();

            $table->timestamps();

            // Índices útiles
            $table->index('department');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
