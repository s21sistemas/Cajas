<?php

namespace Database\Seeders;

use App\Models\Process;
use App\Models\ProcessType;
use Illuminate\Database\Seeder;

class ProcessSeeder extends Seeder
{
    /**
     * Seed the processes table.
     */
    public function run(): void
    {
        // Primero crear los tipos de proceso si no existen
        $processTypesData = [
            ['name' => 'Corte', 'description' => 'Procesos de corte de materiales'],
            ['name' => 'Impresión', 'description' => 'Procesos de impresión'],
            ['name' => 'Troquelado', 'description' => 'Procesos de troquelado'],
            ['name' => 'Acabado', 'description' => 'Procesos de acabado'],
            ['name' => 'Pegado', 'description' => 'Procesos de pegado'],
            ['name' => 'Plegado', 'description' => 'Procesos de plegado'],
            ['name' => 'Ensamble', 'description' => 'Procesos de ensamble'],
            ['name' => 'Empaque', 'description' => 'Procesos de empaque'],
            ['name' => 'Control de Calidad', 'description' => 'Procesos de control de calidad'],
            ['name' => 'Almacenamiento', 'description' => 'Procesos de almacenamiento'],
        ];

        foreach ($processTypesData as $typeData) {
            ProcessType::firstOrCreate(
                ['name' => $typeData['name']],
                $typeData
            );
        }

        // Obtener los tipos de proceso por nombre
        $processTypes = ProcessType::pluck('id', 'name')->toArray();

        $processes = [
            // Procesos de Corte
            [
                'code' => 'PROC-001',
                'name' => 'Corte de cartón',
                'process_type_id' => $processTypes['Corte'] ?? 1,
                'description' => 'Corte de hojas de cartón según medidas',
                'requires_machine' => true,
                'estimated_time_min' => 5,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-002',
                'name' => 'Corte longitudinal',
                'process_type_id' => $processTypes['Corte'] ?? 1,
                'description' => 'Corte longitudinal de cartón corrugado',
                'requires_machine' => true,
                'estimated_time_min' => 3,
                'status' => 'active',
            ],

            // Procesos de Impresión
            [
                'code' => 'PROC-003',
                'name' => 'Impresión flexográfica',
                'process_type_id' => $processTypes['Impresión'] ?? 2,
                'description' => 'Impresión del diseño solicitado',
                'requires_machine' => true,
                'estimated_time_min' => 8,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-004',
                'name' => 'Impresión litográfica',
                'process_type_id' => $processTypes['Impresión'] ?? 2,
                'description' => 'Impresión de alta calidad',
                'requires_machine' => true,
                'estimated_time_min' => 10,
                'status' => 'active',
            ],

            // Procesos de Troquelado
            [
                'code' => 'PROC-005',
                'name' => 'Troquelado',
                'process_type_id' => $processTypes['Troquelado'] ?? 3,
                'description' => 'Corte y troquelado de la caja',
                'requires_machine' => true,
                'estimated_time_min' => 10,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-006',
                'name' => 'Troquelado automático',
                'process_type_id' => $processTypes['Troquelado'] ?? 3,
                'description' => 'Troquelado con autocierre',
                'requires_machine' => true,
                'estimated_time_min' => 6,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-007',
                'name' => 'Refile de esquinas',
                'process_type_id' => $processTypes['Acabado'] ?? 4,
                'description' => 'Refile de esquinas redondeadas',
                'requires_machine' => true,
                'estimated_time_min' => 3,
                'status' => 'active',
            ],

            // Procesos de Pegado
            [
                'code' => 'PROC-008',
                'name' => 'Pegado automático',
                'process_type_id' => $processTypes['Pegado'] ?? 5,
                'description' => 'Pegado con máquina automática',
                'requires_machine' => true,
                'estimated_time_min' => 4,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-009',
                'name' => 'Pegado manual',
                'process_type_id' => $processTypes['Pegado'] ?? 5,
                'description' => 'Pegado manual de cajas',
                'requires_machine' => false,
                'estimated_time_min' => 5,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-010',
                'name' => 'Pegado de autocierre',
                'process_type_id' => $processTypes['Pegado'] ?? 5,
                'description' => 'Aplicación de pegamento para autocierre',
                'requires_machine' => true,
                'estimated_time_min' => 4,
                'status' => 'active',
            ],

            // Procesos de Plegado
            [
                'code' => 'PROC-011',
                'name' => 'Plegado',
                'process_type_id' => $processTypes['Plegado'] ?? 6,
                'description' => 'Plegado de las líneas de la caja',
                'requires_machine' => false,
                'estimated_time_min' => 3,
                'status' => 'active',
            ],

            // Procesos de Ensamble
            [
                'code' => 'PROC-012',
                'name' => 'Ensamblado',
                'process_type_id' => $processTypes['Ensamble'] ?? 7,
                'description' => 'Ensamblado final de la caja',
                'requires_machine' => false,
                'estimated_time_min' => 4,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-013',
                'name' => 'Ensamblado automático',
                'process_type_id' => $processTypes['Ensamble'] ?? 7,
                'description' => 'Ensamblado con maquinaria',
                'requires_machine' => true,
                'estimated_time_min' => 3,
                'status' => 'active',
            ],

            // Procesos de Empaque
            [
                'code' => 'PROC-014',
                'name' => 'Empaque',
                'process_type_id' => $processTypes['Empaque'] ?? 8,
                'description' => 'Empaque en cajas master',
                'requires_machine' => true,
                'estimated_time_min' => 2,
                'status' => 'active',
            ],
            [
                'code' => 'PROC-015',
                'name' => 'Empaque final',
                'process_type_id' => $processTypes['Empaque'] ?? 8,
                'description' => 'Empaque en bundles',
                'requires_machine' => true,
                'estimated_time_min' => 2,
                'status' => 'active',
            ],

            // Procesos de Control de Calidad
            [
                'code' => 'PROC-016',
                'name' => 'Control de calidad',
                'process_type_id' => $processTypes['Control de Calidad'] ?? 9,
                'description' => 'Inspección visual y dimensional',
                'requires_machine' => false,
                'estimated_time_min' => 2,
                'status' => 'active',
            ],

            // Procesos de Almacenamiento
            [
                'code' => 'PROC-017',
                'name' => 'Almacenamiento',
                'process_type_id' => $processTypes['Almacenamiento'] ?? 10,
                'description' => 'Preparación para almacenamiento',
                'requires_machine' => false,
                'estimated_time_min' => 1,
                'status' => 'active',
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
