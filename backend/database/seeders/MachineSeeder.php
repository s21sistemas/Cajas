<?php

namespace Database\Seeders;

use App\Models\Machine;
use Illuminate\Database\Seeder;

class MachineSeeder extends Seeder
{
    /**
     * Seed the machines table.
     */
    public function run(): void
    {
        $machines = [
            [
                'code' => 'MAQ-001',
                'name' => 'Cortadora de papel industrial',
                'type' => 'corte',
                'axes' => 0,
                'brand' => 'Heidelberg',
                'model' => 'Speedmaster',
                'location' => 'Área de Corte A',
                'status' => 'available',
                'notes' => 'Mantenimiento preventivo cada 6 meses',
            ],
            [
                'code' => 'MAQ-002',
                'name' => 'Troqueladora plana',
                'type' => 'troquelado',
                'axes' => 0,
                'brand' => 'Bobst',
                'model' => 'Novacut 106',
                'location' => 'Área de Troquelado',
                'status' => 'available',
                'notes' => 'Capacidad hasta 1200 dpi',
            ],
            [
                'code' => 'MAQ-003',
                'name' => 'Impresora flexográfica',
                'type' => 'impresion',
                'axes' => 0,
                'brand' => 'Windmöller',
                'model' => 'Evolution 12',
                'location' => 'Área de Impresión',
                'status' => 'available',
                'notes' => '6 colores + barniz',
            ],
            [
                'code' => 'MAQ-004',
                'name' => 'Refiladora de esquinas',
                'type' => 'acabado',
                'axes' => 0,
                'brand' => 'Horizon',
                'model' => 'PC-200',
                'location' => 'Área de Acabados',
                'status' => 'available',
                'notes' => 'Velocidad: 5000 piezas/hora',
            ],
            [
                'code' => 'MAQ-005',
                'name' => 'Engrapadora industrial',
                'type' => 'ensamble',
                'axes' => 0,
                'brand' => 'Jet',
                'model' => 'J-500',
                'location' => 'Línea de Ensamble 1',
                'status' => 'available',
                'notes' => 'Para cajas de tamaño mediano',
            ],
            [
                'code' => 'MAQ-006',
                'name' => 'Pegadora automática',
                'type' => 'ensamble',
                'axes' => 0,
                'brand' => 'Boschert',
                'model' => 'Delta 2000',
                'location' => 'Línea de Ensamble 2',
                'status' => 'available',
                'notes' => 'En mantenimiento preventivo',
            ],
            [
                'code' => 'MAQ-007',
                'name' => 'Cortadora CNC',
                'type' => 'corte',
                'axes' => 3,
                'brand' => 'Biesse',
                'model' => 'Rover A',
                'location' => 'Área de Corte B',
                'status' => 'available',
                'notes' => 'Precisión de 0.1mm',
            ],
            [
                'code' => 'MAQ-008',
                'name' => 'Empaquetadora automática',
                'type' => 'empaque',
                'axes' => 0,
                'brand' => 'Smipack',
                'model' => 'FX 560',
                'location' => 'Área de Empaque',
                'status' => 'available',
                'notes' => 'Sellado por calor',
            ],
            [
                'code' => 'MAQ-009',
                'name' => 'Máquina de pegado en frío',
                'type' => 'ensamble',
                'axes' => 0,
                'brand' => 'Nordson',
                'model' => 'ProBlue',
                'location' => 'Línea de Ensamble 1',
                'status' => 'available',
                'notes' => 'Aplicador de hot melt',
            ],
            [
                'code' => 'MAQ-010',
                'name' => 'Dobladora de cartón',
                'type' => 'plegado',
                'axes' => 0,
                'brand' => 'Muller Martini',
                'model' => 'Presto',
                'location' => 'Área de Plegado',
                'status' => 'available',
                'notes' => 'Para dobleces precisos de 90°',
            ],
        ];

        foreach ($machines as $machine) {
            Machine::firstOrCreate(
                ['code' => $machine['code']],
                $machine
            );
        }
    }
}
