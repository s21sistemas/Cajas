<?php

namespace Database\Seeders;

use App\Models\WarehouseLocation;
use Illuminate\Database\Seeder;

class WarehouseLocationSeeder extends Seeder
{
    /**
     * Seed the warehouse_locations table.
     */
    public function run(): void
    {
        $locations = [
            // Almacén A - Materias Primas
            [
                'name' => 'Pasillo A-01',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 250,
            ],
            [
                'name' => 'Pasillo A-02',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 180,
            ],
            [
                'name' => 'Pasillo A-03',
                'zone' => 'A',
                'type' => 'rack',
                'capacity' => 500,
                'occupancy' => 320,
            ],
            [
                'name' => 'Zona de Descarga A',
                'zone' => 'A',
                'type' => 'docking',
                'capacity' => 100,
                'occupancy' => 20,
            ],
            // Almacén B - Insumos y Herramientas
            [
                'name' => 'Pasillo B-01',
                'zone' => 'B',
                'type' => 'rack',
                'capacity' => 300,
                'occupancy' => 150,
            ],
            [
                'name' => 'Pasillo B-02',
                'zone' => 'B',
                'type' => 'shelf',
                'capacity' => 200,
                'occupancy' => 85,
            ],
            [
                'name' => 'Pasillo B-03',
                'zone' => 'B',
                'type' => 'shelf',
                'capacity' => 200,
                'occupancy' => 120,
            ],
            [
                'name' => 'Zona de Químicos B',
                'zone' => 'B',
                'type' => 'storage',
                'capacity' => 50,
                'occupancy' => 30,
            ],
            // Almacén C - Herramientas y Refacciones
            [
                'name' => 'Pasillo C-01',
                'zone' => 'C',
                'type' => 'cabinet',
                'capacity' => 100,
                'occupancy' => 45,
            ],
            [
                'name' => 'Pasillo C-02',
                'zone' => 'C',
                'type' => 'shelf',
                'capacity' => 150,
                'occupancy' => 60,
            ],
            // Área de Producto Terminado
            [
                'name' => 'Zona PT-01',
                'zone' => 'PT',
                'type' => 'pallet',
                'capacity' => 200,
                'occupancy' => 80,
            ],
            [
                'name' => 'Zona PT-02',
                'zone' => 'PT',
                'type' => 'pallet',
                'capacity' => 200,
                'occupancy' => 120,
            ],
            [
                'name' => 'Zona PT-03',
                'zone' => 'PT',
                'type' => 'pallet',
                'capacity' => 200,
                'occupancy' => 95,
            ],
            // Área de Empaque
            [
                'name' => 'Línea de Empaque 1',
                'zone' => 'EMP',
                'type' => 'workstation',
                'capacity' => 50,
                'occupancy' => 25,
            ],
            [
                'name' => 'Línea de Empaque 2',
                'zone' => 'EMP',
                'type' => 'workstation',
                'capacity' => 50,
                'occupancy' => 30,
            ],
            // Área de Producción
            [
                'name' => 'Zona de Corte',
                'zone' => 'PROD',
                'type' => 'workstation',
                'capacity' => 30,
                'occupancy' => 15,
            ],
            [
                'name' => 'Zona de Impresión',
                'zone' => 'PROD',
                'type' => 'workstation',
                'capacity' => 25,
                'occupancy' => 12,
            ],
            [
                'name' => 'Zona de Troquelado',
                'zone' => 'PROD',
                'type' => 'workstation',
                'capacity' => 30,
                'occupancy' => 18,
            ],
        ];

        foreach ($locations as $location) {
            WarehouseLocation::firstOrCreate(
                ['name' => $location['name']],
                $location
            );
        }
    }
}
