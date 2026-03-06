<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventoryItem;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class InventoryItemController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('inventoryitems.view'),
                only: ['index', 'show', 'stats', 'lowStock', 'byCategory', 'byLocation']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.edit'),
                only: ['update', 'updateQuantity']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 100);
        $query = InventoryItem::with('warehouseLocation')->orderBy('code');

        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->has('warehouse') && $request->warehouse) {
            $query->where('warehouse', $request->warehouse);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'sometimes|numeric|min:0',
            'min_stock' => 'sometimes|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'warehouse_location_id' => 'nullable|integer',
            'last_movement' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['quantity'] = $data['quantity'] ?? 0;
        $data['min_stock'] = $data['min_stock'] ?? 0;

        $item = InventoryItem::create($data);
        return response()->json($item, 201);
    }

    public function show(InventoryItem $inventoryItem)
    {
        return response()->json($inventoryItem);
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'category' => 'required|string|max:255',
            'quantity' => 'sometimes|numeric|min:0',
            'min_stock' => 'sometimes|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_cost' => 'sometimes|numeric|min:0',
            'warehouse_location_id' => 'nullable|integer',
            'last_movement' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $inventoryItem->update($validator->validated());
        return response()->json($inventoryItem);
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();
        return response()->json(null, 204);
    }

    /**
     * Get inventory statistics.
     */
    public function stats()
    {
        $items = InventoryItem::all();

        $byCategory = $items->groupBy('category')->map->count();

        return response()->json([
            'total' => $items->count(),
            'totalValue' => $items->sum(fn($i) => $i->quantity * $i->unit_cost),
            'lowStock' => $items->where('quantity', '>', 0)->where('quantity', '<=', fn($q) => $q->min_stock)->count(),
            'outOfStock' => $items->where('quantity', 0)->count(),
            'byCategory' => $byCategory,
        ]);
    }

    /**
     * Get items with low stock.
     */
    public function lowStock()
    {
        $items = InventoryItem::where('quantity', '>', 0)
            ->whereColumn('quantity', '<=', 'min_stock')
            ->orderBy('quantity')
            ->get();

        return response()->json($items);
    }

    /**
     * Get items by category.
     */
    public function byCategory(Request $request)
    {
        $category = $request->get('category');
        $items = InventoryItem::where('category', $category)->orderBy('name')->get();

        return response()->json($items);
    }

    /**
     * Get items by location.
     */
    public function byLocation(Request $request)
    {
        $locationId = $request->get('location_id');
        $items = InventoryItem::where('location', 'like', "%{$locationId}%")->orderBy('name')->get();

        return response()->json($items);
    }

    /**
     * Update item quantity.
     */
    public function updateQuantity(Request $request, InventoryItem $inventoryItem)
    {
        $data = $request->validate([
            'quantity' => 'required|numeric',
            'reason' => 'nullable|string|max:255',
        ]);

        $inventoryItem->update([
            'quantity' => $data['quantity'],
            'last_movement' => now(),
        ]);

        return response()->json($inventoryItem);
    }
}
