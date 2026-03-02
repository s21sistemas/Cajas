<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Process;
use App\Models\Material;
use App\Models\ProductProcess;
use App\Models\ProductMaterial;
use Illuminate\Database\Seeder;

class ProductProcessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Vincula productos con procesos y materiales
     */
    public function run(): void
    {
        // Obtener productos por código
        $products = Product::pluck('id', 'code')->toArray();
        
        // Obtener procesos por código
        $processes = Process::pluck('id', 'code')->toArray();
        
        // Obtener materiales por código
        $materials = Material::pluck('id', 'code')->toArray();

        // Definir vinculaciones de productos a procesos
        $productProcesses = [
            // Caja estándar 20x20x20 (CAJ-001)
            'CAJ-001' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-011'] ?? 11, 'sequence' => 2, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 3, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 4, 'estimated_minutes' => 2],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
            
            // Caja estándar 30x30x30 (CAJ-002)
            'CAJ-002' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-011'] ?? 11, 'sequence' => 2, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 3, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 4, 'estimated_minutes' => 2],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
            
            // Caja estándar 40x40x40 (CAJ-003)
            'CAJ-003' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 8],
                ['process_id' => $processes['PROC-011'] ?? 11, 'sequence' => 2, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 3, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 4, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 5, 'estimated_minutes' => 3],
            ],
            
            // Caja para pizza (CAJ-004)
            'CAJ-004' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-003'] ?? 3, 'sequence' => 2, 'estimated_minutes' => 8],
                ['process_id' => $processes['PROC-011'] ?? 11, 'sequence' => 3, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 4, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
            
            // Caja con divisor (CAJ-005)
            'CAJ-005' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 7],
                ['process_id' => $processes['PROC-003'] ?? 3, 'sequence' => 2, 'estimated_minutes' => 8],
                ['process_id' => $processes['PROC-005'] ?? 5, 'sequence' => 3, 'estimated_minutes' => 10],
                ['process_id' => $processes['PROC-008'] ?? 8, 'sequence' => 4, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 6, 'estimated_minutes' => 2],
            ],
            
            // Caja troquelada pequeña (CAJ-006)
            'CAJ-006' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-006'] ?? 6, 'sequence' => 2, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-010'] ?? 10, 'sequence' => 3, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 4, 'estimated_minutes' => 2],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
            
            // Caja troquelada mediana (CAJ-007)
            'CAJ-007' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-006'] ?? 6, 'sequence' => 2, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-010'] ?? 10, 'sequence' => 3, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-012'] ?? 12, 'sequence' => 4, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
            
            // Caja con ventana (CAJ-008)
            'CAJ-008' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-003'] ?? 3, 'sequence' => 2, 'estimated_minutes' => 8],
                ['process_id' => $processes['PROC-005'] ?? 5, 'sequence' => 3, 'estimated_minutes' => 8],
                ['process_id' => $processes['PROC-008'] ?? 8, 'sequence' => 4, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 6, 'estimated_minutes' => 2],
            ],
            
            // Caja doble pared 50x50x50 (CAJ-009)
            'CAJ-009' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 10],
                ['process_id' => $processes['PROC-002'] ?? 2, 'sequence' => 2, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-003'] ?? 3, 'sequence' => 3, 'estimated_minutes' => 10],
                ['process_id' => $processes['PROC-011'] ?? 11, 'sequence' => 4, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-008'] ?? 8, 'sequence' => 5, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 6, 'estimated_minutes' => 3],
                ['process_id' => $processes['PROC-014'] ?? 14, 'sequence' => 7, 'estimated_minutes' => 3],
            ],
            
            // Caja archivador (CAJ-010)
            'CAJ-010' => [
                ['process_id' => $processes['PROC-001'] ?? 1, 'sequence' => 1, 'estimated_minutes' => 5],
                ['process_id' => $processes['PROC-003'] ?? 3, 'sequence' => 2, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-005'] ?? 5, 'sequence' => 3, 'estimated_minutes' => 6],
                ['process_id' => $processes['PROC-008'] ?? 8, 'sequence' => 4, 'estimated_minutes' => 4],
                ['process_id' => $processes['PROC-016'] ?? 16, 'sequence' => 5, 'estimated_minutes' => 2],
            ],
        ];

        // Insertar product_processes
        foreach ($productProcesses as $productCode => $processData) {
            $productId = $products[$productCode] ?? null;
            if (!$productId) continue;

            foreach ($processData as $process) {
                $processModel = Process::find($process['process_id']);
                ProductProcess::firstOrCreate(
                    [
                        'product_id' => $productId,
                        'process_id' => $process['process_id'],
                    ],
                    [
                        'name' => $processModel?->name ?? 'Proceso',
                        'sequence' => $process['sequence'],
                        'estimated_minutes' => $process['estimated_minutes'],
                    ]
                );
            }
        }

        // Definir vinculaciones de productos a materiales
        $productMaterials = [
            // Caja estándar 20x20x20 (CAJ-001)
            'CAJ-001' => [
                ['material_id' => $materials['CART-002'] ?? 1, 'quantity' => 0.8], // Cartón BC
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.05], // Tinta negra
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.1], // Pegamento
            ],
            
            // Caja estándar 30x30x30 (CAJ-002)
            'CAJ-002' => [
                ['material_id' => $materials['CART-002'] ?? 1, 'quantity' => 1.2],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.08],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.15],
            ],
            
            // Caja estándar 40x40x40 (CAJ-003)
            'CAJ-003' => [
                ['material_id' => $materials['CART-002'] ?? 1, 'quantity' => 1.8],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.12],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.2],
            ],
            
            // Caja para pizza (CAJ-004)
            'CAJ-004' => [
                ['material_id' => $materials['CART-001'] ?? 1, 'quantity' => 0.5],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.03],
                ['material_id' => $materials['TINT-004'] ?? 76, 'quantity' => 0.02],
            ],
            
            // Caja con divisor (CAJ-005)
            'CAJ-005' => [
                ['material_id' => $materials['CART-003'] ?? 1, 'quantity' => 2.0],
                ['material_id' => $materials['CART-004'] ?? 4, 'quantity' => 0.5],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.1],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.25],
            ],
            
            // Caja troquelada pequeña (CAJ-006)
            'CAJ-006' => [
                ['material_id' => $materials['CART-005'] ?? 1, 'quantity' => 0.3],
                ['material_id' => $materials['PEG-003'] ?? 121, 'quantity' => 0.02],
            ],
            
            // Caja troquelada mediana (CAJ-007)
            'CAJ-007' => [
                ['material_id' => $materials['CART-005'] ?? 1, 'quantity' => 0.5],
                ['material_id' => $materials['PEG-003'] ?? 121, 'quantity' => 0.03],
            ],
            
            // Caja con ventana (CAJ-008)
            'CAJ-008' => [
                ['material_id' => $materials['CART-002'] ?? 1, 'quantity' => 1.5],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.08],
                ['material_id' => $materials['TINT-002'] ?? 74, 'quantity' => 0.05],
                ['material_id' => $materials['TINT-003'] ?? 75, 'quantity' => 0.05],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.2],
            ],
            
            // Caja doble pared 50x50x50 (CAJ-009)
            'CAJ-009' => [
                ['material_id' => $materials['CART-003'] ?? 1, 'quantity' => 3.5],
                ['material_id' => $materials['CART-004'] ?? 4, 'quantity' => 1.0],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.15],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.3],
                ['material_id' => $materials['PEG-002'] ?? 120, 'quantity' => 0.1],
            ],
            
            // Caja archivador (CAJ-010)
            'CAJ-010' => [
                ['material_id' => $materials['CART-002'] ?? 1, 'quantity' => 1.0],
                ['material_id' => $materials['TINT-001'] ?? 73, 'quantity' => 0.06],
                ['material_id' => $materials['PEG-001'] ?? 119, 'quantity' => 0.15],
            ],
        ];

        // Insertar product_materials
        foreach ($productMaterials as $productCode => $materialData) {
            $productId = $products[$productCode] ?? null;
            if (!$productId) continue;

            foreach ($materialData as $material) {
                ProductMaterial::firstOrCreate(
                    [
                        'product_id' => $productId,
                        'material_id' => $material['material_id'],
                    ],
                    [
                        'quantity' => $material['quantity'],
                    ]
                );
            }
        }

        $this->command->info('Productos vinculados con procesos y materiales correctamente');
    }
}
