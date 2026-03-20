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
        Schema::table('clients', function (Blueprint $table) {
            $table->string('password')->nullable()->after('email');
            $table->timestamp('password_set_at')->nullable()->after('password');
            $table->string('approval_token')->nullable()->unique()->after('password_set_at');
            $table->timestamp('approval_token_expires_at')->nullable()->after('approval_token');
            $table->timestamp('approved_at')->nullable()->after('approval_token_expires_at');
            $table->string('approval_document_path')->nullable()->after('approved_at');
            $table->text('approval_notes')->nullable()->after('approval_document_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'password',
                'password_set_at',
                'approval_token',
                'approval_token_expires_at',
                'approved_at',
                'approval_document_path',
                'approval_notes',
            ]);
        });
    }
};
