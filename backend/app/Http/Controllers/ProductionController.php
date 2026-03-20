<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\WorkOrder;
use App\Models\ProductionMovement;
use App\Models\Machine;
use App\Models\MachineMovement;
use App\Models\Operator;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;

class ProductionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('productions.view'),
                only: ['show']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Production::with([
            'process', 
            'parentProcess', 
            'machine', 
            'operator', 
            'workOrder',
            'workOrder.client',
            'workOrder.sale',
            'workOrder.product',
            'product',
            'client',
            'sale'
        ]);

        // Filtros adicionales MES
        if ($request->work_order_id) {
            $query->where('work_order_id', $request->work_order_id);
        }

        if ($request->process_id) {
            $query->where('process_id', $request->process_id);
        }

        if ($request->quality_status) {
            $query->where('quality_status', $request->quality_status);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filtro por cliente (directo en production o a través de work_order)
        if ($request->client_id) {
            $query->where(function($q) use ($request) {
                $q->where('client_id', $request->client_id)
                  ->orWhereHas('workOrder', function ($wq) use ($request) {
                      $wq->where('client_id', $request->client_id);
                  });
            });
        }

        // Filtro por venta (directo en production o a través de work_order)
        if ($request->sale_id) {
            $query->where(function($q) use ($request) {
                $q->where('sale_id', $request->sale_id)
                  ->orWhereHas('workOrder', function ($wq) use ($request) {
                      $wq->where('sale_id', $request->sale_id);
                  });
            });
        }

        // Filtro por producto
        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        // Filtro por operador
        if ($request->operator_id) {
            $query->where('operator_id', $request->operator_id);
        }

        // Filtro por máquina
        if ($request->machine_id) {
            $query->where('machine_id', $request->machine_id);
        }

        // Filtro por rango de fechas
        if ($request->start_date) {
            $query->whereDate('start_time', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('start_time', '<=', $request->end_date);
        }

        // Búsqueda por código de producción o código de orden de trabajo
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('code', 'like', '%' . $request->search . '%')
                  ->orWhereHas('workOrder', function ($wq) use ($request) {
                      $wq->where('code', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $productions = $query->latest()->paginate(15);

        return response()->json($productions);
    }

    /**
     * Store a newly created resource in storage.
     * 
     * Flujo MES:
     * 1. Validar datos de producción
     * 2. Crear registro de producción
     * 3. Si tiene work_order_process, actualizar acumulados del proceso
     * 4. Registrar movimiento de trazabilidad
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'process_id' => 'required|exists:processes,id',
            'parent_process_id' => 'nullable|exists:processes,id',
            'work_order_id' => 'nullable|exists:work_orders,id',
            'product_id' => 'required|exists:products,id',
            'machine_id' => 'nullable|exists:machines,id',
            'operator_id' => 'nullable|exists:operators,id',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'good_parts' => 'nullable|integer|min:0',
            'scrap_parts' => 'nullable|integer|min:0',
            'target_parts' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
            'pause_reason' => 'nullable|string',
        ]);

        // Valores predeterminados
        $data['good_parts'] = $data['good_parts'] ?? 0;
        $data['scrap_parts'] = $data['scrap_parts'] ?? 0;
        $data['target_parts'] = $data['target_parts'] ?? 100;
        $data['status'] = $data['status'] ?? 'pending';
        $data['quality_status'] = $data['quality_status'] ?? Production::QUALITY_STATUS_PENDING;
        
        // Fechas
        if (empty($data['start_time'])) {
            $data['start_time'] = now();
        }

        $production = Production::create($data);

        // Si tiene máquina asignada y el status es in_progress, registrar movement de máquina
        if ($production->machine_id && $data['status'] === 'in_progress') {
            $machine = Machine::find($production->machine_id);
            if ($machine) {
                // Crear registro de movimiento de máquina
                MachineMovement::create([
                    'machine_id' => $machine->id,
                    'production_id' => $production->id,
                    'operator_id' => $production->operator_id,
                    'start_time' => $production->start_time,
                    'status' => 'active',
                ]);
                
                // Cambiar status de la máquina a "en uso"
                $machine->update(['status' => Machine::STATUS_IN_USE]);
            }
        }

        // Si está marcado como completado, registrar en el proceso
        if ($data['status'] === 'completed' && $production->process_id) {
            $production->registerInProcess();
            
            // Registrar movimiento de producción
            if ($production->good_parts > 0) {
                ProductionMovement::recordProduction($production, $production->good_parts);
            }
            
            // Registrar scrap si existe
            if ($production->scrap_parts > 0) {
                ProductionMovement::recordScrap($production, $production->scrap_parts);
            }
            
            // Registrar completado del proceso
            ProductionMovement::recordProcessCompleted($production);
        }

        // Sincronizar con WorkOrder si existe (compatibilidad legacy)        
        $workOrder = $production->WorkOrder;
        if ($workOrder) {
            $workOrder->syncProgressFromProductions();
        }        

        return response()->json([
            'success' => true,
            'message' => 'Orden de producción creada exitosamente',
            'data' => $production->load(['process', 'machine', 'operator', 'workOrder', 'parentProcess'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Production $production)
    {
        $production->load([
            'process', 
            'parentProcess',
            'machine', 
            'operator', 
            'workOrder',
            'process.process',
            'qualityEvaluations',
            'movements'
        ]);

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $production
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $productionId)
    {
        // Buscar la producción manualmente para evitar problemas con route model binding
        $production = Production::find($productionId);
        
        if (!$production) {
            return response()->json([
                'success' => false,
                'message' => 'Producción no encontrada',
                'data' => null
            ], 404);
        }
        
        $data = $request->validate([
            'process_id' => 'sometimes|required|exists:processes,id',
            'parent_process_id' => 'sometimes|nullable|exists:processes,id',
            'work_order_id' => 'sometimes|nullable|exists:work_orders,id',
            'product_id' => 'sometimes|required|exists:products,id',
            'machine_id' => 'sometimes|nullable|exists:machines,id',
            'operator_id' => 'sometimes|nullable|exists:operators,id',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'good_parts' => 'nullable|integer|min:0',
            'scrap_parts' => 'nullable|integer|min:0',
            'target_parts' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
            'pause_reason' => 'nullable|string',
            'quality_status' => 'nullable|in:PENDING,APPROVED,SCRAP,REWORK',
            'increment_parts' => 'nullable|boolean',
        ]);
        
        // Si se indica increment_parts, sumar a los valores existentes en lugar de reemplazar
        $incrementParts = $request->boolean('increment_parts', false);
        if ($incrementParts) {
            if (isset($data['good_parts'])) {
                $data['good_parts'] = ($production->good_parts ?? 0) + $data['good_parts'];
            }
            if (isset($data['scrap_parts'])) {
                $data['scrap_parts'] = ($production->scrap_parts ?? 0) + $data['scrap_parts'];
            }
        }

        // Validación de calidad: no permitir iniciar producción si la producción padre no está completada y aprobada por calidad
        if (isset($data['status']) && $data['status'] === 'in_progress' && in_array($production->status, ['pending', null, ''])) {
            // Recargar la producción para obtener el valor actual de parent_production_id
            $production = $production->fresh();
            
            if (!$production) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producción no encontrada al recargar',
                    'data' => null
                ], 404);
            }
            
            if ($production->parent_production_id) {
                // Obtener la producción padre
                $parentProduction = Production::find($production->parent_production_id);
                
                // Si hay producción padre, verificar que esté completada Y aprobada por calidad
                if ($parentProduction) {
                    if ($parentProduction->status !== 'completed') {
                        return response()->json([
                            'success' => false,
                            'message' => 'No se puede iniciar la producción. La producción padre debe estar completada primero.',
                            'data' => null
                        ], 422);
                    }
                    
                    // Verificar que la producción padre esté aprobada por calidad
                    if ($parentProduction->quality_status !== Production::QUALITY_STATUS_APPROVED) {
                        return response()->json([
                            'success' => false,
                            'message' => 'No se puede iniciar la producción. La producción padre debe estar aprobada por calidad primero.',
                            'data' => null
                        ], 422);
                    }
                }
            }
        }

        $wasCompleted = $production->status === 'completed';
        $production->update($data);

        // Si se marca como completado, registrar en el proceso
        if (isset($data['status']) && $data['status'] === 'completed' && !$wasCompleted) {
            $production->registerInProcess();
            
            // Registrar movimiento de producción
            if ($production->good_parts > 0) {
                ProductionMovement::recordProduction($production, $production->good_parts);
            }
            
            // Registrar scrap si existe
            if ($production->scrap_parts > 0) {
                ProductionMovement::recordScrap($production, $production->scrap_parts);
            }
            
            // Registrar completado del proceso
            ProductionMovement::recordProductionCompleted($production);
        }

        // Actualizar estado de máquina al iniciar o detener producción
        if (isset($data['status']) && $production->machine_id) {
            $machine = $production->machine;
            if ($machine) {
                if ($data['status'] === 'in_progress') {
                    // Máquina en uso - crear movement si no existe
                    $machine->update(['status' => Machine::STATUS_IN_USE]);
                    
                    // Crear movement de máquina si no existe
                    $activeMovement = MachineMovement::where('machine_id', $machine->id)
                        ->where('production_id', $production->id)
                        ->where('status', 'active')
                        ->first();
                    
                    if (!$activeMovement) {
                        MachineMovement::create([
                            'machine_id' => $machine->id,
                            'production_id' => $production->id,
                            'operator_id' => $production->operator_id,
                            'start_time' => now(),
                            'status' => 'active',
                        ]);
                    }
                } elseif (in_array($data['status'], ['completed', 'cancelled'])) {
                    // Máquina disponible - cerrar movement
                    $machine->update(['status' => Machine::STATUS_AVAILABLE]);
                    
                    // Cerrar movement de máquina activo
                    $activeMovement = MachineMovement::where('machine_id', $machine->id)
                        ->where('production_id', $production->id)
                        ->where('status', 'active')
                        ->first();
                    
                    if ($activeMovement) {
                        $activeMovement->update([
                            'end_time' => now(),
                            'status' => 'completed',
                        ]);
                    }
                }
            }
        }

        // Sincronizar con WorkOrder si existe (compatibilidad legacy)        
        $workOrder = $production->workOrder;
        if ($workOrder) {
            $workOrder->syncProgressFromProductions();
        }       

        return response()->json([
            'success' => true,
            'message' => 'Orden de producción actualizada exitosamente',
            'data' => $production->load(['process', 'machine', 'operator', 'workOrder', 'parentProcess'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Production $production)
    {
        // Nota: No se eliminan datos históricos según las reglas MES
        // Solo se puede "cancelar" la producción
        $workOrderId = $production->work_order_id;
        
        // Marcar como cancelada en lugar de eliminar
        $production->update(['status' => 'cancelled']);

        // Sincronizar con WorkOrder si existía relación
        if ($workOrderId) {
            $workOrder = WorkOrder::find($workOrderId);
            if ($workOrder) {
                $workOrder->syncProgressFromProductions();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Orden de producción cancelada exitosamente',
            'data' => null
        ]);
    }

    /**
     * Complete production and transfer to finished goods inventory
     */
    public function completeToInventory(Production $production)
    {
        $workOrder = $production->workOrder;
        
        if (!$workOrder) {
            return response()->json([
                'success' => false,
                'message' => 'La producción no tiene una orden de trabajo asociada',
                'data' => null
            ], 400);
        }

        // Usar el método del WorkOrder para transferir a inventario
        $result = $workOrder->transferToFinishedInventory();

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['data']
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
            'data' => null
        ], 400);
    }

    /**
     * Completar producción con cantidades (método MES)
     */
    public function complete(Request $request, Production $production)
    {
        $data = $request->validate([
            'good_parts' => 'required|integer|min:0',
            'scrap_parts' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $scrapParts = $data['scrap_parts'] ?? 0;

        // Completar la producción
        $production->complete($data['good_parts'], $scrapParts);

        // Registrar movimientos de producción
        if ($data['good_parts'] > 0) {
            ProductionMovement::recordProduction($production, $data['good_parts']);
        }

        // Registrar scrap si existe
        if ($scrapParts > 0) {
            ProductionMovement::recordScrap($production, $scrapParts);
        }

        // Sincronizar con WorkOrder (compatibilidad legacy)       
        $workOrder = $production->workOrder;
        if ($workOrder) {
            $workOrder->syncProgressFromProductions();
        }

        // Liberar la máquina si estaba asignada y cerrar el movimiento
        $machine = $production->machine;
        if ($machine) {
            $machine->update(['status' => Machine::STATUS_AVAILABLE]);
            
            // Cerrar movement de máquina activo
            $activeMovement = MachineMovement::where('machine_id', $machine->id)
                ->where('production_id', $production->id)
                ->where('status', 'active')
                ->first();
            
            if ($activeMovement) {
                $activeMovement->update([
                    'end_time' => now(),
                    'status' => 'completed',
                ]);
            }
        }
        

        return response()->json([
            'success' => true,
            'message' => 'Producción completada exitosamente',
            'data' => $production->fresh(['process', 'machine', 'operator', 'workOrder'])
        ]);
    }

    /**
     * Pausar producción
     */
    public function pause(Request $request, Production $production)
    {
        $reason = $request->input('reason');
        
        $production->pause($reason);
        
        // Registrar movimiento de pausa
        ProductionMovement::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => ProductionMovement::TYPE_PRODUCTION,
            'quantity' => $production->good_parts,
            'description' => 'Producción pausada' . ($reason ? ": {$reason}" : ''),
        ]);

        // Liberar la máquina si estaba asignada y cerrar el movimiento
        $machine = $production->machine;
        if ($machine) {
            $machine->update(['status' => Machine::STATUS_AVAILABLE]);
            
            // Cerrar movement de máquina activo
            $activeMovement = MachineMovement::where('machine_id', $machine->id)
                ->where('production_id', $production->id)
                ->where('status', 'active')
                ->first();
            
            if ($activeMovement) {
                $activeMovement->update([
                    'end_time' => now(),
                    'status' => 'completed',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Producción pausada',
            'data' => $production->fresh()
        ]);
    }

    /**
     * Reanudar producción
     */
    public function resume(Production $production)
    {
        $production->resume();
        
        // Registrar movimiento de reanudación
        ProductionMovement::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => ProductionMovement::TYPE_PRODUCTION,
            'quantity' => $production->good_parts,
            'description' => 'Producción reanudada',
        ]);

        // Marcar máquina como en uso si está asignada y crear movimiento
        $machine = $production->machine;
        if ($machine) {
            $machine->update(['status' => Machine::STATUS_IN_USE]);
            
            // Crear movement de máquina si no existe
            $activeMovement = MachineMovement::where('machine_id', $machine->id)
                ->where('production_id', $production->id)
                ->where('status', 'active')
                ->first();
            
            if (!$activeMovement) {
                MachineMovement::create([
                    'machine_id' => $machine->id,
                    'production_id' => $production->id,
                    'operator_id' => $production->operator_id,
                    'start_time' => now(),
                    'status' => 'active',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Producción reanudada',
            'data' => $production->fresh()
        ]);
    }

    /**
     * Obtener historial de movimientos de una producción
     */
    public function movements(Production $production)
    {
        $movements = ProductionMovement::where('production_id', $production->id)
            ->orderBy('movement_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $movements
        ]);
    }

    /**
     * Obtener producciones pendientes de evaluación de calidad
     */
    public function pendingQuality(Request $request)
    {
        $query = Production::with(['workOrder', 'process', 'operator'])
            ->where('quality_status', Production::QUALITY_STATUS_PENDING)
            ->where('status', 'completed');

        if ($request->work_order_id) {
            $query->where('work_order_id', $request->work_order_id);
        }

        $productions = $query->orderBy('end_time', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $productions
        ]);
    }

    /**
     * Obtener el estado del pipeline
     */
    public function pipelineStatus(int $workOrderId)
    {
        $workOrder = WorkOrder::find($workOrderId);

        if (!$workOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de trabajo no encontrada'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'work_order' => $workOrder,
                'pipeline_status' => $workOrder->getPipelineStatus(),
                'processes' => $workOrder->processes()->get()->map(function($p) {
                    return [
                        'id' => $p->id,
                        'process_name' => $p->process?->name,
                        'mes_status' => $p->mes_status,
                        'completed_quantity' => $p->completed_quantity,
                        'scrap_quantity' => $p->scrap_quantity,
                        'available_quantity' => $p->available_quantity,
                        'planned_quantity' => $p->planned_quantity,
                        'metrics' => $p->getMetrics(),
                    ];
                }),
            ]
        ]);
    }
}
