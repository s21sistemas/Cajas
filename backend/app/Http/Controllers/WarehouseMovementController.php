<?php

namespace App\Http\Controllers;

use App\Models\WarehouseMovement;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WarehouseMovementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('warehouse-movements.view'),
                only: ['index', 'show', 'byInventoryItem']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouse-movements.create'),
                only: ['store', 'registerIncome', 'registerExpense']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouse-movements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouse-movements.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = WarehouseMovement::query()->with(['inventoryItem', 'warehouseLocation', 'warehouseLocationTo']);

        // Filtros
        if ($request->has('movement_type') && $request->movement_type && $request->movement_type !== 'all') {
            $query->where('movement_type', $request->movement_type);
        }

        if ($request->has('inventory_item_id') && $request->inventory_item_id) {
            $query->where('inventory_item_id', $request->inventory_item_id);
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('inventoryItem', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // Fechas
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $movements = $query->orderByDesc('created_at')->paginate($perPage);

        return $this->paginated($movements, 'Movimientos de almacén listados correctamente');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'movement_type' => 'required|in:income,expense,adjustment,transfer',
            'quantity' => 'required|numeric|min:0.001',
            'warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'warehouse_location_to_id' => 'nullable|exists:warehouse_locations,id',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,completed,cancelled',
        ]);

        $movement = WarehouseMovement::register($data);

        return $this->created($movement->load(['inventoryItem', 'warehouseLocation']), 'Movimiento de almacén registrado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(WarehouseMovement $warehouseMovement)
    {
        return $this->success($warehouseMovement->load(['inventoryItem', 'warehouseLocation', 'warehouseLocationTo']), 'Movimiento de almacén obtenido correctamente');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WarehouseMovement $warehouseMovement)
    {
        $data = $request->validate([
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,completed,cancelled',
        ]);

        $warehouseMovement->update($data);

        return $this->success($warehouseMovement, 'Movimiento de almacén actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WarehouseMovement $warehouseMovement)
    {
        // Solo permitir eliminar movimientos pendientes
        if ($warehouseMovement->status !== 'pending') {
            return $this->error('Solo se pueden eliminar movimientos pendientes');
        }

        $warehouseMovement->delete();

        return $this->deleted('Movimiento de almacén eliminado correctamente');
    }

    /**
     * Registrar ingreso al almacén
     */
    public function registerIncome(Request $request)
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|numeric|min:0.001',
            'warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string|max:255',
        ]);

        $data['movement_type'] = 'income';
        
        $movement = WarehouseMovement::register($data);

        return $this->created($movement->load(['inventoryItem', 'warehouseLocation']), 'Ingreso al almacén registrado correctamente');
    }

    /**
     * Registrar egreso del almacén
     */
    public function registerExpense(Request $request)
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|numeric|min:0.001',
            'warehouse_location_id' => 'nullable|exists:warehouse_locations,id',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|integer',
            'notes' => 'nullable|string',
            'performed_by' => 'nullable|string|max:255',
        ]);

        // Verificar que hay suficiente stock
        $inventoryItem = InventoryItem::findOrFail($data['inventory_item_id']);
        if ($inventoryItem->quantity < $data['quantity']) {
            return $this->error('Stock insuficiente. Disponible: ' . $inventoryItem->quantity);
        }

        $data['movement_type'] = 'expense';
        
        $movement = WarehouseMovement::register($data);

        return $this->created($movement->load(['inventoryItem', 'warehouseLocation']), 'Egreso del almacén registrado correctamente');
    }

    /**
     * Obtener movimientos por item de inventario
     */
    public function byInventoryItem(Request $request, int $inventoryItemId)
    {
        $perPage = $request->integer('per_page', 15);
        
        $movements = WarehouseMovement::where('inventory_item_id', $inventoryItemId)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->paginated($movements, 'Movimientos del item obtenidos correctamente');
    }

    /**
     * Obtener estadísticas del almacén
     */
    public function stats()
    {
        $totalIncome = WarehouseMovement::where('movement_type', 'income')
            ->where('status', 'completed')
            ->sum('quantity');
            
        $totalExpense = WarehouseMovement::where('movement_type', 'expense')
            ->where('status', 'completed')
            ->sum('quantity');
            
        $totalAdjustments = WarehouseMovement::where('movement_type', 'adjustment')
            ->where('status', 'completed')
            ->count();

        $pendingMovements = WarehouseMovement::where('status', 'pending')->count();

        return $this->success([
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_movement' => $totalIncome - $totalExpense,
            'total_adjustments' => $totalAdjustments,
            'pending_movements' => $pendingMovements,
        ], 'Estadísticas de almacén obtenidas correctamente');
    }
}
