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
        Schema::create('work_order_processes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_order_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('process_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('machine_id')
                ->nullable()
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('employee_id')
                ->nullable()
                ->constrained()
                ->restrictOnDelete();

            $table->enum('status', ['pending', 'working', 'finished'])
                ->default('pending');

            $table->unsignedInteger('quantity_done')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();

            $table->timestamps();

            $table->index(['work_order_id', 'process_id']);
            $table->index(['machine_id', 'started_at']);
            $table->index(['employee_id', 'started_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_processes');
    }
};
