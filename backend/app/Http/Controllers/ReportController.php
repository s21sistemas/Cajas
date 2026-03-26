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
use App\Models\Product;
use App\Models\Client;
use App\Models\Operator;
use App\Models\Absence;
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

        // Filtros adicionales
        $machineId = $request->input('machine_id');
        $productId = $request->input('product_id');
        $operatorId = $request->input('operator_id');
        $clientId = $request->input('client_id');
        $category = $request->input('category');
        $status = $request->input('status');
        $type = $request->input('type');
        $lowStock = $request->input('low_stock');

        // Construcción de queries con filtros
        $productionQuery = Production::whereBetween('created_at', [$startDate, $endDate]);
        if ($machineId) $productionQuery->where('machine_id', $machineId);
        if ($operatorId) $productionQuery->where('operator_id', $operatorId);
        if ($productId) $productionQuery->where('product_id', $productId);

        $productions = $productionQuery->get();
        
        // Obtener WorkOrders únicos relacionados con las producciones
        $workOrders = $productions->pluck('workOrder')->unique('id');
        
        // Producción total: suma del campo 'completed' de los WorkOrders
        $totalProduced = $workOrders->sum('completed');
        
        // Objetivo: suma del campo 'quantity' de los WorkOrders (target)
        $totalTarget = $workOrders->sum('quantity');
        
        $totalScrap = $productions->sum('scrap_parts');
        
        // Producción diaria agrupada por fecha (obtenida del WorkOrder)
        $dailyProductionQuery = Production::whereBetween('created_at', [$startDate, $endDate]);
        if ($machineId) $dailyProductionQuery->where('machine_id', $machineId);
        if ($operatorId) $dailyProductionQuery->where('operator_id', $operatorId);
        if ($productId) $dailyProductionQuery->where('product_id', $productId);
        
        // Obtener las producciones con su WorkOrder relacionado
        $dailyProductions = $dailyProductionQuery->with('workOrder')->get();
        
        // Agrupar por fecha y obtener datos del WorkOrder
        $dailyGrouped = $dailyProductions->groupBy(function($prod) {
            return $prod->created_at->toDateString();
        })->map(function($productions) {
            $workOrders = $productions->pluck('workOrder')->unique('id');
            return [
                'produced' => $workOrders->sum('completed'),
                'target' => $workOrders->sum('quantity'),
                'scrap' => $productions->sum('scrap_parts'),
            ];
        });
        
        // Calcular objetivo base (1500 por día hábil, 800 fines de semana)
        $dailyProductionDataArray = [];
        foreach ($dailyGrouped as $date => $day) {
            $dateObj = new \DateTime($date);
            $dayOfWeek = (int)$dateObj->format('N');
            $isWeekend = $dayOfWeek >= 6;
            $dailyProductionDataArray[] = [
                'date' => $date,
                'label' => $date,
                'produced' => (int) $day['produced'],
                'scrap' => (int) $day['scrap'],
                'target' => (int) $day['target'] ?: ($isWeekend ? 800 : 1500),
            ];
        }

        // === NUEVO: Calcular cambios comparison (vs períodos anteriores) ===
        
        // Production Change: vs mes anterior (obtenido del campo completed de WorkOrders)
        $lastMonthStart = (new \DateTime($startDate))->modify('-1 month')->format('Y-m-01');
        $lastMonthEnd = (new \DateTime($startDate))->modify('last day of previous month')->format('Y-m-d');
        $lastMonthProductions = Production::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->get();
        $lastMonthWorkOrders = $lastMonthProductions->pluck('workOrder')->unique('id');
        $lastMonthProduction = $lastMonthWorkOrders->sum('completed');
        $productionChange = $lastMonthProduction > 0 ? round((($totalProduced - $lastMonthProduction) / $lastMonthProduction) * 100, 1) : 0;

        // Efficiency Change: vs semana anterior
        $currentStart = new \DateTime($startDate);
        $currentEnd = new \DateTime($endDate);
        $weekStart = $currentStart->format('Y-m-d');
        $weekEnd = min($currentEnd, (clone $currentStart)->modify('+6 days')->format('Y-m-d'));
        
        $prevWeekStart = (clone $currentStart)->modify('-7 days')->format('Y-m-d');
        $prevWeekEnd = (clone $currentStart)->modify('-1 day')->format('Y-m-d');
        
        $currentWeekProductions = Production::whereBetween('created_at', [$weekStart, $weekEnd])->get();
        $prevWeekProductions = Production::whereBetween('created_at', [$prevWeekStart, $prevWeekEnd])->get();
        
        $currentTotal = $currentWeekProductions->sum('good_parts');
        $currentScrap = $currentWeekProductions->sum('scrap_parts');
        $prevTotal = $prevWeekProductions->sum('good_parts');
        $prevScrap = $prevWeekProductions->sum('scrap_parts');
        
        $currentEfficiency = ($currentTotal + $currentScrap) > 0 ? round(($currentTotal / ($currentTotal + $currentScrap)) * 100, 2) : 0;
        $prevEfficiency = ($prevTotal + $prevScrap) > 0 ? round(($prevTotal / ($prevTotal + $prevScrap)) * 100, 2) : 0;
        $efficiencyChange = round($currentEfficiency - $prevEfficiency, 1);

        // Scrap Rate Change: vs semana anterior (invertido porque menos scrap es mejor)
        $currentScrapRate = ($currentTotal + $currentScrap) > 0 ? round(($currentScrap / ($currentTotal + $currentScrap)) * 100, 2) : 0;
        $prevScrapRate = ($prevTotal + $prevScrap) > 0 ? round(($prevScrap / ($prevTotal + $prevScrap)) * 100, 2) : 0;
        $scrapRateChange = round($currentScrapRate - $prevScrapRate, 1);

        // Critical Alerts: máquinas en mantenimiento + órdenes atrasadas + inventory bajo
        $machinesInMaintenance = Machine::where('status', 'maintenance')->count();
        $overdueOrders = WorkOrder::where('due_date', '<', now()->toDateString())
            ->whereNotIn('status', ['completed', 'cancelled'])->count();
        $lowStockItems = InventoryItem::whereRaw('quantity <= min_stock')->count();
        $criticalAlerts = $machinesInMaintenance + $overdueOrders + ($lowStockItems > 0 ? 1 : 0);
        
        // Máquinas - con filtro opcional
        $machinesQuery = Machine::query();
        if ($machineId) $machinesQuery->where('id', $machineId);
        if ($status) $machinesQuery->where('status', $status);
        
        $machines = $machinesQuery->get()->map(function($machine) use ($startDate, $endDate, $machineId) {
            // Usar MachineMovement para calcular utilización
            $machineMovements = MachineMovement::where('machine_id', $machine->id)
                ->whereBetween('start_time', [$startDate, $endDate])
                ->get();
            
            $totalHours = $machineMovements->sum(function($m) {
                if ($m->start_time && $m->end_time) {
                    return $m->start_time->diffInMinutes($m->end_time) / 60;
                }
                return 0;
            });
            
            return [
                'id' => $machine->id,
                'name' => $machine->name,
                'status' => $machine->status,
                'utilization' => $totalHours > 0 ? min(100, ($totalHours / 200) * 100) : 0,
                'total_hours' => round($totalHours, 2),
            ];
        });

        // Órdenes de trabajo - con filtro opcional
        $workOrdersQuery = WorkOrder::query();
        if ($machineId) $workOrdersQuery->where('machine_id', $machineId);
        if ($productId) $workOrdersQuery->where('product_id', $productId);
        if ($clientId) $workOrdersQuery->where('client_id', $clientId);
        if ($status) $workOrdersQuery->where('status', $status);
        if ($category) $workOrdersQuery->where('category', $category);
        $workOrders = $workOrdersQuery->whereBetween('created_at', [$startDate, $endDate])->get();
        
        // Empleados
        $employeesQuery = Employee::query();
        if ($operatorId) $employeesQuery->where('id', $operatorId);
        $employees = $employeesQuery->where('status', 'active')->get();
        
        // Métricas de RRHH - Asistencia (basado en ausencias del mes actual)
        $currentMonthStart = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();
        $totalEmployees = $employees->count();
        $absencesThisMonth = Absence::whereBetween('date', [$currentMonthStart, $currentMonthEnd])
            ->where('status', 'approved')
            ->count();
        
        // Calcular días laborables en el mes (aproximadamente 22 días)
        $workingDaysInMonth = 22;
        $totalPossibleAttendance = $totalEmployees * $workingDaysInMonth;
        $attendanceRate = $totalPossibleAttendance > 0 
            ? round((($totalPossibleAttendance - $absencesThisMonth) / $totalPossibleAttendance) * 100, 1) 
            : 0;
        
        // Operadores (módulo separado de empleados)
        $operatorsQuery = Operator::query();
        if ($operatorId) $operatorsQuery->where('id', $operatorId);
        $operators = $operatorsQuery->where('active', true)->get();

        // Inventario - con filtro opcional
        $inventoryQuery = InventoryItem::query();
        if ($productId) $inventoryQuery->where('id', $productId);
        if ($category) $inventoryQuery->where('category', $category);
        if ($lowStock === 'true') $inventoryQuery->whereRaw('quantity <= min_stock');
        $inventory = $inventoryQuery->get()->map(function($item) {
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
                'total' => $totalProduced,
                'target' => $totalTarget,
                'scrap' => $totalScrap,
                'efficiency' => ($totalProduced + $totalScrap) > 0 ? round(($totalProduced / ($totalProduced + $totalScrap)) * 100, 2) : 0,
                'change' => $productionChange,
                'efficiency_change' => $efficiencyChange,
                'scrap_change' => $scrapRateChange,
                'daily' => $dailyProductionDataArray,
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
                'efficiency' => ($totalProduced + $totalScrap) > 0 ? round(($totalProduced / ($totalProduced + $totalScrap)) * 100, 1) : 0,
                'attendance_rate' => $attendanceRate,
            ],
            'operators' => [
                'total' => $operators->count(),
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
            'alerts' => [
                'critical' => $criticalAlerts,
                'machines_maintenance' => $machinesInMaintenance,
                'orders_overdue' => $overdueOrders,
                'low_stock_warning' => $lowStockItems > 0,
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
        try {
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
                    'start_time' => $p->start_time instanceof \Carbon\Carbon ? $p->start_time->toISOString() : $p->start_time,
                    'end_time' => $p->end_time instanceof \Carbon\Carbon ? $p->end_time->toISOString() : $p->end_time,
                ];
            });

            if ($format === 'pdf') {
                if ($data->isEmpty()) {
                    return response()->json(['error' => 'No hay datos para el período seleccionado'], 404);
                }
                $pdf = Pdf::loadView('pdf.report-production', [
                    'productions' => $data,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                ])->setPaper('a4', 'landscape'); // Orientación horizontal
                return $pdf->download('reporte-produccion.pdf');
            }

            if ($format === 'csv') {
                $filename = 'reporte-produccion.csv';
                $handle = fopen('php://temp', 'r+');
                
                $headers = ['Código', 'Producto', 'Proceso', 'Operador', 'Máquina', 'Orden', 'Meta', 'Buenas', 'Scrap', 'Estado', 'Calidad', 'Inicio', 'Fin'];
                fputcsv($handle, $headers, ',');
                
                foreach ($data as $p) {
                    fputcsv($handle, [
                        $p['code'],
                        $p['product'],
                        $p['process'],
                        $p['operator'],
                        $p['machine'],
                        $p['work_order'],
                        $p['target_parts'],
                        $p['good_parts'],
                        $p['scrap_parts'],
                        $p['status'],
                        $p['quality_status'],
                        $p['start_time'],
                        $p['end_time'],
                    ], ',');
                }
                
                $content = stream_get_contents($handle);
                fclose($handle);
                
                return response($content, 200, [
                    'Content-Type' => 'text/csv',
                    'Content-Disposition' => "attachment; filename=\"$filename\"",
                ]);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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

        if ($format === 'csv') {
            $filename = 'reporte-ventas.csv';
            $handle = fopen('php://temp', 'r+');
            
            $headers = ['Código', 'Cliente', 'Subtotal', 'IVA', 'Total', 'Estado', 'Pago', 'Fecha'];
            fputcsv($handle, $headers, ',');
            
            foreach ($data as $s) {
                fputcsv($handle, [
                    $s['code'],
                    $s['client'],
                    $s['subtotal'],
                    $s['tax'],
                    $s['total'],
                    $s['status'],
                    $s['payment_type'],
                    $s['created_at'],
                ], ',');
            }
            
            $content = stream_get_contents($handle);
            fclose($handle);
            
            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]);
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

        if ($format === 'csv') {
            $filename = 'reporte-inventario.csv';
            $handle = fopen('php://temp', 'r+');
            
            $headers = ['Código', 'Nombre', 'Categoría', 'Cantidad', 'Unidad', 'Mín', 'Máx', 'Costo Unit.', 'Valor Total'];
            fputcsv($handle, $headers, ',');
            
            foreach ($data as $item) {
                fputcsv($handle, [
                    $item['code'],
                    $item['name'],
                    $item['category'],
                    $item['quantity'],
                    $item['unit'],
                    $item['min_stock'],
                    $item['max_stock'],
                    $item['unit_cost'],
                    $item['total_value'],
                ], ',');
            }
            
            $content = stream_get_contents($handle);
            fclose($handle);
            
            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]);
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

        if ($format === 'csv') {
            $filename = 'reporte-financiero.csv';
            $handle = fopen('php://temp', 'r+');
            
            $headers = ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Referencia', 'Monto', 'Estado'];
            fputcsv($handle, $headers, ',');
            
            foreach ($data as $m) {
                fputcsv($handle, [
                    $m['date'],
                    $m['type'],
                    $m['category'],
                    $m['description'],
                    $m['reference'],
                    $m['amount'],
                    $m['status'],
                ], ',');
            }
            
            $content = stream_get_contents($handle);
            fclose($handle);
            
            return response($content, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]);
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

    /**
     * Opciones para filtros de reportes
     */
    public function options()
    {
        $machines = Machine::where('status', '!=', 'offline')
            ->orderBy('name')
            ->get(['id', 'name', 'status'])
            ->map(function($m) {
                return ['id' => $m->id, 'name' => $m->name, 'status' => $m->status];
            });

        $products = Product::orderBy('name')->get(['id', 'name'])
            ->map(function($p) {
                return ['id' => $p->id, 'name' => $p->name];
            });

        $clients = Client::orderBy('name')->get(['id', 'name'])
            ->map(function($c) {
                return ['id' => $c->id, 'name' => $c->name];
            });

        $operators = Operator::orderBy('name')->get(['id', 'name'])
            ->map(function($o) {
                return ['id' => $o->id, 'name' => $o->name];
            });

        // Obtener categorías únicas de inventarios (inventory_items)
        $inventoryCategories = DB::table('inventory_items')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->map(function($cat) {
                return ['value' => $cat, 'label' => ucfirst(str_replace('_', ' ', $cat))];
            });

        return response()->json([
            'machines' => $machines,
            'products' => $products,
            'clients' => $clients,
            'operators' => $operators,
            'categories' => $inventoryCategories,
        ]);
    }

    /**
     * Tendencias de costos (datos para gráfica)
     */
    public function costTrend(Request $request)
    {
        $months = $request->input('months', 6);
        $startDate = now()->subMonths($months)->startOfMonth();
        $endDate = now()->endOfMonth();

        // Obtener categorías únicas de la tabla movements
        $categories = Movement::whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category');

        $movements = Movement::whereBetween('date', [$startDate, $endDate])
            ->get();

        $trend = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStr = $month->format('Y-m');
            $monthLabel = $month->format('M');
            
            $monthMovements = $movements->filter(function($m) use ($monthStr) {
                return $m->date && $m->date->format('Y-m') === $monthStr;
            });

            $monthData = [
                'month' => $monthLabel,
            ];

            // Agregar cada categoría dinámicamente
            foreach ($categories as $category) {
                $monthData[$category] = (float) $monthMovements->where('category', $category)->sum('amount');
            }

            $trend[] = $monthData;
        }

        return response()->json($trend);
    }
}
