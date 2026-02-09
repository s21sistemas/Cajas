<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaintenanceOrder;
use App\Models\Machine;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MaintenanceOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('maintenanceorders.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('maintenanceorders.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('maintenanceorders.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('maintenanceorders.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = MaintenanceOrder::with('machine')->orderByDesc('scheduled_date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:maintenance_orders,code',
            'machine_id' => 'required|exists:machines,id',
            'type' => 'required|in:preventive,corrective,predictive,emergency',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'status' => 'sometimes|in:scheduled,in-progress,completed,cancelled',
            'description' => 'nullable|string',
            'scheduled_date' => 'required|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'technician' => 'nullable|string|max:255',
            'estimated_hours' => 'sometimes|numeric|min:0',
            'actual_hours' => 'sometimes|numeric|min:0',
            'estimated_cost' => 'sometimes|numeric|min:0',
            'actual_cost' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $machine = Machine::findOrFail($data['machine_id']);
        $data['machine_name'] = $machine->name;
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['status'] = $data['status'] ?? 'scheduled';
        $data['estimated_hours'] = $data['estimated_hours'] ?? 0;
        $data['actual_hours'] = $data['actual_hours'] ?? 0;
        $data['estimated_cost'] = $data['estimated_cost'] ?? 0;
        $data['actual_cost'] = $data['actual_cost'] ?? 0;

        $item = MaintenanceOrder::create($data)->load('machine');
        return response()->json($item, 201);
    }

    public function show(MaintenanceOrder $maintenanceOrder)
    {
        return response()->json($maintenanceOrder->load('machine'));
    }

    public function update(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:preventive,corrective,predictive,emergency',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'status' => 'sometimes|in:scheduled,in-progress,completed,cancelled',
            'description' => 'nullable|string',
            'scheduled_date' => 'sometimes|date',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'technician' => 'nullable|string|max:255',
            'estimated_hours' => 'sometimes|numeric|min:0',
            'actual_hours' => 'sometimes|numeric|min:0',
            'estimated_cost' => 'sometimes|numeric|min:0',
            'actual_cost' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $maintenanceOrder->update($validator->validated());
        return response()->json($maintenanceOrder->load('machine'));
    }

    public function destroy(MaintenanceOrder $maintenanceOrder)
    {
        $maintenanceOrder->delete();
        return response()->json(null, 204);
    }
}
