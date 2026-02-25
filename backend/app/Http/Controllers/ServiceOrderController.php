<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceOrder;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ServiceOrderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('serviceorders.view'),
                only: ['index', 'show', 'stats']
            ),

            new Middleware(
                PermissionMiddleware::using('serviceorders.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('serviceorders.edit'),
                only: ['update', 'updateStatus']
            ),

            new Middleware(
                PermissionMiddleware::using('serviceorders.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = ServiceOrder::with('client')->orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:service_orders,code',
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:repair,maintenance,installation,consultation',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:pending,scheduled,in_progress,completed,cancelled',
            'assigned_to' => 'nullable|string|max:255',
            'estimated_hours' => 'sometimes|numeric|min:0',
            'actual_hours' => 'sometimes|numeric|min:0',
            'scheduled_date' => 'nullable|date',
            'completed_date' => 'nullable|date|after_or_equal:scheduled_date',
            'cost' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['status'] = $data['status'] ?? 'pending';
        $data['estimated_hours'] = $data['estimated_hours'] ?? 0;
        $data['actual_hours'] = $data['actual_hours'] ?? 0;
        $data['cost'] = $data['cost'] ?? 0;

        $item = ServiceOrder::create($data)->load('client');
        return response()->json($item, 201);
    }

    public function show(ServiceOrder $serviceOrder)
    {
        return response()->json($serviceOrder->load('client'));
    }

    public function update(Request $request, ServiceOrder $serviceOrder)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:repair,maintenance,installation,consultation',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'status' => 'sometimes|in:pending,scheduled,in_progress,completed,cancelled',
            'assigned_to' => 'nullable|string|max:255',
            'estimated_hours' => 'sometimes|numeric|min:0',
            'actual_hours' => 'sometimes|numeric|min:0',
            'scheduled_date' => 'nullable|date',
            'completed_date' => 'nullable|date|after_or_equal:scheduled_date',
            'cost' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $serviceOrder->update($validator->validated());
        return response()->json($serviceOrder->load('client'));
    }

    public function destroy(ServiceOrder $serviceOrder)
    {
        $serviceOrder->delete();
        return response()->json(null, 204);
    }

    /**
     * Update service order status.
     */
    public function updateStatus(Request $request, ServiceOrder $serviceOrder)
    {
        $data = $request->validate([
            'status' => 'required|string|in:pending,scheduled,in_progress,completed,cancelled',
        ]);

        $serviceOrder->update($data);

        // Actualizar fecha de completado si aplica
        if ($data['status'] === 'completed') {
            $serviceOrder->update(['completed_date' => now()]);
        }

        return response()->json($serviceOrder->load('client'));
    }

    /**
     * Get service order statistics.
     */
    public function stats()
    {
        $orders = ServiceOrder::all();

        return response()->json([
            'total' => $orders->count(),
            'pending' => $orders->where('status', 'pending')->count(),
            'scheduled' => $orders->where('status', 'scheduled')->count(),
            'inProgress' => $orders->where('status', 'in_progress')->count(),
            'completed' => $orders->where('status', 'completed')->count(),
            'cancelled' => $orders->where('status', 'cancelled')->count(),
        ]);
    }
}
