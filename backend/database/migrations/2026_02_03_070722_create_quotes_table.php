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
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();

            $table->foreignId('client_id')->constrained('clients');
            $table->string('client_name');

            $table->string('title');

            $table->unsignedInteger('items')->default(0);

            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->enum('status', [
                'draft',
                'sent',
                'approved',
                'rejected',
                'expired'
            ])->default('draft');

            $table->date('valid_until');

            $table->string('created_by');

            $table->timestamps();

            // Índices útiles
            $table->index('client_id');
            $table->index('status');
            $table->index('valid_until');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
