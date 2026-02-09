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
        Schema::create('gasoline_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->unique()->constrained('vehicles')->onDelete('restrict');
            $table->decimal('mileage', 10, 2);
            $table->decimal('liters', 10, 2);
            $table->decimal('cost_per_liter', 10, 2);
            $table->decimal('total_cost', 10, 2);
            $table->mediumText('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gasoline_receipts');
    }
};
