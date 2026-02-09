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
        Schema::create('warehouse_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('zone')->nullable();

            // rack, shelf, floor, bin, area, etc.
            $table->string('type');

            $table->decimal('capacity', 15, 2)->default(0);
            $table->decimal('occupancy', 15, 2)->default(0);

            $table->timestamps();

            // Índices útiles
            $table->index('zone');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_locations');
    }
};
