<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ProductSeeder::class,
            MachineSeeder::class,
            // ProcessSeeder::class,
            OperatorSeeder::class,
            ClientSeeder::class,
            SupplierSeeder::class,
            EmployeeSeeder::class,
            // InventoryItemSeeder::class,
            // WarehouseLocationSeeder::class,
        ]);
    }
}
