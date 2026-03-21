<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrder;
use App\Models\Production;
use App\Models\ProductProcess;
use App\Models\SaleItem;
use App\Models\Product;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WorkOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('workorders.view'),
                only: ['index', 'show']
            ),
            
            new Middleware(
                PermissionMiddleware::using('workorders.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('workorders.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('workorders.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Listar todas las órdenes de trabajo
     */
    public function index(Request $request)
    {
        $query = WorkOrder::query();

        // Cargar relaciones
        $query->with(['client', 'supplier', 'sale', 'product']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $perPage = $request->integer('per_page', 15);
        $workOrders = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($workOrders);
    }

    public function selectListWorkOrders(){
        // Devolver todos los work orders con información relevante para el select
        $workOrders = WorkOrder::select('id', 'code', 'product_id', 'client_id', 'quantity', 'status')
            ->with(['product:id,name', 'client:id,name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function($wo) {
                return [
                    'id' => $wo->id,
                    'code' => $wo->code,
                    'product_name' => $wo->product?->name ?? 'Sin producto',
                    'client_name' => $wo->client?->name ?? 'Sin cliente',
                    'quantity' => $wo->quantity,
                    'status' => $wo->status,
                ];
            });
        return response()->json($workOrders);
    }

    /**
     * Obtener órdenes de trabajo asignadas al operador
     * Retorna las órdenes que tienen producciones pendientes o en proceso
     */
    public function getAssigned()
    {
        $operatorId = auth()->id();
        // Obtener work orders que tienen producciones pendientes o en proceso
        $workOrders = WorkOrder::select('id', 'code', 'product_id', 'client_id', 'product_name', 'client_name', 'quantity', 'completed', 'progress', 'status', 'priority')
            ->with(['productions:id,work_order_id,status,process_id,product_id', 'client'])
            ->whereHas('productions', function ($query) use ($operatorId) {
                $query->whereIn('status', ['pending', 'in_progress', 'paused', 'completed'])
                    ->where('operator_id', $operatorId);
            })
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($wo) {
                return [
                    'id' => $wo->id,
                    'code' => $wo->code,
                    'product_name' => $wo->product_name,
                    'client_name' => $wo->client?->name ?? $wo->client_name ?? 'Sin cliente',
                    'quantity' => $wo->quantity,
                    'completed' => $wo->completed,
                    'progress' => $wo->progress,
                    'status' => $wo->status,
                    'priority' => $wo->priority,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $workOrders,
        ]);
    }

    /**
     * Obtener producciones de una orden de trabajo
     */
    public function getProductions(WorkOrder $workOrder)
    {
        $operatorId = auth()->id();

        $productions = Production::query()
        ->where('productions.work_order_id', $workOrder->id)
        ->where('productions.operator_id', $operatorId)
        ->leftJoin('product_processes', function ($join) {
            $join->on('product_processes.process_id', '=', 'productions.process_id')
                ->on('product_processes.product_id', '=', 'productions.product_id');
        })
        ->select(
            'productions.*',
            'product_processes.sequence'
        )
        ->with([
            'process:id,name,requires_machine',
            'machine:id,name',
            'operator:id,name',
            'parentProcess:id,code,status,good_parts,scrap_parts'
        ])
        ->orderBy('sequence')
        ->get();

        return response()->json($productions);
    }

    public function getAvailableProducts(Request $request)
    {
        $saleId = $request->query('sale_id');
        
        if (!$saleId) {
            return response()->json(['error' => 'Se requiere sale_id'], 400);
        }
        
        // Obtener todos los items de la venta
        $saleItems = SaleItem::where('sale_id', $saleId)
            ->whereNotNull('product_id')
            ->get();
        
        // Obtener IDs de productos que ya tienen orden de trabajo
        $existingProductIds = WorkOrder::where('sale_id', $saleId)
            ->whereNotNull('product_id')
            ->pluck('product_id')
            ->toArray();
        
        // Filtrar solo los productos sin orden de trabajo
        $availableItems = $saleItems->filter(function ($item) use ($existingProductIds) {
            return !in_array($item->product_id, $existingProductIds);
        });
        
        return response()->json([
        'success' => true,
        'data' => $availableItems
            ->map(function ($item) {
                $product = Product::find($item->product_id);

                return [
                    'id' => $item->id,
                    'saleId' => $item->sale_id,
                    'productId' => $item->product_id,
                    'product_id' => $item->product_id,
                    'productName' => $product->name,
                    'product_name' => $product->name,
                    'quantity' => $item->quantity,
                    'unitPrice' => $item->unit_price,
                    'unit_price' => $item->unit_price,
                    'subtotal' => $item->subtotal,
                ];
            })
            ->values() // ← esto arregla el JSON
        ]);
    }

    /**
     * Crear una nueva orden de trabajo
     * Al crearse, obtiene los product_processes del producto y crea las producciones
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'client_id' => 'nullable|exists:clients,id',
            'sale_id' => 'nullable|exists:sales,id',
            'quantity' => 'required|integer|min:1',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Validar que el producto tenga procesos o materiales configurados
        if (!empty($data['product_id'])) {
            $product = \App\Models\Product::with(['productProcesses', 'materials'])->find($data['product_id']);
            
            $hasProcesses = $product->productProcesses->count() > 0;
            $hasMaterials = $product->materials->count() > 0;
            
            if (!$hasProcesses && !$hasMaterials) {
                return response()->json([
                    'errors' => [
                        'product_id' => ['El producto no tiene configuración de procesos ni materiales. Por favor configure la receta del producto antes de crear la orden de trabajo.']
                    ]
                ], 422);
            }
        }

        // Generar código si no se proporciona
        if (empty($data['code'])) {
            $data['code'] = 'WO-' . str_pad(\App\Models\WorkOrder::max('id') + 1, 5, '0', STR_PAD_LEFT);
        }

        // Si se proporciona sale_id, obtener información del cliente y venta
        $sale = null;
        $isFromSale = !empty($data['sale_id']);
        $isFromProduct = !empty($data['product_id']);

        if ($isFromSale) {
            $sale = \App\Models\Sale::find($data['sale_id']);
            if ($sale) {
                // Usar el cliente de la venta si no se especificó uno
                if (empty($data['client_id'])) {
                    $data['client_id'] = $sale->client_id;
                }
            }
        }

        // Siempre crea SOLO para el product_id enviado:
        if (!empty($data['product_id'])) {
            $product = \App\Models\Product::find($data['product_id']);
            $data['product_name'] = $product?->name ?? 'Producto sin nombre';
        } else {
            $data['product_name'] = 'Sin producto';
        }

        // Obtener el nombre del cliente si se proporciona
        if (!empty($data['client_id'])) {
            $client = \App\Models\Client::find($data['client_id']);
            $data['client_name'] = $client->name ?? '';
        }

        // Valores por defecto
        $data['status'] = 'pending';
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['completed'] = 0;
        $data['progress'] = 0;

        // Crear la orden de trabajo SOLO para el product_id proporcionado
        $workOrder = WorkOrder::create($data);

        // Obtener los procesos del producto en orden de secuencia
        $productions = [];
        $previousProductionId = null;
        if (!empty($data['product_id'])) {
            $productProcesses = ProductProcess::where('product_id', $data['product_id'])
                ->orderBy('sequence')
                ->get();

            // Crear una producción por cada proceso del producto
            foreach ($productProcesses as $pp) {
                $production = Production::create([
                    'work_order_id' => $workOrder->id,
                    'product_id' => $data['product_id'],
                    'process_id' => $pp->process_id,
                    'parent_production_id' => $previousProductionId,
                    'target_parts' => $data['quantity'],
                    'status' => 'pending',
                    'start_time' => now(),
                    // Asignar sale_id y client_id a la producción
                    'sale_id' => $data['sale_id'] ?? null,
                    'client_id' => $data['client_id'] ?? null,
                ]);
                $productions[] = $production;
                $previousProductionId = $production->id;
            }
        }

        // Cargar las producciones creadas
        $productionsLoaded = Production::where('work_order_id', $workOrder->id)->get();

        return response()->json([
            'success' => true,
            'message' => 'Orden de trabajo creada correctamente',
            'data' => $workOrder->load('productions.process'),
            'productions' => $productions,
        ], 201);
    }

    /**
     * Ver una orden de trabajo específica
     */
    public function show(WorkOrder $workOrder)
    {
        $workOrder->load('productions.process');
        return response()->json([
            'success' => true,
            'data' => $workOrder,
        ]);
    }

    /**
     * Actualizar una orden de trabajo
     */
    public function update(Request $request, WorkOrder $workOrder)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'sometimes|nullable|exists:products,id',
            'client_id' => 'nullable|exists:clients,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'sale_id' => 'nullable|exists:sales,id',
            'quantity' => 'sometimes|required|integer|min:1',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled,on_hold',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Validar que el producto tenga procesos o materiales configurados
        if (isset($data['product_id']) && !empty($data['product_id'])) {
            $product = \App\Models\Product::with(['productProcesses', 'materials'])->find($data['product_id']);
            
            $hasProcesses = $product->productProcesses->count() > 0;
            $hasMaterials = $product->materials->count() > 0;
            
            if (!$hasProcesses && !$hasMaterials) {
                return response()->json([
                    'errors' => [
                        'product_id' => ['El producto no tiene configuración de procesos ni materiales. Por favor configure la receta del producto antes de actualizar la orden de trabajo.']
                    ]
                ], 422);
            }
        }
        
        // Actualizar nombre del producto si cambió
        if (isset($data['product_id'])) {
            $product = \App\Models\Product::find($data['product_id']);
            $data['product_name'] = $product->name ?? 'Producto sin nombre';
        }
        
        // Actualizar nombre del cliente si cambió
        if (isset($data['client_id'])) {
            $client = \App\Models\Client::find($data['client_id']);
            $data['client_name'] = $client->name ?? '';
        }

        $workOrder->update($data);
        
        // Si cambió la cantidad, actualizar las producciones
        if (isset($data['quantity'])) {
            $workOrder->productions()->update(['target_parts' => $data['quantity']]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Orden de trabajo actualizada correctamente',
            'data' => $workOrder->fresh(['client', 'supplier', 'sale', 'product']),
        ]);
    }

    /**
     * Eliminar una orden de trabajo
     */
    public function destroy(WorkOrder $workOrder)
    {
        // Obtener las producciones de esta orden
        $productions = $workOrder->productions()->get();
        $productionIds = $productions->pluck('id')->toArray();
        
        if (!empty($productionIds)) {
            // Primero, desvincular todas las producciones que son hijos de otras en esta orden
            // Esto elimina las referencias antes de borrar
            \App\Models\Production::whereIn('id', $productionIds)
                ->update(['parent_production_id' => null]);
            
            // También desvincular otras producciones que puedan tener parent_production_id apuntando a producciones de esta OT
            \App\Models\Production::whereIn('parent_production_id', $productionIds)
                ->update(['parent_production_id' => null]);
            
            // Ahora eliminar las producciones
            $workOrder->productions()->delete();
        }
        
        // Eliminar la orden
        $workOrder->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Orden de trabajo eliminada correctamente',
        ]);
    }

    /**
     * Obtener estadísticas de órdenes de trabajo
     */
    public function stats()
    {
        $workOrders = WorkOrder::all();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total' => $workOrders->count(),
                'pending' => $workOrders->where('status', 'pending')->count(),
                'inProgress' => $workOrders->where('status', 'in_progress')->count(),
                'completed' => $workOrders->where('status', 'completed')->count(),
                'cancelled' => $workOrders->where('status', 'cancelled')->count(),
                'onHold' => $workOrders->where('status', 'on_hold')->count(),
            ],
        ]);
    }

    /**
     * Obtener el estado del pipeline de producción
     */
    public function getPipelineStatus(WorkOrder $workOrder)
    {
        $productions = $workOrder->productions()
            ->with('process')
            ->orderBy('id')
            ->get();
        
        $pipelineStatus = [
            'pending' => 0,
            'ready' => 0,
            'running' => 0,
            'paused' => 0,
            'completed' => 0,
            'total' => 0,
        ];
        
        foreach ($productions as $production) {
            $status = strtolower($production->status);
            if (isset($pipelineStatus[$status])) {
                $pipelineStatus[$status]++;
            }
        }

        $pipelineStatus['total_processes'] = count($productions);
        
        return response()->json([
            'success' => true,
            'data' => [
                'work_order' => [
                    'id' => $workOrder->id,
                    'code' => $workOrder->code,
                    'product_name' => $workOrder->product_name,
                    'quantity' => $workOrder->quantity,
                    'status' => $workOrder->status,
                ],
                'pipeline_status' => $pipelineStatus,
                'processes' => $productions->map(function ($p) {
                    return [
                        'id' => $p->id,
                        'process_name' => $p->process?->name ?? 'Proceso',
                        'process_type' => $p->process?->processType?->name ?? '',
                        'mes_status' => strtoupper($p->status),
                        'planned_quantity' => $p->target_parts,
                        'quantity_produced' => $p->good_parts ?? 0,
                    ];
                }),
            ],
        ]);
    }
}
