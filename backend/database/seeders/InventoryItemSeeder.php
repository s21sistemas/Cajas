<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use Illuminate\Database\Seeder;

class InventoryItemSeeder extends Seeder
{
    /**
     * Seed the inventory_items table.
     */
    public function run(): void
    {
        $items = [
            // Materias primas
            [
                'code' => 'MAT-001',
                'name' => 'Cartón corrugado doble pared 2mm',
                'category' => 'raw_material',
                'warehouse' => 'Almacén A',
                'quantity' => 2500,
                'min_stock' => 500,
                'max_stock' => 5000,
                'unit_cost' => 12.50,
                'unit' => 'm2',
                'location' => 'A-01-01',
                'last_movement' => now(),
            ],
            [
                'code' => 'MAT-002',
                'name' => 'Cartón corrugado triple pared 4mm',
                'category' => 'raw_material',
                'warehouse' => 'Almacén A',
                'quantity' => 1200,
                'min_stock' => 200,
                'max_stock' => 3000,
                'unit_cost' => 18.00,
                'unit' => 'm2',
                'location' => 'A-01-02',
                'last_movement' => now(),
            ],
            [
                'code' => 'MAT-003',
                'name' => 'Cartón folding 300g/m2',
                'category' => 'raw_material',
                'warehouse' => 'Almacén A',
                'quantity' => 5000,
                'min_stock' => 1000,
                'max_stock' => 10000,
                'unit_cost' => 8.50,
                'unit' => 'm2',
                'location' => 'A-01-03',
                'last_movement' => now(),
            ],
            // Insumos
            [
                'code' => 'INS-001',
                'name' => 'Tinta negra flexográfica',
                'category' => 'consumable',
                'warehouse' => 'Almacén B',
                'quantity' => 50,
                'min_stock' => 10,
                'max_stock' => 100,
                'unit_cost' => 450.00,
                'unit' => 'litro',
                'location' => 'B-02-01',
                'last_movement' => now(),
            ],
            [
                'code' => 'INS-002',
                'name' => 'Tinta cian flexográfica',
                'category' => 'consumable',
                'warehouse' => 'Almacén B',
                'quantity' => 30,
                'min_stock' => 10,
                'max_stock' => 80,
                'unit_cost' => 480.00,
                'unit' => 'litro',
                'location' => 'B-02-02',
                'last_movement' => now(),
            ],
            [
                'code' => 'INS-003',
                'name' => 'Tinta magenta flexográfica',
                'category' => 'consumable',
                'warehouse' => 'Almacén B',
                'quantity' => 35,
                'min_stock' => 10,
                'max_stock' => 80,
                'unit_cost' => 480.00,
                'unit' => 'litro',
                'location' => 'B-02-03',
                'last_movement' => now(),
            ],
            [
                'code' => 'INS-004',
                'name' => 'Pegamento hot melt granulado',
                'category' => 'consumable',
                'warehouse' => 'Almacén B',
                'quantity' => 200,
                'min_stock' => 50,
                'max_stock' => 500,
                'unit_cost' => 85.00,
                'unit' => 'kg',
                'location' => 'B-03-01',
                'last_movement' => now(),
            ],
            [
                'code' => 'INS-005',
                'name' => 'Cinta de empaque 48mm',
                'category' => 'consumable',
                'warehouse' => 'Almacén B',
                'quantity' => 150,
                'min_stock' => 30,
                'max_stock' => 300,
                'unit_cost' => 35.00,
                'unit' => 'rollo',
                'location' => 'B-04-01',
                'last_movement' => now(),
            ],
            // Herramientas
            [
                'code' => 'HER-001',
                'name' => 'Cuchillas de repuesto para troquel',
                'category' => 'tool',
                'warehouse' => 'Almacén C',
                'quantity' => 20,
                'min_stock' => 5,
                'max_stock' => 50,
                'unit_cost' => 250.00,
                'unit' => 'pieza',
                'location' => 'C-01-01',
                'last_movement' => now(),
            ],
            [
                'code' => 'HER-002',
                'name' => 'Reglas de presión',
                'category' => 'tool',
                'warehouse' => 'Almacén C',
                'quantity' => 10,
                'min_stock' => 3,
                'max_stock' => 20,
                'unit_cost' => 180.00,
                'unit' => 'pieza',
                'location' => 'C-01-02',
                'last_movement' => now(),
            ],
            // Componentes
            [
                'code' => 'COMP-001',
                'name' => 'Ventana de plástico PVC',
                'category' => 'component',
                'warehouse' => 'Almacén A',
                'quantity' => 5000,
                'min_stock' => 1000,
                'max_stock' => 10000,
                'unit_cost' => 2.50,
                'unit' => 'pieza',
                'location' => 'A-02-01',
                'last_movement' => now(),
            ],
            [
                'code' => 'COMP-002',
                'name' => 'Divisores de cartón',
                'category' => 'component',
                'warehouse' => 'Almacén A',
                'quantity' => 2000,
                'min_stock' => 500,
                'max_stock' => 5000,
                'unit_cost' => 1.80,
                'unit' => 'pieza',
                'location' => 'A-02-02',
                'last_movement' => now(),
            ],
        ];

        foreach ($items as $item) {
            InventoryItem::firstOrCreate(
                ['code' => $item['code']],
                $item
            );
        }
    }
}
