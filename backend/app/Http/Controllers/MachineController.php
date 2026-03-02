<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MachineController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),

            new Middleware(
                PermissionMiddleware::using('machines.view'),
                only: ['index', 'show', 'stats', 'utilization']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.edit'),
                only: ['update', 'updateStatus', 'startOperation', 'stopOperation', 'scheduleMaintenance', 'completeMaintenance']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Machine::query();

        // Filtro por búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtro por tipo
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $perPage = $request->integer('per_page', 15);
        $machines = $query->orderBy('name')->paginate($perPage);

        return response()->json($machines);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:255|unique:machines,code',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'axes' => 'required|integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 'available';
        }

        $machine = Machine::create($data);
        return response()->json($machine, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Machine $machine)
    {
        return response()->json($machine);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Machine $machine)
    {
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:machines,code,' . $machine->id,
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'axes' => 'sometimes|required|integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $machine->update($data);
        return response()->json($machine);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Machine $machine)
    {
        $machine->delete();
        return response()->json(null, 204);
    }

    /**
     * Update machine status.
     */
    public function updateStatus(Request $request, Machine $machine)
    {
        $data = $request->validate([
            'status' => 'required|string|in:available,running,maintenance,offline',
        ]);

        $machine->update($data);
        return response()->json($machine);
    }

    /**
     * Start machine operation.
     */
    public function startOperation(Request $request, Machine $machine)
    {
        $machine->update(['status' => 'running']);
        return response()->json($machine);
    }

    /**
     * Stop machine operation.
     */
    public function stopOperation(Request $request, Machine $machine)
    {
        $machine->update(['status' => 'available']);
        return response()->json($machine);
    }

    /**
     * Schedule maintenance for a machine.
     */
    public function scheduleMaintenance(Request $request, Machine $machine)
    {
        $data = $request->validate([
            'type' => 'required|string|in:preventive,corrective,predictive',
            'notes' => 'nullable|string',
            'scheduled_date' => 'required|date',
        ]);

        // Crear orden de mantenimiento
        $maintenanceOrder = \App\Models\MaintenanceOrder::create([
            'code' => 'MANT-' . time(),
            'machine_id' => $machine->id,
            'machine_name' => $machine->name,
            'type' => $data['type'],
            'status' => 'scheduled',
            'scheduled_date' => $data['scheduled_date'],
            'notes' => $data['notes'] ?? null,
            'priority' => 'medium',
        ]);

        return response()->json($maintenanceOrder->load('machine'), 201);
    }

    /**
     * Complete maintenance for a machine.
     */
    public function completeMaintenance(Request $request, Machine $machine)
    {
        $machine->update(['status' => 'available']);

        $machine->orders()->where('status', 'in-progress')->update([
            'status' => 'completed',
            'end_date' => now(),
        ]);

        return response()->json($machine);
    }

    /**
     * Get machine utilization data.
     */
    public function utilization(Request $request)
    {
        $machines = Machine::all();

        $utilization = $machines->map(function ($machine) {
            return [
                'id' => $machine->id,
                'code' => $machine->code,
                'name' => $machine->name,
                'status' => $machine->status,
                'utilizationRate' => match ($machine->status) {
                    'running' => rand(70, 95),
                    'available' => rand(10, 30),
                    'maintenance' => 0,
                    'offline' => 0,
                    default => 0,
                },
            ];
        });

        return response()->json($utilization);
    }

    /**
     * Get machine statistics.
     */
    public function stats()
    {
        $machines = Machine::all();

        $data = [
            'total' => $machines->count(),
            'running' => $machines->where('status', 'running')->count(),
            'available' => $machines->where('status', 'available')->count(),
            'maintenance' => $machines->where('status', 'maintenance')->count(),
            'offline' => $machines->where('status', 'offline')->count(),
            'averageUtilization' => 0,
        ];

        return response()->json($data);
    }

    /**
     * Select list for forms (only requires auth, no permissions).
     */
    public function selectList()
    {
        $machines = Machine::select('id', 'name', 'code')->orderBy('name')->get();
        return response()->json($machines);
    }
}
