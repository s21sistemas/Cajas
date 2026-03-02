<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Machine;
use App\Models\MachineMovement;
use App\Models\WorkOrder;
use App\Models\Employee;
use App\Models\InventoryItem;
use App\Models\Sale;
use App\Models\PurchaseOrder;
use App\Models\Movement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class ReportController extends Controller
{
    /**
     * Obtener datos para el dashboard/reportes
     */
    public function dashboard(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Producción
        $productions = Production::whereBetween('created_at', [$startDate, $endDate])->get();
        $totalProduction = $productions->sum('good_parts');
        $totalScrap = $productions->sum('scrap_parts');
        
        // Máquinas
        $machines = Machine::all()->map(function($machine) use ($startDate, $endDate) {
            $machineProductions = Production::where('machine_id', $machine->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();
            $totalHours = $machineProductions->sum(function($p) {
                if ($p->start_time && $p->end_time) {
                    return $p->start_time->diffInMinutes($p->end_time) / 60;
                }
                return 0;
            });
            return [
                'id' => $machine->id,
                'name' => $machine->name,
                'status' => $machine->status,
                'utilization' => $totalHours > 0 ? min(100, ($totalHours / 200) * 100) : 0, // Asumiendo 200 hrs mes base
                'total_hours' => round($totalHours, 2),
            ];
        });

        // Órdenes de trabajo
        $workOrders = WorkOrder::whereBetween('created_at', [$startDate, $endDate])->get();
        
        // Empleados
        $employees = Employee::where('status', 'active')->get();

        // Inventario
        $inventory = InventoryItem::all()->map(function($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
                'currentStock' => $item->quantity,
                'category' => $item->category,
                'min_stock' => $item->min_stock,
            ];
        });

        // Ventas
        $sales = Sale::whereBetween('created_at', [$startDate, $endDate])->get();
        
        // Compras
        $purchases = PurchaseOrder::whereBetween('created_at', [$startDate, $endDate])->get();

        // Movimientos de finanzas
        $movements = Movement::whereBetween('date', [$startDate, $endDate])->get();
        $income = $movements->where('type', 'income')->sum('amount');
        $expenses = $movements->where('type', 'expense')->sum('amount');

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'production' => [
                'total' => $totalProduction,
                'scrap' => $totalScrap,
                'efficiency' => $totalProduction > 0 ? round(($totalProduction / ($totalProduction + $totalScrap)) * 100, 2) : 0,
            ],
            'machines' => $machines,
            'workOrders' => [
                'total' => $workOrders->count(),
                'pending' => $workOrders->where('status', 'pending')->count(),
                'completed' => $workOrders->where('status', 'completed')->count(),
                'in_progress' => $workOrders->where('status', 'in_progress')->count(),
            ],
            'employees' => [
                'total' => $employees->count(),
                'by_department' => $employees->groupBy('department')->map->count(),
            ],
            'inventory' => [
                'total_items' => $inventory->count(),
                'low_stock' => $inventory->filter(function($i) { return $i['currentStock'] <= $i['min_stock']; })->count(),
                'items' => $inventory,
            ],
            'sales' => [
                'total' => $sales->count(),
                'revenue' => $sales->sum('total'),
            ],
            'purchases' => [
                'total' => $purchases->count(),
                'expense' => $purchases->sum('total'),
            ],
            'finance' => [
                'income' => $income,
                'expenses' => $expenses,
                'balance' => $income - $expenses,
            ],
        ]);
    }

    /**
     * Reporte de máquinas
     */
    public function machines(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $machineId = $request->input('machine_id');
        $status = $request->input('status');
        $format = $request->input('format', 'json');

        $query = Machine::query();

        if ($machineId) {
            $query->where('id', $machineId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $machines = $query->get()->map(function($machine) use ($startDate, $endDate) {
            // Obtener movimientos de máquina en el período
            $movements = MachineMovement::where('machine_id', $machine->id)
                ->whereBetween('start_time', [$startDate, $endDate])
                ->get();

            // Calcular horas de uso basadas en machine_movements
            $activeMinutes = 0;
            foreach ($movements as $movement) {
                if ($movement->start_time) {
                    $endTime = $movement->end_time ?? now();
                    $activeMinutes += $endTime->diffInMinutes($movement->start_time);
                }
            }
            $totalHours = $activeMinutes / 60;

            // Calcular horas totales del período
            $periodStart = \Carbon\Carbon::parse($startDate);
            $periodEnd = \Carbon\Carbon::parse($endDate);
            $totalPeriodHours = $periodStart->diffInHours($periodEnd);

            // Calcular utilización
            $utilization = $totalPeriodHours > 0 ? min(100, round(($totalHours / $totalPeriodHours) * 100, 2)) : 0;

            // Obtener producciones del período
            $productions = Production::where('machine_id', $machine->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get();

            return [
                'id' => $machine->id,
                'code' => $machine->code,
                'name' => $machine->name,
                'type' => $machine->type,
                'brand' => $machine->brand,
                'model' => $machine->model,
                'location' => $machine->location,
                'status' => $machine->status,
                'total_productions' => $productions->count(),
                'total_parts' => $productions->sum('good_parts'),
                'total_scrap' => $productions->sum('scrap_parts'),
                'total_hours' => round($totalHours, 2),
                'total_movements' => $movements->count(),
                'utilization' => $utilization,
            ];
        });

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-machines', [
                'machines' => $machines,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            return $pdf->download('reporte-maquinas.pdf');
        }

        // CSV export
        if ($format === 'csv') {
            $filename = 'reporte-maquinas.csv';
            $handle = fopen('php://temp', 'r+');
            
            // Headers
            $headers = ['Código', 'Nombre', 'Tipo', 'Marca', 'Modelo', 'Ubicación', 'Estado', 'Producciones', 'Piezas', 'Scrap', 'Horas', 'Utilización'];
            fputcsv($handle, $headers, ',');
            
            foreach ($machines as $machine) {
                fputcsv($handle, [
                    $machine['code'],
                    $machine['name'],
                    $machine['type'],
                    $machine['brand'],
                    $machine['model'],
                    $machine['location'],
                    $machine['status'],
                    $machine['total_productions'],
                    $machine['total_parts'],
                    $machine['total_scrap'],
                    $machine['total_hours'],
                    $machine['utilization'] . '%',
                ], ',');
            }
            
            $content = stream_get_contents($handle);
            fclose($handle);
            
            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]);
        }

        return response()->json($machines);
    }

    /**
     * Reporte de producción
     */
    public function production(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $productId = $request->input('product_id');
        $operatorId = $request->input('operator_id');
        $status = $request->input('status');
        $format = $request->input('format', 'json');

        $query = Production::with(['product', 'process', 'operator', 'machine', 'workOrder'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($productId) {
            $query->where('product_id', $productId);
        }

        if ($operatorId) {
            $query->where('operator_id', $operatorId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $productions = $query->orderByDesc('created_at')->get();

        $data = $productions->map(function($p) {
            return [
                'id' => $p->id,
                'code' => $p->code,
                'product' => $p->product?->name,
                'process' => $p->process?->name,
                'operator' => $p->operator?->name,
                'machine' => $p->machine?->name,
                'work_order' => $p->workOrder?->code,
                'target_parts' => $p->target_parts,
                'good_parts' => $p->good_parts,
                'scrap_parts' => $p->scrap_parts,
                'status' => $p->status,
                'quality_status' => $p->quality_status,
                'start_time' => $p->start_time,
                'end_time' => $p->end_time,
            ];
        });

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-production', [
                'productions' => $data,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            return $pdf->download('reporte-produccion.pdf');
        }

        return response()->json($data);
    }

    /**
     * Reporte de ventas
     */
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $clientId = $request->input('client_id');
        $status = $request->input('status');
        $format = $request->input('format', 'json');

        $query = Sale::with('client')->whereBetween('created_at', [$startDate, $endDate]);

        if ($clientId) {
            $query->where('client_id', $clientId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $sales = $query->orderByDesc('created_at')->get();

        $data = $sales->map(function($s) {
            return [
                'id' => $s->id,
                'code' => $s->code,
                'client' => $s->client_name,
                'subtotal' => $s->subtotal,
                'tax' => $s->tax,
                'total' => $s->total,
                'status' => $s->status,
                'payment_type' => $s->payment_type,
                'created_at' => $s->created_at,
            ];
        });

        $summary = [
            'total_sales' => $sales->count(),
            'total_revenue' => $sales->sum('total'),
            'pending' => $sales->where('status', 'pending')->count(),
            'paid' => $sales->where('status', 'paid')->count(),
        ];

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-sales', [
                'sales' => $data,
                'summary' => $summary,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            return $pdf->download('reporte-ventas.pdf');
        }

        return response()->json([
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    /**
     * Reporte de inventario
     */
    public function inventory(Request $request)
    {
        $category = $request->input('category');
        $lowStock = $request->input('low_stock');
        $format = $request->input('format', 'json');

        $query = InventoryItem::query();

        if ($category) {
            $query->where('category', $category);
        }

        if ($lowStock === 'true') {
            $query->whereColumn('quantity', '<=', 'min_stock');
        }

        $items = $query->orderBy('name')->get();

        $data = $items->map(function($item) {
            return [
                'id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'category' => $item->category,
                'quantity' => $item->quantity,
                'unit' => $item->unit,
                'min_stock' => $item->min_stock,
                'max_stock' => $item->max_stock,
                'unit_cost' => $item->unit_cost,
                'total_value' => $item->quantity * $item->unit_cost,
            ];
        });

        $summary = [
            'total_items' => $items->count(),
            'total_value' => $items->sum(function($i) { return $i->quantity * $i->unit_cost; }),
            'low_stock_count' => $items->filter(function($i) { return $i->quantity <= $i->min_stock; })->count(),
        ];

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-inventory', [
                'items' => $data,
                'summary' => $summary,
            ]);
            return $pdf->download('reporte-inventario.pdf');
        }

        return response()->json([
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    /**
     * Reporte financiero
     */
    public function finance(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $type = $request->input('type');
        $category = $request->input('category');
        $format = $request->input('format', 'json');

        $query = Movement::whereBetween('date', [$startDate, $endDate]);

        if ($type) {
            $query->where('type', $type);
        }

        if ($category) {
            $query->where('category', $category);
        }

        $movements = $query->orderByDesc('date')->get();

        $data = $movements->map(function($m) {
            return [
                'id' => $m->id,
                'date' => $m->date,
                'type' => $m->type,
                'category' => $m->category,
                'description' => $m->description,
                'amount' => $m->amount,
                'reference' => $m->reference,
                'status' => $m->status,
            ];
        });

        $summary = [
            'total_income' => $movements->where('type', 'income')->sum('amount'),
            'total_expenses' => $movements->where('type', 'expense')->sum('amount'),
            'balance' => $movements->where('type', 'income')->sum('amount') - $movements->where('type', 'expense')->sum('amount'),
        ];

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-finance', [
                'movements' => $data,
                'summary' => $summary,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            return $pdf->download('reporte-financiero.pdf');
        }

        return response()->json([
            'data' => $data,
            'summary' => $summary,
        ]);
    }

    /**
     * Reporte ejecutivo: usuarios, roles y permisos
     */
    public function executive(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        $roleId = $request->input('role_id');
        $format = $request->input('format', 'json');

        // Usuarios
        $usersQuery = User::query();
        $users = $usersQuery->get()->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status ?? 'active',
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getPermissionNames()->toArray(),
                'created_at' => $user->created_at,
            ];
        });

        // Roles
        $rolesQuery = Role::query();
        if ($roleId) {
            $rolesQuery->where('id', $roleId);
        }
        $roles = $rolesQuery->get()->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->getPermissionNames()->toArray(),
                'users_count' => $role->users()->count(),
            ];
        });

        // Permisos
        $permissions = Permission::all()->map(function($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'roles_count' => $permission->roles()->count(),
            ];
        });

        $summary = [
            'total_users' => $users->count(),
            'total_roles' => $roles->count(),
            'total_permissions' => $permissions->count(),
            'active_users' => $users->where('status', 'active')->count(),
        ];

        if ($format === 'pdf') {
            $pdf = Pdf::loadView('pdf.report-executive', [
                'users' => $users,
                'roles' => $roles,
                'permissions' => $permissions,
                'summary' => $summary,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ]);
            return $pdf->download('reporte-ejecutivo.pdf');
        }

        return response()->json([
            'users' => $users,
            'roles' => $roles,
            'permissions' => $permissions,
            'summary' => $summary,
        ]);
    }
}
