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
                only: ['index', 'show', 'stats', 'upcoming', 'byMachine']
            ),

            new Middleware(
                PermissionMiddleware::using('maintenanceorders.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('maintenanceorders.edit'),
                only: ['update', 'start', 'complete']
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
            'code' => 'sometimes|string|max:255|unique:maintenance_orders,code',
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

        // Generar código automáticamente si no se proporciona
        if (!isset($data['code'])) {
            $data['code'] = 'MTO-' . date('Ymd') . '-' . str_pad(MaintenanceOrder::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
        }

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
            'machine_id' => 'sometimes|exists:machines,id',
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

        $data = $validator->validated();

        // Si machine_id cambió, actualizar machine_name
        if (isset($data['machine_id'])) {
            $machine = Machine::findOrFail($data['machine_id']);
            $data['machine_name'] = $machine->name;
        }

        $maintenanceOrder->update($data);
        return response()->json($maintenanceOrder->load('machine'));
    }

    public function destroy(MaintenanceOrder $maintenanceOrder)
    {
        $maintenanceOrder->delete();
        return response()->json(null, 204);
    }

    /**
     * Start maintenance order.
     */
    public function start(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $startDate = now();
        $maintenanceOrder->update([
            'status' => 'in-progress',
            'start_date' => $startDate,
        ]);

        \Log::info('Iniciando mantenimiento', [
            'maintenance_id' => $maintenanceOrder->id,
            'start_date' => $startDate,
            'start_date_type' => gettype($startDate)
        ]);

        // Actualizar estado de la máquina
        $machine = $maintenanceOrder->machine;
        $machine->update(['status' => 'maintenance']);

        $maintenanceOrder->refresh();
        return response()->json($maintenanceOrder->load('machine'));
    }

    /**
     * Complete maintenance order.
     */
    public function complete(Request $request, MaintenanceOrder $maintenanceOrder)
    {
        $data = $request->validate([
            'actual_hours' => 'sometimes|numeric|min:0',
            'actualHours' => 'sometimes|numeric|min:0', // Soporte para camelCase
            'actual_cost' => 'sometimes|numeric|min:0',
            'actualCost' => 'sometimes|numeric|min:0', // Soporte para camelCase
            'notes' => 'nullable|string',
        ]);

        // Normalizar a snake_case
        if (isset($data['actualHours'])) {
            $data['actual_hours'] = $data['actualHours'];
            unset($data['actualHours']);
        }
        if (isset($data['actualCost'])) {
            $data['actual_cost'] = $data['actualCost'];
            unset($data['actualCost']);
        }

        // Calcular horas reales automáticamente si no se proporcionan
        if (!isset($data['actual_hours']) && $maintenanceOrder->start_date) {
            $start = \Carbon\Carbon::parse($maintenanceOrder->start_date);
            $end = now();
            $diffMinutes = $start->diffInMinutes($end);
            $data['actual_hours'] = round($diffMinutes / 60, 2);
            \Log::info('Calculando horas reales', [
                'maintenance_id' => $maintenanceOrder->id,
                'start_date' => $maintenanceOrder->start_date,
                'end_date' => $end,
                'diff_minutes' => $diffMinutes,
                'actual_hours' => $data['actual_hours']
            ]);
        } elseif (!$maintenanceOrder->start_date) {
            \Log::warning('Mantenimiento sin start_date', ['maintenance_id' => $maintenanceOrder->id]);
        }

        $maintenanceOrder->update(array_merge($data, [
            'status' => 'completed',
            'end_date' => now(),
        ]));

        \Log::info('Mantenimiento actualizado', [
            'maintenance_id' => $maintenanceOrder->id,
            'data_sent' => $data,
            'actual_hours_saved' => $maintenanceOrder->actual_hours,
            'actual_cost_saved' => $maintenanceOrder->actual_cost
        ]);

        // Actualizar estado de la máquina
        $machine = $maintenanceOrder->machine;
        $machine->update(['status' => 'available']);

        $maintenanceOrder->refresh();
        return response()->json($maintenanceOrder->load('machine'));
    }

    /**
     * Get maintenance order statistics.
     */
    public function stats()
    {
        $orders = MaintenanceOrder::all();

        return response()->json([
            'total' => $orders->count(),
            'pending' => $orders->where('status', 'scheduled')->count(),
            'inProgress' => $orders->where('status', 'in-progress')->count(),
            'completed' => $orders->where('status', 'completed')->count(),
            'overdue' => $orders->where('status', 'scheduled')
                ->where('scheduled_date', '<', now())
                ->count(),
            'totalCost' => $orders->sum('actual_cost') ?: $orders->sum('estimated_cost'),
        ]);
    }

    /**
     * Get upcoming maintenance orders.
     */
    public function upcoming(Request $request)
    {
        $days = $request->integer('days', 7);

        $orders = MaintenanceOrder::with('machine')
            ->where('status', 'scheduled')
            ->where('scheduled_date', '>=', now())
            ->where('scheduled_date', '<=', now()->addDays($days))
            ->orderBy('scheduled_date')
            ->get();

        return response()->json($orders);
    }

    /**
     * Get maintenance orders by machine.
     */
    public function byMachine(Machine $machine)
    {
        $orders = MaintenanceOrder::with('machine')
            ->where('machine_id', $machine->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }
}
