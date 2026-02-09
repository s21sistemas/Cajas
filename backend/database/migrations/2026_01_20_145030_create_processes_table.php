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
        Schema::create('processes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained()->cascadeOnDelete();
            $table->foreignId('machine_id')->constrained()->restrictOnDelete();
            $table->string('process_type');
            $table->string('description')->nullable();
            $table->unsignedInteger('sequence');
            $table->decimal('estimated_time_min', 6, 2)->nullable();
            $table->string('status')->default('pending');
            $table->integer('order_index')->nullable();
            $table->timestamps();

            $table->unique(['part_id', 'sequence']);
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processes');
    }
};
