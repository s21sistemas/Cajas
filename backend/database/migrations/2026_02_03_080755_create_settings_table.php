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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            // company, production, notifications, system, hr, finance, etc.
            $table->string('module');

            // name, rfc, overtimeMultiplier, timezone, etc.
            $table->string('key');

            // valor flexible
            $table->json('value')->nullable();

            $table->timestamps();

            $table->unique(['module', 'key']);
            $table->index('module');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
