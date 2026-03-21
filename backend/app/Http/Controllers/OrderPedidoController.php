<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OrderPedido;
use App\Models\OrderPedidoItem;
use App\Models\WarehouseMovement;
use App\Models\InventoryItem;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class OrderPedidoController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('ordenes_pedido.view'),
                only: ['index', 'show', 'stats', 'myOrders', 'available']
            ),
            new Middleware(
                PermissionMiddleware::using('ordenes_pedido.create'),
                only: ['store']
            ),
            new Middleware(
                PermissionMiddleware::using('ordenes_pedido.edit'),
                only: ['update', 'assign', 'pickUp', 'deliver']
            ),
            new Middleware(
                PermissionMiddleware::using('ordenes_pedido.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Listar todas las órdenes (admin)
     */
    public function index(Request $request)
    {
        $query = OrderPedido::with(['client', 'branch', 'supplier', 'items', 'sale']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('supplier_user_id')) {
            $query->where('supplier_user_id', $request->supplier_user_id);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $perPage = $request->integer('per_page', 50);

        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }

    /**
     * Obtener estadísticas de órdenes
     */
    public function stats()
    {
        $orders = OrderPedido::all();

        $byStatus = $orders->groupBy('status')->map->count();

        $pending = $orders->where('status', 'pending')->count();
        $assigned = $orders->where('status', 'assigned')->count();
        $pickedUp = $orders->where('status', 'picked_up')->count();
        $inTransit = $orders->where('status', 'in_transit')->count();
        $delivered = $orders->where('status', 'delivered')->count();
        $cancelled = $orders->where('status', 'cancelled')->count();

        return response()->json([
            'total' => $orders->count(),
            'pending' => $pending,
            'assigned' => $assigned,
            'picked_up' => $pickedUp,
            'in_transit' => $inTransit,
            'delivered' => $delivered,
            'cancelled' => $cancelled,
            'byStatus' => $byStatus,
        ]);
    }

    /**
     * Órdenes disponibles para asignar
     */
    public function available(Request $request)
    {
        $query = OrderPedido::with(['client', 'branch', 'items'])
            ->where('status', 'pending');

        $perPage = $request->integer('per_page', 50);

        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }
    
    /**
     * Crear nueva orden
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'nullable|string|max:255',
            'delivery_address' => 'nullable|string|max:500',
            'branch_id' => 'nullable|exists:branches,id',
            'branch_name' => 'nullable|string|max:255',
            'sale_id' => 'nullable|exists:sales,id',
            'notes' => 'nullable|string',
            'pickup_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'supplier_name' => 'nullable|string|max:255',
            'evidence' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.product_code' => 'nullable|string|max:100',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Si tiene branch_id, obtener datos de la sucursal
        if (!empty($data['branch_id'])) {
            $branch = \App\Models\Branch::find($data['branch_id']);
            if ($branch) {
                $data['branch_name'] = $branch->name;
                $data['client_id'] = $branch->client_id;
                $data['client_name'] = $branch->client_name;
                // Si no hay dirección de entrega, usar la de la sucursal
                if (empty($data['delivery_address'])) {
                    $data['delivery_address'] = $branch->address;
                }
            }
        }

        // Si tiene client_id pero no client_name
        if (!empty($data['client_id']) && empty($data['client_name'])) {
            $client = \App\Models\Client::find($data['client_id']);
            if ($client) {
                $data['client_name'] = $client->name;
            }
        }

        // Generar número de orden
        $data['order_number'] = OrderPedido::generateOrderNumber();
        $data['created_by'] = $request->user()->id;
        $data['status'] = 'pending';

        // Procesar archivo de evidencia si existe
        if ($request->hasFile('evidence')) {
            $file = $request->file('evidence');
            $filename = 'evidence-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = 'evidence';
            $file->storeAs($path, $filename, 'public');
            $data['delivery_photo'] = asset('storage/' . $path . '/' . $filename);
        }

        // Crear orden
        $order = OrderPedido::create($data);

        // Crear items
        foreach ($data['items'] as $item) {
            OrderPedidoItem::create([
                'order_pedido_id' => $order->id,
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'],
                'product_code' => $item['product_code'] ?? null,
                'quantity' => $item['quantity'],
                'unit' => $item['unit'] ?? null,
            ]);
        }

        return response()->json(
            OrderPedido::with(['client', 'branch', 'supplier', 'items', 'sale'])->find($order->id),
            201
        );
    }

    /**
     * Ver detalles de una orden
     */
    public function show($id)
    {
        $order = OrderPedido::with(['client', 'branch', 'supplier', 'items'])->findOrFail($id);
        return response()->json($order);
    }

    /**
     * Actualizar orden
     */
    public function update(Request $request, $id)
    {
        $order = OrderPedido::findOrFail($id);

        if (!$order->canBeEdited()) {
            return response()->json(['error' => 'La orden no puede ser editada en su estado actual'], 422);
        }

        $validator = Validator::make($request->all(), [
            'client_id' => 'nullable|exists:clients,id',
            'client_name' => 'nullable|string|max:255',
            'delivery_address' => 'nullable|string|max:500',
            'branch_id' => 'nullable|exists:branches,id',
            'branch_name' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'pickup_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'supplier_name' => 'nullable|string|max:255',
            'evidence' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf|max:5120',
            'status' => 'sometimes|in:pending,assigned,picked_up,in_transit,delivered,cancelled',
            'items' => 'sometimes|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.product_code' => 'nullable|string|max:100',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Procesar archivo de evidencia si existe
        if ($request->hasFile('evidence')) {
            $file = $request->file('evidence');
            $filename = 'evidence-' . time() . '-' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = 'evidence';
            $file->storeAs($path, $filename, 'public');
            $data['delivery_photo'] = asset('storage/' . $path . '/' . $filename);
        }

        $order->update($data);

        // Actualizar items si se enviaron
        if ($request->has('items')) {
            // Eliminar items existentes
            $order->items()->delete();
            
            // Crear nuevos items
            foreach ($data['items'] as $item) {
                OrderPedidoItem::create([
                    'order_pedido_id' => $order->id,
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $item['product_name'],
                    'product_code' => $item['product_code'] ?? null,
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'] ?? null,
                ]);
            }
        }

        return response()->json(OrderPedido::with(['client', 'branch', 'supplier', 'items'])->find($order->id));
    }

    /**
     * Asignar orden a proveedor
     */
    public function assign(Request $request, $id)
    {
        $order = OrderPedido::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Solo se pueden asignar órdenes pendientes'], 422);
        }

        $validator = Validator::make($request->all(), [
            'supplier_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'status' => 'assigned',
        ];

        if ($request->filled('supplier_name')) {
            $data['supplier_name'] = $request->supplier_name;
        }

        $order->update($data);

        return response()->json(OrderPedido::with(['client', 'branch', 'supplier', 'items'])->find($order->id));
    }

    /**
     * Registrar recogida
     */
    public function pickUp(Request $request, $id)
    {
        $order = OrderPedido::findOrFail($id);

        if (!$order->canBePickedUp()) {
            return response()->json(['error' => 'La orden no puede ser marcada como recogida en su estado actual'], 422);
        }

        $validator = Validator::make($request->all(), [
            'picked_up_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['picked_up_at'] = $data['picked_up_at'] ?? now();
        $data['status'] = 'picked_up';

        // Descontar inventario por cada item
        $this->deductInventory($order);

        $order->update($data);

        return response()->json(OrderPedido::with(['client', 'branch', 'supplier', 'items'])->find($order->id));
    }

    /**
     * Descontar inventario al marcar como recogido
     */
    private function deductInventory(OrderPedido $order): void
    {
        $items = $order->items()->get();
        
        foreach ($items as $item) {
            // Si el item tiene product_id, buscar en InventoryItem
            if ($item->product_code ) {
                $inventoryItem = InventoryItem::where('code', $item->product_code)->first();
                
                if ($inventoryItem && $inventoryItem->quantity > 0) {
                    // Crear movimiento de salida
                    WarehouseMovement::create([
                        'inventory_item_id' => $inventoryItem->id,
                        'movement_type' => 'expense',
                        'quantity' => $item->quantity,
                        'quantity_before' => $inventoryItem->quantity,
                        'quantity_after' => $inventoryItem->quantity - $item->quantity,
                        'reference_type' => 'order_pedido',
                        'reference_id' => $order->id,
                        'notes' => 'Salida por orden de pedido: ' . $order->order_number . ' - Producto: ' . $item->product_name,
                        'performed_by' => auth()->user()->name ?? 'Sistema',
                        'status' => 'completed',
                    ]);

                    // Actualizar stock del inventario
                    $inventoryItem->decrement('quantity', $item->quantity);
                    $inventoryItem->update(['last_movement' => now()]);

                    // Sincronizar con Product o Material por código
                    $this->syncStockByCode($inventoryItem->code, $item->quantity, 'decrement');
                }
            }
        }
    }

    /**
     * Sincronizar stock con Products o Materials basado en el código
     */
    private function syncStockByCode(string $code, float $quantity, string $operation): void
    {
        // Buscar en products por código
        $product = \App\Models\Product::where('code', $code)->first();
        if ($product) {
            if ($operation === 'decrement') {
                $product->decrement('stock', $quantity);
            } else {
                $product->increment('stock', $quantity);
            }
            return;
        }

        // Buscar en materials por código
        $material = \App\Models\Material::where('code', $code)->first();
        if ($material) {
            if ($operation === 'decrement') {
                $material->decrement('stock', $quantity);
            } else {
                $material->increment('stock', $quantity);
            }
        }
    }

    /**
     * Registrar entrega
     */
    public function deliver(Request $request, $id)
    {
        $order = OrderPedido::findOrFail($id);

        if (!$order->canBeDelivered()) {
            return response()->json(['error' => 'La orden no puede ser marcada como entregada en su estado actual'], 422);
        }

        $validator = Validator::make($request->all(), [
            'delivered_at' => 'nullable|date',
            'delivery_photo' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['delivered_at'] = $data['delivered_at'] ?? now();
        $data['status'] = 'delivered';

        $order->update($data);

        return response()->json(OrderPedido::with(['client', 'branch', 'supplier', 'items'])->find($order->id));
    }

    /**
     * Eliminar orden
     */
    public function destroy($id)
    {
        $order = OrderPedido::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Solo se pueden eliminar órdenes pendientes'], 422);
        }

        // Eliminar items primero
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'Orden eliminada']);
    }
}
