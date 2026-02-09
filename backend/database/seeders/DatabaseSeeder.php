<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear permisos del sistema
        $this->call([
            TablePermissionSeeder::class,
        ]);

        // 2. Crear Usuario con rol Super Admin
        $this->call([
            SuperAdminSeeder::class,
        ]);
    }
}
