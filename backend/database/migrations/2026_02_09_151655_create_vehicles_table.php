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
            $table->enum('tipe_vehicle', ['car', 'motorciclet']);
            $table->string('brand', 50);
            $table->string('model', 15);
            $table->string('color', 15);
            $table->string('license_plate', 20)->unique();
            $table->enum('status', ['Available', 'Assigned', 'Under repair', 'Out of service', 'Accident', 'Stolen', 'Sold'])->default('Available');

            $table->text('vehicle_photos');
            $table->enum('labeled', ['YES', 'NO']);
            $table->enum('gps', ['YES', 'NO']);
            $table->enum('taxes_paid', ['YES', 'NO']);

            $table->string('aseguradora', 50);
            $table->string('telefono_aseguradora', 15);
            $table->string('archivo_seguro');
            $table->string('numero_poliza');
            $table->date('fecha_vencimiento');
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
