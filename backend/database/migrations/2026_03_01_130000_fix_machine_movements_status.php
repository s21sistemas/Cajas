<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Primero necesitamos verificar si la tabla existe y modificar el enum
        Schema::table('machine_movements', function (Blueprint $table) {
            // Eliminar la restricción enum existente y recrear con los nuevos valores
            $table->enum('status', ['active', 'in_progress', 'paused', 'completed', 'cancelled'])->change();
        });
    }

    public function down(): void
    {
        Schema::table('machine_movements', function (Blueprint $table) {
            $table->enum('status', ['active', 'paused', 'completed', 'cancelled'])->change();
        });
    }
};
