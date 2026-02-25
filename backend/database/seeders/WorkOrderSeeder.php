<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\WorkOrder;
use App\Models\WorkOrderProcess;
use App\Models\Process;
use Illuminate\Database\Seeder;

class WorkOrderSeeder extends Seeder
{
    /**
     * Seed the work_orders and work_order_processes tables.
     */
    public function run(): void
    {
        $products = Product::pluck('id', 'code')->toArray();
        
        // Obtener procesos para CAJ-001
        $processes = Process::where('product_id', $products['CAJ-001'] ?? null)
            ->orderBy('order_index')
            ->get();

        $workOrders = [
            [
                'product_id' => $products['CAJ-001'] ?? null,
                'product_name' => 'Caja de cartón corrugado 20x20x20 cm',
                'client_name' => 'Cliente Demo',
                'quantity' => 1000,
                'status' => 'draft',
                'priority' => 'medium',
                'start_date' => now()->toDateString(),
                'due_date' => now()->addDays(7)->toDateString(),
                'production_status' => 'PENDING',
            ],
            [
                'product_id' => $products['CAJ-002'] ?? null,
                'product_name' => 'Caja de cartón corrugado 30x30x30 cm',
                'client_name' => 'Empresa XYZ',
                'quantity' => 500,
                'status' => 'draft',
                'priority' => 'high',
                'start_date' => now()->toDateString(),
                'due_date' => now()->addDays(5)->toDateString(),
                'production_status' => 'PENDING',
            ],
            [
                'product_id' => $products['CAJ-006'] ?? null,
                'product_name' => 'Caja de cartón troquelada pequeña',
                'client_name' => 'Tienda Online',
                'quantity' => 2000,
                'status' => 'in_progress',
                'priority' => 'low',
                'start_date' => now()->subDays(2)->toDateString(),
                'due_date' => now()->addDays(10)->toDateString(),
                'production_status' => 'IN_PRODUCTION',
            ],
        ];

        foreach ($workOrders as $workOrderData) {
            $workOrder = WorkOrder::firstOrCreate(
                [
                    'product_name' => $workOrderData['product_name'],
                    'client_name' => $workOrderData['client_name'],
                    'quantity' => $workOrderData['quantity'],
                ],
                $workOrderData
            );

            // Crear procesos para la orden de trabajo si no existen
            if ($workOrder->wasRecentlyCreated && $processes->isNotEmpty()) {
                foreach ($processes as $index => $process) {
                    $isFirst = $index === 0;
                    $isLast = $index === $processes->count() - 1;

                    WorkOrderProcess::create([
                        'work_order_id' => $workOrder->id,
                        'process_id' => $process->id,
                        'machine_id' => $process->machine_id,
                        'status' => 'pending',
                        'mes_status' => $isFirst ? 'READY' : 'PENDING',
                        'quantity_done' => 0,
                        'completed_quantity' => 0,
                        'scrap_quantity' => 0,
                        'available_quantity' => $isFirst ? $workOrder->quantity : 0,
                        'planned_quantity' => $workOrder->quantity,
                        'is_rework_process' => false,
                    ]);
                }
            }
        }
    }
}
