<?php

namespace Database\Seeders;

use App\Models\WarehouseLocation;
use Illuminate\Database\Seeder;

class WarehouseLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            // Zona A - Materias Primas
            [
                'name' => 'A-01-01',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 1000,
                'occupancy' => 0,
            ],
            [
                'name' => 'A-01-02',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 1000,
                'occupancy' => 0,
            ],
            [
                'name' => 'A-02-01',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 1000,
                'occupancy' => 0,
            ],
            [
                'name' => 'A-02-02',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 1000,
                'occupancy' => 0,
            ],
            [
                'name' => 'A-03-01',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 1000,
                'occupancy' => 0,
            ],
            // Zona B - Materiales en Proceso
            [
                'name' => 'B-01-01',
                'zone' => 'B',
                'type' => 'rack',
                'capacity' => 800,
                'occupancy' => 0,
            ],
            [
                'name' => 'B-01-02',
                'zone' => 'B',
                'type' => 'rack',
                'capacity' => 800,
                'occupancy' => 0,
            ],
            [
                'name' => 'B-02-01',
                'zone' => 'B',
                'type' => 'rack',
                'capacity' => 800,
                'occupancy' => 0,
            ],
            // Zona C - Productos Terminados
            [
                'name' => 'C-01-01',
                'zone' => 'C',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 0,
            ],
            [
                'name' => 'C-01-02',
                'zone' => 'C',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 0,
            ],
            [
                'name' => 'C-02-01',
                'zone' => 'C',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 0,
            ],
            [
                'name' => 'C-02-02',
                'zone' => 'C',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 0,
            ],
            // Zona D - Embalaje
            [
                'name' => 'D-01-01',
                'zone' => 'D',
                'type' => 'shelf',
                'capacity' => 300,
                'occupancy' => 0,
            ],
            [
                'name' => 'D-01-02',
                'zone' => 'D',
                'type' => 'shelf',
                'capacity' => 300,
                'occupancy' => 0,
            ],
            // Zona E - Área de Expedición
            [
                'name' => 'E-01-01',
                'zone' => 'E',
                'type' => 'dock',
                'capacity' => 200,
                'occupancy' => 0,
            ],
            [
                'name' => 'E-01-02',
                'zone' => 'E',
                'type' => 'dock',
                'capacity' => 200,
                'occupancy' => 0,
            ],
            // Zona P - Picking
            [
                'name' => 'P-01',
                'zone' => 'P',
                'type' => 'cart',
                'capacity' => 100,
                'occupancy' => 0,
            ],
            [
                'name' => 'P-02',
                'zone' => 'P',
                'type' => 'cart',
                'capacity' => 100,
                'occupancy' => 0,
            ],
            [
                'name' => 'P-03',
                'zone' => 'P',
                'type' => 'cart',
                'capacity' => 100,
                'occupancy' => 0,
            ],
            // Zona R - Retornos
            [
                'name' => 'R-01',
                'zone' => 'R',
                'type' => 'area',
                'capacity' => 150,
                'occupancy' => 0,
            ],
        ];

        foreach ($locations as $location) {
            WarehouseLocation::firstOrCreate(
                ['name' => $location['name']],
                $location
            );
        }

        $this->command->info('Created ' . count($locations) . ' warehouse locations.');
    }
}
