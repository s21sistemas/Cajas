<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderItem;

class WorkOrderItemController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkOrderItem::query();

        if ($request->filled('work_order_id')) {
            $query->where('work_order_id', $request->integer('work_order_id'));
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'product_name' => 'required|string|max:255',
            'width' => 'required|numeric|min:0',
            'height' => 'required|numeric|min:0',
            'depth' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
        ]);

        $item = WorkOrderItem::create($validated);

        return response()->json($item, 201);
    }

    public function show(WorkOrderItem $workOrderItem)
    {
        return response()->json($workOrderItem);
    }

    public function update(Request $request, WorkOrderItem $workOrderItem)
    {
        $validated = $request->validate([
            'product_name' => 'sometimes|required|string|max:255',
            'width' => 'sometimes|required|numeric|min:0',
            'height' => 'sometimes|required|numeric|min:0',
            'depth' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:1',
        ]);

        $workOrderItem->update($validated);

        return response()->json($workOrderItem);
    }

    public function destroy(WorkOrderItem $workOrderItem)
    {
        $workOrderItem->delete();

        return response()->json(null, 204);
    }
}
