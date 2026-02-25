<?php

namespace Database\Seeders;

use App\Models\Machine;
use App\Models\Process;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProcessSeeder extends Seeder
{
    /**
     * Seed the processes table.
     */
    public function run(): void
    {
        $machines = Machine::pluck('id', 'code')->toArray();
        $products = Product::pluck('id', 'code')->toArray();

        $processes = [
            // Procesos para Caja Estándar (CAJ-001)
            [
                'code' => 'PROC-001',
                'name' => 'Corte de cartón',
                'process_type' => 'corte',
                'description' => 'Corte de hojas de cartón según medidas',
                'requires_machine' => true,
                'sequence' => 1,
                'estimated_time_min' => 5,
                'status' => 'active',
                'order_index' => 1,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => $machines['MAQ-001'] ?? null,
            ],
            [
                'code' => 'PROC-002',
                'name' => 'Impresión de diseño',
                'process_type' => 'impresion',
                'description' => 'Impresión del diseño solicitado',
                'requires_machine' => true,
                'sequence' => 2,
                'estimated_time_min' => 8,
                'status' => 'active',
                'order_index' => 2,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => $machines['MAQ-003'] ?? null,
            ],
            [
                'code' => 'PROC-003',
                'name' => 'Troquelado',
                'process_type' => 'troquelado',
                'description' => 'Corte y troquelado de la caja',
                'requires_machine' => true,
                'sequence' => 3,
                'estimated_time_min' => 10,
                'status' => 'active',
                'order_index' => 3,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => $machines['MAQ-002'] ?? null,
            ],
            [
                'code' => 'PROC-004',
                'name' => 'Plegado',
                'process_type' => 'plegado',
                'description' => 'Plegado de las líneas de la caja',
                'requires_machine' => false,
                'sequence' => 4,
                'estimated_time_min' => 3,
                'status' => 'active',
                'order_index' => 4,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => null,
            ],
            [
                'code' => 'PROC-005',
                'name' => 'Ensamblado',
                'process_type' => 'ensamble',
                'description' => 'Ensamblado final de la caja',
                'requires_machine' => false,
                'sequence' => 5,
                'estimated_time_min' => 4,
                'status' => 'active',
                'order_index' => 5,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => null,
            ],
            [
                'code' => 'PROC-006',
                'name' => 'Empaque',
                'process_type' => 'empaque',
                'description' => 'Empaque en cajas master',
                'requires_machine' => true,
                'sequence' => 6,
                'estimated_time_min' => 2,
                'status' => 'active',
                'order_index' => 6,
                'product_id' => $products['CAJ-001'] ?? null,
                'machine_id' => $machines['MAQ-008'] ?? null,
            ],

            // Procesos para Caja Troquelada (CAJ-006)
            [
                'code' => 'PROC-007',
                'name' => 'Troquelado automático',
                'process_type' => 'troquelado',
                'description' => 'Troquelado con autocierre',
                'requires_machine' => true,
                'sequence' => 1,
                'estimated_time_min' => 6,
                'status' => 'active',
                'order_index' => 1,
                'product_id' => $products['CAJ-006'] ?? null,
                'machine_id' => $machines['MAQ-002'] ?? null,
            ],
            [
                'code' => 'PROC-008',
                'name' => 'Refile de esquinas',
                'process_type' => 'acabado',
                'description' => 'Refile de esquinas redondeadas',
                'requires_machine' => true,
                'sequence' => 2,
                'estimated_time_min' => 3,
                'status' => 'active',
                'order_index' => 2,
                'product_id' => $products['CAJ-006'] ?? null,
                'machine_id' => $machines['MAQ-004'] ?? null,
            ],
            [
                'code' => 'PROC-009',
                'name' => 'Pegado de autocierre',
                'process_type' => 'ensamble',
                'description' => 'Aplicación de pegamento para autocierre',
                'requires_machine' => true,
                'sequence' => 3,
                'estimated_time_min' => 4,
                'status' => 'active',
                'order_index' => 3,
                'product_id' => $products['CAJ-006'] ?? null,
                'machine_id' => $machines['MAQ-006'] ?? null,
            ],
            [
                'code' => 'PROC-010',
                'name' => 'Empaque final',
                'process_type' => 'empaque',
                'description' => 'Empaque en bundles',
                'requires_machine' => true,
                'sequence' => 4,
                'estimated_time_min' => 2,
                'status' => 'active',
                'order_index' => 4,
                'product_id' => $products['CAJ-006'] ?? null,
                'machine_id' => $machines['MAQ-008'] ?? null,
            ],

            // Procesos generales
            [
                'code' => 'PROC-011',
                'name' => 'Control de calidad',
                'process_type' => 'control-calidad',
                'description' => 'Inspección visual y dimensional',
                'requires_machine' => false,
                'sequence' => 99,
                'estimated_time_min' => 2,
                'status' => 'active',
                'order_index' => 99,
                'product_id' => null,
                'machine_id' => null,
            ],
            [
                'code' => 'PROC-012',
                'name' => 'Almacenamiento',
                'process_type' => 'almacenamiento',
                'description' => 'Preparación para almacenamiento',
                'requires_machine' => false,
                'sequence' => 100,
                'estimated_time_min' => 1,
                'status' => 'active',
                'order_index' => 100,
                'product_id' => null,
                'machine_id' => null,
            ],
        ];

        foreach ($processes as $process) {
            Process::firstOrCreate(
                ['code' => $process['code']],
                $process
            );
        }
    }
}
