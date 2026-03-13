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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->enum('type_vehicle', ['car', 'motorcycle']);
            $table->string('brand', 50);
            $table->string('model', 15);
            $table->string('color', 15)->nullable();
            $table->string('license_plate', 20)->unique();
            $table->enum('status', ['Available', 'Assigned', 'Under repair', 'Out of service', 'Accident', 'Stolen', 'Sold'])->default('Available');

            $table->text('vehicle_photos')->nullable();
            $table->enum('labeled', ['YES', 'NO'])->nullable();
            $table->enum('gps', ['YES', 'NO'])->nullable();
            $table->enum('taxes_paid', ['YES', 'NO'])->nullable();

            $table->string('insurance_company', 50)->nullable();
            $table->string('insurance_company_phone', 15)->nullable();
            $table->string('insurance_file')->nullable();
            $table->string('policy_number')->nullable();
            $table->date('expiration_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
