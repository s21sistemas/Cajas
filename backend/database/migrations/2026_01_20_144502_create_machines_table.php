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
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type'); // lathe, milling, cnc...
            $table->unsignedTinyInteger('axes')->nullable();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('location')->nullable();
            $table->string('status')->default('available');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
