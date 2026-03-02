<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\WorkOrder;
use App\Models\ProductionMovement;
use App\Models\Machine;
use App\Models\MachineMovement;
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
                only: ['index', 'show']
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

        // Búsqueda por código
        if ($request->search) {
            $query->where('code', 'like', '%' . $request->search . '%');
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
        }

        // Sincronizar con WorkOrder si existe (compatibilidad legacy)
        if ($production->work_order_id) {
            $workOrder = WorkOrder::find($production->work_order_id);
            if ($workOrder) {
                $workOrder->syncProgressFromProductions();
            }
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
            'machine_id' => 'sometimes|required|exists:machines,id',
            'operator_id' => 'sometimes|required|exists:operators,id',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'nullable|date|after_or_equal:start_time',
            'good_parts' => 'nullable|integer|min:0',
            'scrap_parts' => 'nullable|integer|min:0',
            'target_parts' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string',
            'pause_reason' => 'nullable|string',
            'quality_status' => 'nullable|in:PENDING,APPROVED,SCRAP,REWORK',
        ]);

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
        if ($production->work_order_id) {
            $workOrder = WorkOrder::find($production->work_order_id);
            if ($workOrder) {
                $workOrder->syncProgressFromProductions();
            }
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

        // Si tiene proceso asociado, actualizarlo
        if ($production->process_id) {
            $production->registerInProcess();
            
            $process = $production->process;
            $process->refresh();
            
            return response()->json([
                'success' => true,
                'message' => 'Producción completada exitosamente',
                'data' => [
                    'production' => $production->fresh(['process', 'machine', 'operator', 'workOrder']),
                    'process_metrics' => null,
                ]
            ]);
        }

        // Sincronizar con WorkOrder (compatibilidad legacy)
        if ($production->work_order_id) {
            $workOrder = WorkOrder::find($production->work_order_id);
            if ($workOrder) {
                $workOrder->syncProgressFromProductions();
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

    // ============================================================
    // Métodos anteriormente en WorkOrderProcessController
    // ============================================================

    /**
     * Iniciar un proceso de work order (cambiar a RUNNING)
     * Verifica que el proceso anterior esté completado
     */
    public function startProcess(WorkOrderProcess $workOrderProcess)
    {
        // Obtener todos los procesos de la orden en orden
        $allProcesses = $workOrderProcess->workOrder->processes()->orderBy('id')->get();
        $processIndex = $allProcesses->search(fn($p) => $p->id === $workOrderProcess->id);
        
        // Si no es el primer proceso, verificar que el anterior esté completado
        if ($processIndex > 0) {
            $previousProcess = $allProcesses->get($processIndex - 1);
            if ($previousProcess->mes_status !== WorkOrderProcess::STATUS_COMPLETED) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede iniciar el proceso. El proceso anterior (' . ($previousProcess->process?->name ?? 'Proceso ' . $processIndex) . ') debe estar completado primero.'
                ], 400);
            }
        }

        if (!$workOrderProcess->isReadyToStart()) {
            return response()->json([
                'success' => false,
                'message' => 'El proceso no está listo para iniciar. Debe estar en estado READY.'
            ], 400);
        }

        $workOrderProcess->start();

        return response()->json([
            'success' => true,
            'message' => 'Proceso iniciado',
            'data' => $workOrderProcess->fresh()
        ]);
    }

    /**
     * Pausar un proceso de work order
     */
    public function pauseProcess(Request $request, WorkOrderProcess $workOrderProcess)
    {
        $reason = $request->input('reason');

        if (!$workOrderProcess->pause($reason)) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede pausar el proceso. Debe estar en ejecución.'
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Proceso pausado',
            'data' => $workOrderProcess->fresh()
        ]);
    }

    /**
     * Completar un proceso de work order
     * Libera el siguiente proceso cuando uno se completa
     */
    public function completeProcess(WorkOrderProcess $workOrderProcess)
    {
        if (!$workOrderProcess->complete()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede completar el proceso. Debe estar en ejecución.'
            ], 400);
        }

        // Registrar movimiento de trazabilidad
        ProductionMovement::recordProcessCompleted($workOrderProcess);

        // Obtener el siguiente proceso y liberarlo
        $allProcesses = $workOrderProcess->workOrder->processes()->orderBy('id')->get();
        $processIndex = $allProcesses->search(fn($p) => $p->id === $workOrderProcess->id);
        $nextProcess = $allProcesses->get($processIndex + 1);
        
        if ($nextProcess) {
            // Liberar el siguiente proceso
            $nextProcess->update([
                'mes_status' => WorkOrderProcess::STATUS_READY,
                'ready_at' => now(),
                'available_quantity' => $workOrderProcess->completed_quantity,
            ]);
            ProductionMovement::recordProcessReleased($nextProcess, $workOrderProcess->completed_quantity);
        }

        // Verificar si la orden está completa
        $workOrder = $workOrderProcess->workOrder;
        if ($workOrder) {
            $workOrder->checkAndComplete();
        }

        return response()->json([
            'success' => true,
            'message' => $nextProcess ? 'Proceso completado y siguiente proceso liberado' : 'Proceso completado',
            'data' => [
                'process' => $workOrderProcess->fresh(),
                'next_process' => $nextProcess ? $nextProcess->fresh() : null,
                'pipeline_status' => $workOrder ? $workOrder->getPipelineStatus() : null,
            ]
        ]);
    }

    /**
     * Obtener métricas de un proceso de work order
     */
    public function processMetrics(WorkOrderProcess $workOrderProcess)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'process' => $workOrderProcess,
                'metrics' => $workOrderProcess->getMetrics(),
            ]
        ]);
    }

    /**
     * Inicializar el pipeline de producción para una orden de trabajo
     * Crea los procesos desde product_processes si no existen
     */
    public function initializePipeline(Request $request, int $workOrderId)
    {
        $workOrder = WorkOrder::find($workOrderId);

        if (!$workOrder) {
            return response()->json([
                'success' => false,
                'message' => 'Orden de trabajo no encontrada'
            ], 404);
        }

        // Obtener procesos de la orden
        $processes = $workOrder->processes()->orderBy('id')->get();

        // Si no hay procesos, crearlos desde product_processes
        if ($processes->isEmpty()) {
            // Obtener los procesos configurados para el producto
            $productProcesses = \App\Models\ProductProcess::where('product_id', $workOrder->product_id)
                ->orderBy('sequence')
                ->get();

            if ($productProcesses->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El producto no tiene procesos configurados. Configure los procesos en la configuración del producto.'
                ], 400);
            }

            // Crear los WorkOrderProcess desde product_processes
            foreach ($productProcesses as $index => $productProcess) {
                WorkOrderProcess::create([
                    'work_order_id' => $workOrder->id,
                    'process_id' => $productProcess->process_id,
                    'mes_status' => WorkOrderProcess::STATUS_PENDING,
                    'planned_quantity' => $workOrder->quantity,
                    'available_quantity' => 0,
                    'completed_quantity' => 0,
                    'scrap_quantity' => 0,
                    'rework_quantity' => 0,
                    'quantity_done' => 0,
                ]);
            }

            // Recargar los procesos
            $processes = $workOrder->processes()->orderBy('id')->get();
        }

        // Inicializar primer proceso
        $firstProcess = $processes->first();
        $firstProcess->update([
            'mes_status' => WorkOrderProcess::STATUS_READY,
            'ready_at' => now(),
            'available_quantity' => $workOrder->quantity,
            'planned_quantity' => $workOrder->quantity,
        ]);

        // Registrar movimiento
        ProductionMovement::recordProcessReleased($firstProcess, $workOrder->quantity);

        // Actualizar estado de la orden
        $workOrder->update([
            'production_status' => WorkOrder::PRODUCTION_STATUS_IN_PRODUCTION,
            'production_started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pipeline de producción inicializado',
            'data' => [
                'work_order' => $workOrder->fresh(),
                'first_process' => $firstProcess->fresh(),
                'pipeline_status' => $workOrder->getPipelineStatus(),
            ]
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

    /**
     * Listar procesos de una orden de trabajo (antes WorkOrderProcessController::index)
     */
    public function processIndex(Request $request)
    {
        $query = WorkOrderProcess::with([
            'workOrder', 
            'process', 
            'machine', 
            'employee',
            'productions',
            'qualityEvaluations'
        ]);

        if ($request->filled('work_order_id')) {
            $query->where('work_order_id', $request->integer('work_order_id'));
        }

        if ($request->filled('status')) {
            $query->where('mes_status', $request->get('status'));
        }

        // Filtros MES adicionales
        if ($request->filled('is_rework_process')) {
            $query->where('is_rework_process', $request->boolean('is_rework_process'));
        }

        return response()->json($query->orderBy('id')->get());
    }

    /**
     * Mostrar un proceso específico (antes WorkOrderProcessController::show)
     */
    public function processShow(WorkOrderProcess $workOrderProcess)
    {
        return response()->json(
            $workOrderProcess->load([
                'workOrder', 
                'process', 
                'machine', 
                'employee',
                'productions',
                'qualityEvaluations',
                'movements'
            ])
        );
    }

    /**
     * Crear un proceso para una orden de trabajo (antes WorkOrderProcessController::store)
     */
    public function processStore(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'process_id' => 'required|exists:processes,id',
            'machine_id' => 'nullable|exists:machines,id',
            'employee_id' => 'nullable|exists:employees,id',
            'mes_status' => 'nullable|in:PENDING,READY,RUNNING,PAUSED,COMPLETED',
            'quantity_done' => 'nullable|integer|min:0',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            // Campos MES
            'planned_quantity' => 'nullable|integer|min:0',
            'is_rework_process' => 'nullable|boolean',
        ]);

        // Estado por defecto MES
        $validated['mes_status'] = $validated['mes_status'] ?? WorkOrderProcess::STATUS_PENDING;
        $validated['quantity_done'] = $validated['quantity_done'] ?? 0;
        
        // Campos MES inicializados
        $validated['completed_quantity'] = 0;
        $validated['scrap_quantity'] = 0;
        $validated['available_quantity'] = 0;
        $validated['rework_quantity'] = 0;
        $validated['planned_quantity'] = $validated['planned_quantity'] ?? 0;

        $record = WorkOrderProcess::create($validated);

        return response()->json(
            $record->load(['workOrder', 'process', 'machine', 'employee']),
            201
        );
    }

    /**
     * Actualizar un proceso de orden de trabajo (antes WorkOrderProcessController::update)
     */
    public function processUpdate(Request $request, WorkOrderProcess $workOrderProcess)
    {
        $validated = $request->validate([
            'machine_id' => 'nullable|exists:machines,id',
            'employee_id' => 'nullable|exists:employees,id',
            'mes_status' => 'sometimes|in:PENDING,READY,RUNNING,PAUSED,COMPLETED',
            'quantity_done' => 'sometimes|integer|min:0',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
            // Campos MES
            'planned_quantity' => 'nullable|integer|min:0',
            'is_rework_process' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $workOrderProcess->update($validated);

        return response()->json(
            $workOrderProcess->load(['workOrder', 'process', 'machine', 'employee'])
        );
    }

    /**
     * Eliminar un proceso de orden de trabajo (antes WorkOrderProcessController::destroy)
     */
    public function processDestroy(WorkOrderProcess $workOrderProcess)
    {
        $workOrderProcess->delete();

        return response()->json(null, 204);
    }
}
