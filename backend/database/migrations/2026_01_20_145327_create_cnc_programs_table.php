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
        Schema::create('cnc_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_id')->constrained();
            $table->string('name');
            $table->string('gcode_path');
            $table->string('version')->default('1.0');
            $table->boolean('active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['process_id', 'version']);
            $table->index(['process_id', 'active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cnc_programs');
    }
};
