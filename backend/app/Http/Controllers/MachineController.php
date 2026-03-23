<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use App\Models\MachineMovement;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MachineController extends Controller implements HasMiddleware
{
    /**
     * Create a machine movement record.
     */
    private function createMovement(
        Machine $machine,
        string $type,
        string $status,
        ?string $notes = null,
        ?int $productionId = null,
        ?int $operatorId = null
    ): MachineMovement {
        return MachineMovement::create([
            'machine_id' => $machine->id,
            'production_id' => $productionId,
            'operator_id' => $operatorId,
            'start_time' => now(),
            'type' => $type,
            'status' => $status,
            'notes' => $notes,
        ]);
    }

    /**
     * Close the last active movement for a machine.
     */
    private function closeActiveMovement(Machine $machine, ?string $notes = null): ?MachineMovement
    {
        $activeMovement = $machine->movements()
            ->where('status', 'active')
            ->latest('start_time')
            ->first();

        if ($activeMovement) {
            $activeMovement->update([
                'end_time' => now(),
                'status' => 'completed',
                'notes' => $notes ?? $activeMovement->notes,
            ]);
        }

        return $activeMovement;
    }

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
                PermissionMiddleware::using('machines.force_delete.delete'),
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
        
        // Agregar utilización a cada máquina
        $machines->getCollection()->transform(function ($machine) {
            $machine->utilization = $machine->getCurrentWeekUtilization();
            return $machine;
        });

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
            'axes' => 'integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            "brand" => 'nullable|string',
            "model" => 'nullable|string',
            "location" => 'nullable|string',
        ]);

        if (!isset($data['status'])) {
            $data['status'] = 'available';
        }

        $machine = Machine::create($data);
        
        // Registrar movimiento de creación
        $this->createMovement(
            $machine,
            'creation',
            'active',
            "Máquina creada con código: {$machine->code}, nombre: {$machine->name}, tipo: {$machine->type}"
        );
        
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
            'axes' => 'sometimes|integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
            "brand" => 'nullable|string',
            "model" => 'nullable|string',
            "location" => 'nullable|string',
        ]);

        // Registrar los cambios realizados
        $changes = [];
        foreach ($data as $key => $value) {
            $oldValue = $machine->$key;
            $changes[] = "{$key}: '{$oldValue}' → '{$value}'";
        }
        
        $notes = !empty($changes) ? "Actualización de campos: " . implode(', ', $changes) : null;

        $machine->update($data);
        
        // Registrar movimiento de actualización
        $this->createMovement(
            $machine,
            'update',
            'active',
            $notes
        );
        
        return response()->json($machine);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Machine $machine)
    {
        // Obtener configuraciones
        $settings = \App\Models\Setting::where('module', 'production')->get()->keyBy('key');
        
        // Verificar si hay un PIN configurado para eliminar máquinas
        $settingPin = $settings->get('machinesDeletePin');
        $requirePin = $settingPin && !empty($settingPin->value);
        $configuredPin = null;
        
        if ($requirePin) {
            // Decodificar el valor ya que se guarda como JSON
            $pinValue = $settingPin->value;
            $decoded = json_decode($pinValue, true);
            $configuredPin = json_last_error() === JSON_ERROR_NONE ? $decoded : $pinValue;
            
            // Validar que se proporcione el PIN
            $request->validate([
                'pin' => 'required|string',
            ]);

            $decodedPinSetting = json_decode($request->input('pin'), true);
            
            // Verificar que el PIN sea correcto
            if ($decodedPinSetting !== $configuredPin) {
                return response()->json([
                    'message' => 'PIN de confirmación incorrecto'
                ], 422);
            }
        }
        
        // Verificar si la máquina tiene producciones asociadas
        $hasProductions = $machine->productions()->exists();
        
        if ($hasProductions) {
            return response()->json([
                'message' => 'No se puede eliminar la máquina porque tiene producciones asociadas'
            ], 422);
        }
        
        // Verificar si la máquina tiene movimientos
        $hasMovements = $machine->movements()->exists();
        
        if ($hasMovements) {
            return response()->json([
                'message' => 'No se puede eliminar la máquina porque tiene movimientos asociados'
            ], 422);
        }
        
        // Cerrar cualquier movimiento activo
        $this->closeActiveMovement($machine, 'Máquina eliminada');
        
        // Registrar movimiento de eliminación (antes de eliminar)
        $this->createMovement(
            $machine,
            'deletion',
            'active',
            "Máquina eliminada: código {$machine->code}, nombre {$machine->name}"
        );
        
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

        $oldStatus = $machine->status;
        $machine->update($data);
        
        // Cerrar cualquier movimiento activo anterior
        $this->closeActiveMovement($machine, "Cambio de estado de '{$oldStatus}' a '{$data['status']}'");
        
        // Registrar movimiento de cambio de estado
        $this->createMovement(
            $machine,
            'status_change',
            'active',
            "Cambio de estado: {$oldStatus} → {$data['status']}"
        );
        
        return response()->json($machine);
    }

    /**
     * Start machine operation.
     */
    public function startOperation(Request $request, Machine $machine)
    {
        // Cerrar cualquier operación activa anterior
        $this->closeActiveMovement($machine, 'Nueva operación iniciada');
        
        $machine->update(['status' => 'running']);
        
        // Registrar movimiento de inicio de operación
        $this->createMovement(
            $machine,
            'operation_start',
            'active',
            $request->notes ?? 'Início de operación'
        );
        
        return response()->json($machine);
    }

    /**
     * Stop machine operation.
     */
    public function stopOperation(Request $request, Machine $machine)
    {
        // Cerrar el movimiento activo
        $this->closeActiveMovement($machine, $request->notes ?? 'Operación finalizada');
        
        $machine->update(['status' => 'available']);
        
        // Registrar movimiento de fin de operación
        $this->createMovement(
            $machine,
            'operation_stop',
            'active',
            $request->notes ?? 'Fin de operación'
        );
        
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
            $stats = $machine->getCurrentWeekUtilization();
            
            return [
                'machine_id' => $machine->id,
                'id' => $machine->id,
                'code' => $machine->code,
                'name' => $machine->name,
                'status' => $machine->status,
                'utilizationRate' => $stats['utilization'],
                'utilization' => $stats['utilization'],
                'uptime' => $stats['activeHours'] ?? 0,
                'downtime' => max(0, ($stats['totalHours'] ?? 0) - ($stats['activeHours'] ?? 0)),
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

        $totalUtilization = 0;
        $countWithData = 0;
        
        foreach ($machines as $machine) {
            $stats = $machine->getCurrentWeekUtilization();
            if (isset($stats['utilization']) && $stats['utilization'] > 0) {
                $totalUtilization += $stats['utilization'];
                $countWithData++;
            }
        }
        
        $averageUtilization = $countWithData > 0 
            ? round($totalUtilization / $countWithData, 1)
            : 0;

        $data = [
            'total' => $machines->count(),
            'running' => $machines->where('status', 'running')->count(),
            'available' => $machines->where('status', 'available')->count(),
            'maintenance' => $machines->where('status', 'maintenance')->count(),
            'offline' => $machines->where('status', 'offline')->count(),
            'averageUtilization' => $averageUtilization,
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

    /**
     * Get recent activities from all sources.
     */
    public function activities()
    {
        $activities = [];
        
        // 1. Productions recientes (últimas 24 horas)
        $productions = \App\Models\Production::with(['workOrder', 'machine', 'operator'])
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        foreach ($productions as $production) {
            $activities[] = [
                'id' => 'production-' . $production->id,
                'type' => 'production',
                'title' => $production->status === 'completed' ? 'Producción completada' : 'Producción iniciada',
                'description' => ($production->workOrder ? $production->workOrder->work_order_number : 'Sin OT') . 
                    ' - ' . ($production->machine ? $production->machine->name : 'Sin máquina'),
                'time' => $this->getRelativeTime($production->created_at),
                'timestamp' => $production->created_at->toIso8601String(),
            ];
        }

        // 2. Machine Movements recientes (últimas 24 horas)
        $movements = \App\Models\MachineMovement::with(['machine', 'operator'])
            ->where('start_time', '>=', now()->subHours(24))
            ->orderBy('start_time', 'desc')
            ->limit(10)
            ->get();
            
        foreach ($movements as $movement) {
            $typeLabel = match($movement->type) {
                'start' => 'Máquina iniciada',
                'stop' => 'Máquina detenida',
                'maintenance' => 'Mantenimiento',
                'break' => 'Pausa',
                default => 'Movimiento',
            };
            
            $activities[] = [
                'id' => 'movement-' . $movement->id,
                'type' => $movement->type === 'maintenance' ? 'maintenance' : 'machine',
                'title' => $typeLabel,
                'description' => ($movement->machine ? $movement->machine->name : 'Sin máquina'),
                'time' => $this->getRelativeTime($movement->start_time),
                'timestamp' => $movement->start_time->toIso8601String(),
            ];
        }

        // 3. Warehouse Movements recientes (últimas 24 horas)
        $warehouseMovements = \App\Models\WarehouseMovement::with(['item', 'location'])
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        foreach ($warehouseMovements as $wm) {
            $typeLabel = match($wm->type) {
                'in' => 'Entrada de material',
                'out' => 'Salida de material',
                'transfer' => 'Transferencia',
                'adjustment' => 'Ajuste de inventario',
                default => 'Movimiento',
            };
            
            $activities[] = [
                'id' => 'warehouse-' . $wm->id,
                'type' => 'inventory',
                'title' => $typeLabel,
                'description' => ($wm->item ? $wm->item->name : 'Sin item') . ' - ' . $wm->quantity . ' unidades',
                'time' => $this->getRelativeTime($wm->created_at),
                'timestamp' => $wm->created_at->toIso8601String(),
            ];
        }

        // 4. Maintenance Orders recientes (últimas 24 horas)
        $maintenanceOrders = \App\Models\MaintenanceOrder::with(['machine'])
            ->where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        foreach ($maintenanceOrders as $mo) {
            $statusLabel = match($mo->status) {
                'pending' => 'Mantenimiento programado',
                'in_progress' => 'Mantenimiento en progreso',
                'completed' => 'Mantenimiento completado',
                default => 'Mantenimiento',
            };
            
            $activities[] = [
                'id' => 'maintenance-' . $mo->id,
                'type' => 'maintenance',
                'title' => $statusLabel,
                'description' => ($mo->machine ? $mo->machine->name : 'Sin máquina') . ' - ' . ($mo->maintenance_type ?? 'General'),
                'time' => $this->getRelativeTime($mo->created_at),
                'timestamp' => $mo->created_at->toIso8601String(),
            ];
        }

        // Ordenar todas las actividades por timestamp
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        // Limitar a las 15 más recientes
        $activities = array_slice($activities, 0, 15);

        return response()->json($activities);
    }

    /**
     * Get relative time string.
     */
    private function getRelativeTime($carbon): string
    {
        $diff = now()->diffInMinutes($carbon);
        
        if ($diff < 1) return 'Hace un momento';
        if ($diff < 60) return "Hace {$diff} min";
        
        $hours = floor($diff / 60);
        if ($hours < 24) return "Hace {$hours} hora" . ($hours > 1 ? 's' : '');
        
        $days = floor($hours / 24);
        return "Hace {$days} día" . ($days > 1 ? 's' : '');
    }
    
    /**
     * Get machine movement history.
     */
    public function movements(Machine $machine)
    {
        $movements = $machine->movements()
            ->orderBy('start_time', 'desc')
            ->get();
        
        return response()->json($movements);
    }
    
    /**
     * Get machine movement history with filters.
     */
    public function movementsReport(Request $request, Machine $machine)
    {
        $query = $machine->movements()->with(['production', 'operator']);
        
        // Filtro por tipo
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        
        // Filtro por estado
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        
        // Filtro por rango de fechas
        if ($request->has('start_date') && $request->start_date) {
            $query->where('start_time', '>=', $request->start_date);
        }
        
        if ($request->has('end_date') && $request->end_date) {
            $query->where('start_time', '<=', $request->end_date . ' 23:59:59');
        }
        
        $movements = $query->orderBy('start_time', 'desc')->get();
        
        // Calcular estadísticas
        $stats = [
            'total_movements' => $movements->count(),
            'active_movements' => $movements->where('status', 'active')->count(),
            'completed_movements' => $movements->where('status', 'completed')->count(),
            'total_operational_minutes' => $movements
                ->where('status', 'completed')
                ->sum(function ($m) {
                    if ($m->end_time && $m->start_time) {
                        return $m->start_time->diffInMinutes($m->end_time);
                    }
                    return 0;
                }),
        ];
        
        return response()->json([
            'movements' => $movements,
            'stats' => $stats,
        ]);
    }
}
