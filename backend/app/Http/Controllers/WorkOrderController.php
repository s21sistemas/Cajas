<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrder;
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

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = WorkOrder::orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'required|string|max:255',
            'client_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'completed' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,in_progress,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'machine' => 'nullable|string|max:255',
            'operator' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_time' => 'sometimes|numeric|min:0',
            'actual_time' => 'sometimes|numeric|min:0',
            'cancellation_reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['completed'] = $data['completed'] ?? 0;
        $data['status'] = $data['status'] ?? 'draft';
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['progress'] = $data['progress'] ?? 0;
        $data['estimated_time'] = $data['estimated_time'] ?? 0;
        $data['actual_time'] = $data['actual_time'] ?? 0;

        $item = WorkOrder::create($data);
        return response()->json($item, 201);
    }

    public function show(WorkOrder $workOrder)
    {
        return response()->json($workOrder);
    }

    public function update(Request $request, WorkOrder $workOrder)
    {
        $validator = Validator::make($request->all(), [
            'product_name' => 'sometimes|required|string|max:255',
            'client_name' => 'sometimes|required|string|max:255',
            'quantity' => 'sometimes|integer|min:0',
            'completed' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,in_progress,completed,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'machine' => 'nullable|string|max:255',
            'operator' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date|after_or_equal:start_date',
            'progress' => 'sometimes|integer|min:0|max:100',
            'estimated_time' => 'sometimes|numeric|min:0',
            'actual_time' => 'sometimes|numeric|min:0',
            'cancellation_reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $workOrder->update($validator->validated());
        return response()->json($workOrder);
    }

    public function destroy(WorkOrder $workOrder)
    {
        $workOrder->delete();
        return response()->json(null, 204);
    }
}
