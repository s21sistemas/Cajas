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
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('process_id')->constrained()->restrictOnDelete();
            $table->foreignId('machine_id')->constrained()->restrictOnDelete();
            $table->foreignId('operator_id')->constrained()->restrictOnDelete();
            $table->timestamp('start_time');
            $table->timestamp('end_time')->nullable();
            $table->unsignedInteger('good_parts')->default(0);
            $table->unsignedInteger('scrap_parts')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['machine_id', 'start_time']);
            $table->index(['operator_id', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
