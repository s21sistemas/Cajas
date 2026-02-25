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

        // 3. Crear catálogo de datos
        // $this->call([
        //     CatalogSeeder::class,
        // ]);

        // // 4. Crear órdenes de trabajo (después de catálogos)
        // $this->call([
        //     WorkOrderSeeder::class,
        // ]);
    }
}
