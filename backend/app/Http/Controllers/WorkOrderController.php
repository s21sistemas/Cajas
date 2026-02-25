<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrder;
use App\Models\WorkOrderItem;
use App\Models\WorkOrderProcess;
use App\Models\Production;
use App\Models\ProductProcess;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
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
                only: ['index', 'show', 'getItems', 'getProcesses', 'stats']
            ),
            
            new Middleware(
                PermissionMiddleware::using('workorders.create'),
                only: ['store', 'addItem', 'getProducts', 'getClients', 'getSuppliers']
            ),

            new Middleware(
                PermissionMiddleware::using('workorders.edit'),
                only: ['update', 'updateStatus', 'updateProgress']
            ),

            new Middleware(
                PermissionMiddleware::using('workorders.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $query = WorkOrder::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('product_name', 'like', "%{$search}%")
                  ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            // Aceptar múltiples statuses separados por coma
            $statuses = explode(',', $request->status);
            if (count($statuses) > 1) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $request->status);
            }
        }

        if ($request->has('priority') && $request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        $perPage = $request->integer('per_page', 15);

        $workOrders = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($workOrders);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'client_id' => 'nullable|exists:clients,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_name' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'completed' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,pending,approved,ordered,partial,received,in_progress,completed,cancelled,on_hold',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'expected_date' => 'nullable|date',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_time' => 'sometimes|numeric|min:0',
            'actual_time' => 'sometimes|numeric|min:0',
            'cancellation_reason' => 'nullable|string|max:255',
            // Campos de precios
            'unit_price' => 'sometimes|numeric|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'iva' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            // Campos de pago
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Si hay product_id pero no product_name, obtener el nombre del producto
        if (!empty($data['product_id']) && empty($data['product_name'])) {
            $product = \App\Models\Product::find($data['product_id']);
            if ($product) {
                $data['product_name'] = $product->name;
            }
        }
        
        // Si no hay product_id ni product_name, usar un valor por defecto
        if (empty($data['product_id']) && empty($data['product_name'])) {
            $data['product_name'] = 'Producto sin especificar';
        }
        
        // Si hay client_id, obtener el nombre del cliente
        if (!empty($data['client_id'])) {
            $client = \App\Models\Client::find($data['client_id']);
            if ($client) {
                $data['client_name'] = $client->name;
            }
        }
        
        // Si hay supplier_id, obtener el nombre del proveedor
        if (!empty($data['supplier_id'])) {
            $supplier = \App\Models\Supplier::find($data['supplier_id']);
            if ($supplier) {
                $data['supplier_name'] = $supplier->name;
            }
        }
        
        // Calcular totales automáticamente si se proporciona quantity y unit_price
        if (isset($data['quantity']) && isset($data['unit_price'])) {
            $data['subtotal'] = $data['quantity'] * $data['unit_price'];
            $data['iva'] = $data['subtotal'] * 0.16; // 16% IVA
            $data['total'] = $data['subtotal'] + $data['iva'];
        }
        
        $data['completed'] = $data['completed'] ?? 0;
        $data['status'] = $data['status'] ?? 'draft';
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['progress'] = $data['progress'] ?? 0;
        $data['estimated_time'] = $data['estimated_time'] ?? 0;
        $data['actual_time'] = $data['actual_time'] ?? 0;
        $data['payment_type'] = $data['payment_type'] ?? 'cash';
        $data['credit_days'] = $data['credit_days'] ?? 0;

        $item = WorkOrder::create($data);
        
        $productions = [];
        
        // Si hay product_id, crear las Productions basadas en los procesos del producto
        if (!empty($data['product_id'])) {
            try {
                $productProcesses = ProductProcess::where('product_id', $data['product_id'])
                    ->orderBy('sequence')
                    ->get();
                
                foreach ($productProcesses as $pp) {
                    Production::create([
                        'work_order_id' => $item->id,
                        'product_process_id' => $pp->id,
                        'process_id' => $pp->process_id,
                        'target_parts' => $data['quantity'],
                        'status' => 'pending',
                        'start_time' => now(),
                    ]);
                }
                
                // Obtener las productions creadas
                $productions = Production::where('work_order_id', $item->id)->get();
            } catch (\Exception $e) {
                // Si falla la creación de productions, no fallar la orden de trabajo
                \Log::error('Error creating productions: ' . $e->getMessage());
            }
        }
        
        return response()->json([
            'work_order' => $item,
            'productions' => $productions
        ], 201);
    }

    public function show(WorkOrder $workOrder)
    {
        return response()->json($workOrder);
    }

    public function update(Request $request, WorkOrder $workOrder)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'client_id' => 'nullable|exists:clients,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_name' => 'sometimes|string|max:255',
            'quantity' => 'sometimes|integer|min:1',
            'completed' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,pending,approved,ordered,partial,received,in_progress,completed,cancelled,on_hold',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'expected_date' => 'nullable|date',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_time' => 'sometimes|numeric|min:0',
            'actual_time' => 'sometimes|numeric|min:0',
            'cancellation_reason' => 'nullable|string|max:255',
            // Campos de precios
            'unit_price' => 'sometimes|numeric|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'iva' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            // Campos de pago
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Si hay product_id, obtener el nombre del producto
        if (isset($data['product_id']) && !empty($data['product_id'])) {
            $product = \App\Models\Product::find($data['product_id']);
            if ($product) {
                $data['product_name'] = $product->name;
            }
        }
        
        // Si hay client_id, obtener el nombre del cliente
        if (isset($data['client_id']) && !empty($data['client_id'])) {
            $client = \App\Models\Client::find($data['client_id']);
            if ($client) {
                $data['client_name'] = $client->name;
            }
        }

        // Si hay supplier_id, obtener el nombre del proveedor
        if (isset($data['supplier_id']) && !empty($data['supplier_id'])) {
            $supplier = \App\Models\Supplier::find($data['supplier_id']);
            if ($supplier) {
                $data['supplier_name'] = $supplier->name;
            }
        }

        // Calcular totales automáticamente si se proporciona quantity y unit_price
        if (isset($data['quantity']) || isset($data['unit_price'])) {
            $quantity = $data['quantity'] ?? $workOrder->quantity;
            $unitPrice = $data['unit_price'] ?? $workOrder->unit_price;
            $data['subtotal'] = $quantity * $unitPrice;
            $data['iva'] = $data['subtotal'] * 0.16; // 16% IVA
            $data['total'] = $data['subtotal'] + $data['iva'];
        }

        $workOrder->update($data);
        return response()->json($workOrder);
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();
        return response()->json(['message' => 'Orden de trabajo eliminada correctamente']);
    }

    /**
     * Update work order status.
     */
    public function updateStatus(Request $request, WorkOrder $workOrder)
    {
        $data = $request->validate([
            'status' => 'required|string|in:draft,in_progress,completed,cancelled,on_hold',
        ]);

        $workOrder->update($data);

        // Actualizar progreso según estado
        if ($data['status'] === 'completed') {
            $workOrder->update(['progress' => 100, 'completed' => $workOrder->quantity]);
        } elseif ($data['status'] === 'in_progress' && $workOrder->progress === 0) {
            $workOrder->update(['progress' => 10]);
        }

        return response()->json($workOrder);
    }

    /**
     * Update work order progress.
     */
    public function updateProgress(Request $request, WorkOrder $workOrder)
    {
        $data = $request->validate([
            'completed' => 'required|integer|min:0|max:' . $workOrder->quantity,
        ]);

        $workOrder->update($data);

        // Actualizar progreso basado en cantidad completada
        $progress = ($data['completed'] / $workOrder->quantity) * 100;
        $workOrder->update(['progress' => round($progress)]);

        // Si está completo, actualizar estado
        if ($data['completed'] >= $workOrder->quantity) {
            $workOrder->update(['status' => 'completed', 'progress' => 100]);
        }

        return response()->json($workOrder);
    }

    /**
     * Get work order items.
     */
    public function getItems(WorkOrder $workOrder)
    {
        $items = $workOrder->items;
        return response()->json($items);
    }

    /**
     * Add item to work order.
     */
    public function addItem(Request $request, WorkOrder $workOrder)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'width' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0',
            'depth' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['work_order_id'] = $workOrder->id;

        $item = WorkOrderItem::create($data);

        return response()->json($item, 201);
    }

    /**
     * Get work order processes.
     */
    public function getProcesses(WorkOrder $workOrder)
    {
        $processes = $workOrder->processes;
        return response()->json($processes);
    }

    /**
     * Get work order productions.
     */
    public function getProductions(WorkOrder $workOrder)
    {
        $productions = $workOrder->productions()->with(['process', 'machine', 'operator', 'productProcess'])->get();
        return response()->json($productions);
    }

    public function stats()
    {
        $workOrders = WorkOrder::all();
        $data = [
            'total' => $workOrders->count(),
            'pending' => $workOrders->where('status', 'draft')->count(),
            'inProgress' => $workOrders->where('status', 'in_progress')->count(),
            'completed' => $workOrders->where('status', 'completed')->count(),
            'cancelled' => $workOrders->where('status', 'cancelled')->count(),
            'onHold' => $workOrders->where('status', 'on_hold')->count(),
        ];

        return response()->json($data);
    }

    /**
     * Get work orders assigned to current operator
     */
    public function getAssigned(Request $request)
    {
        $query = WorkOrder::query()
            ->whereIn('status', ['draft', 'in_progress'])
            ->orderBy('priority', 'desc')
            ->orderBy('due_date', 'asc');

        // Si se pasa operador por parámetro, filtrar
        if ($request->has('operator') && $request->operator) {
            $query->where('operator', 'like', '%' . $request->operator . '%');
        }

        $perPage = $request->integer('per_page', 15);
        $workOrders = $query->paginate($perPage);

        return response()->json($workOrders);
    }

    /**
     * Mark work order as complete and transfer to finished goods inventory
     */
    public function markComplete(WorkOrder $workOrder)
    {
        $result = $workOrder->transferToFinishedInventory();

        if ($result['success']) {
            return response()->json($result['data']);
        }

        return response()->json(['error' => $result['message']], 400);
    }

    /**
     * Get products for work order form (requires workorders.create permission)
     */
    public function getProducts(Request $request)
    {
        $query = \App\Models\Product::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 100);
        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get clients for work order form (requires workorders.create permission)
     */
    public function getClients(Request $request)
    {
        $query = \App\Models\Client::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 100);
        $clients = $query->latest()->paginate($perPage);

        return response()->json($clients);
    }

    /**
     * Get suppliers for work order form (requires workorders.create permission)
     */
    public function getSuppliers(Request $request)
    {
        $query = \App\Models\Supplier::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 100);
        $suppliers = $query->latest()->paginate($perPage);

        return response()->json($suppliers);
    }
}
