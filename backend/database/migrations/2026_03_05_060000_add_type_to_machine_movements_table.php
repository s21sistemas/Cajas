<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('machine_movements', function (Blueprint $table) {
            $table->enum('type', ['creation', 'update', 'status_change', 'operation_start', 'operation_stop', 'maintenance', 'deletion'])->nullable()->after('machine_id');
        });
    }

    public function down(): void
    {
        Schema::table('machine_movements', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
