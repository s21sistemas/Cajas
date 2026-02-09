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
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('inventoryitems.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = InventoryItem::orderBy('code')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:inventory_items,code',
            'name' => 'required|string|max:255',
            'category' => 'required|in:raw_material,component,tool,consumable',
            'quantity' => 'sometimes|numeric|min:0',
            'min_stock' => 'sometimes|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_cost' => 'required|numeric|min:0',
            'location' => 'nullable|string|max:255',
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
            'category' => 'sometimes|in:raw_material,component,tool,consumable',
            'quantity' => 'sometimes|numeric|min:0',
            'min_stock' => 'sometimes|numeric|min:0',
            'max_stock' => 'nullable|numeric|min:0',
            'unit_cost' => 'sometimes|numeric|min:0',
            'location' => 'nullable|string|max:255',
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
}
