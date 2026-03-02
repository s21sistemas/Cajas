<?php

namespace App\Http\Controllers;

use App\Models\Production;
use App\Models\Process;
use App\Models\QualityEvaluation;
use App\Models\ProductionMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class QualityController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('quality.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('quality.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('quality.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('quality.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Obtener lista de producciones pendientes de evaluación
     */
    public function pendingEvaluations(Request $request): JsonResponse
    {
        $query = Production::with(['workOrder', 'process', 'operator'])
            ->where('quality_status', Production::QUALITY_STATUS_PENDING)
            ->orWhereNull('quality_status');

        if ($request->work_order_id) {
            $query->where('work_order_id', $request->work_order_id);
        }

        if ($request->process_id) {
            $query->where('process_id', $request->process_id);
        }

        $productions = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $productions,
        ]);
    }

    /**
     * Obtener evaluaciones de calidad por producción
     */
    public function getByProduction(int $productionId): JsonResponse
    {
        $evaluations = QualityEvaluation::with(['evaluator', 'production.process'])
            ->where('production_id', $productionId)
            ->orderBy('evaluated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }

    /**
     * Obtener evaluaciones por proceso
     */
    public function getByProcess(int $processId): JsonResponse
    {
        $productions = Production::with(['workOrder', 'process'])
            ->where('process_id', $processId)
            ->get();

        if ($productions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontraron producciones para este proceso',
            ], 404);
        }

        $evaluations = QualityEvaluation::with(['evaluator', 'production'])
            ->whereIn('production_id', $productions->pluck('id'))
            ->orderBy('evaluated_at', 'desc')
            ->get();

        // Calcular resumen
        $summary = [
            'total_evaluated' => $evaluations->sum('quantity_evaluated'),
            'total_approved' => $evaluations->sum('quantity_approved'),
            'total_scrap' => $evaluations->sum('quantity_scrap'),
            'total_rework' => $evaluations->sum('quantity_rework'),
            'approved_count' => $evaluations->where('decision', QualityEvaluation::DECISION_APPROVED)->count(),
            'scrap_count' => $evaluations->where('decision', QualityEvaluation::DECISION_SCRAP)->count(),
            'rework_count' => $evaluations->where('decision', QualityEvaluation::DECISION_REWORK)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'process_id' => $processId,
                'evaluations' => $evaluations,
                'summary' => $summary,
            ],
        ]);
    }

    /**
     * Crear una evaluación de calidad
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'production_id' => 'required|exists:productions,id',
            'quantity_evaluated' => 'required|integer|min:1',
            'decision' => 'required|in:APPROVED,SCRAP,REWORK',
            'quantity_approved' => 'nullable|integer|min:0',
            'quantity_scrap' => 'nullable|integer|min:0',
            'quantity_rework' => 'nullable|integer|min:0',
            'observations' => 'nullable|string',
        ]);

        // Validar que la producción no haya sido evaluada
        $production = Production::find($validated['production_id']);
        
        if ($production->quality_status && $production->quality_status !== Production::QUALITY_STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Esta producción ya ha sido evaluada',
            ], 422);
        }

        // Validar que las cantidades coincidan
        $totalDistributed = ($validated['quantity_approved'] ?? 0) + 
                           ($validated['quantity_scrap'] ?? 0) + 
                           ($validated['quantity_rework'] ?? 0);

        if ($totalDistributed !== $validated['quantity_evaluated']) {
            return response()->json([
                'success' => false,
                'message' => 'Las cantidades distribuidas no coinciden con la cantidad evaluada',
            ], 422);
        }

        // Crear evaluación
        $evaluation = QualityEvaluation::create([
            'production_id' => $validated['production_id'],
            'quantity_evaluated' => $validated['quantity_evaluated'],
            'decision' => $validated['decision'],
            'quantity_approved' => $validated['quantity_approved'] ?? 0,
            'quantity_scrap' => $validated['quantity_scrap'] ?? 0,
            'quantity_rework' => $validated['quantity_rework'] ?? 0,
            'observations' => $validated['observations'] ?? null,
            'evaluator_id' => Auth::id(),
            'evaluated_at' => now(),
        ]);

        // Actualizar estado de calidad en la producción
        $production->update([
            'quality_status' => $validated['decision'],
        ]);

        // Aplicar la decisión al proceso
        $result = $evaluation->applyDecision();

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 422);
        }

        // Recalcular métricas de la orden
        $production = $evaluation->production;
        if ($production) {
            $workOrder = $production->workOrder;
            if ($workOrder) {
                $workOrder->calculateMetrics();
                $workOrder->checkAndComplete();
            }
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => [
                'evaluation' => $evaluation->load(['evaluator', 'production.process']),
                'process_metrics' => null,
            ],
        ]);
    }

    /**
     * Obtener historial de movimientos de trazabilidad
     */
    public function getMovements(Request $request): JsonResponse
    {
        $query = ProductionMovement::with(['workOrder', 'process', 'user']);

        if ($request->work_order_id) {
            $query->where('work_order_id', $request->work_order_id);
        }

        if ($request->process_id) {
            $query->where('process_id', $request->process_id);
        }

        if ($request->movement_type) {
            $query->where('movement_type', $request->movement_type);
        }

        $movements = $query->orderBy('movement_date', 'desc')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $movements,
        ]);
    }

    /**
     * Obtener métricas de un proceso
     */
    public function getProcessMetrics(int $processId): JsonResponse
    {
        $process = Process::find($processId);

        if (!$process) {
            return response()->json([
                'success' => false,
                'message' => 'Proceso no encontrado',
            ], 404);
        }
        
        // Obtener resumen de evaluaciones de calidad a través de las producciones
        $productions = Production::where('process_id', $processId)->get();
        $productionIds = $productions->pluck('id');
        
        $qualitySummary = QualityEvaluation::whereIn('production_id', $productionIds)
            ->selectRaw('
                COUNT(*) as total_evaluations,
                SUM(CASE WHEN decision = "APPROVED" THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN decision = "SCRAP" THEN 1 ELSE 0 END) as scrap_count,
                SUM(CASE WHEN decision = "REWORK" THEN 1 ELSE 0 END) as rework_count,
                SUM(quantity_approved) as total_approved,
                SUM(quantity_scrap) as total_scrap,
                SUM(quantity_rework) as total_rework
            ')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'process' => $process,
                'metrics' => null,
                'quality_summary' => $qualitySummary,
            ],
        ]);
    }

    /**
     * Obtener dashboard de calidad
     */
    public function dashboard(Request $request): JsonResponse
    {
        $startDate = $request->start_date ?? now()->subDays(30);
        $endDate = $request->end_date ?? now();

        // Estadísticas generales
        $stats = QualityEvaluation::whereBetween('evaluated_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total_evaluations,
                SUM(quantity_evaluated) as total_quantity_evaluated,
                SUM(quantity_approved) as total_approved,
                SUM(quantity_scrap) as total_scrap,
                SUM(quantity_rework) as total_rework
            ')
            ->first();

        // Porcentajes
        $total = $stats->total_quantity_evaluated ?: 1;
        $approvalRate = round(($stats->total_approved / $total) * 100, 2);
        $scrapRate = round(($stats->total_scrap / $total) * 100, 2);
        $reworkRate = round(($stats->total_rework / $total) * 100, 2);

        // Producciones pendientes de evaluación
        $pendingCount = Production::where('quality_status', Production::QUALITY_STATUS_PENDING)
            ->orWhereNull('quality_status')
            ->count();

        // Evaluaciones por día
        $dailyEvaluations = QualityEvaluation::whereBetween('evaluated_at', [$startDate, $endDate])
            ->selectRaw('DATE(evaluated_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
                'stats' => [
                    'total_evaluations' => $stats->total_evaluations,
                    'total_quantity' => $stats->total_quantity_evaluated,
                    'approved' => $stats->total_approved,
                    'scrap' => $stats->total_scrap,
                    'rework' => $stats->total_rework,
                    'approval_rate' => $approvalRate,
                    'scrap_rate' => $scrapRate,
                    'rework_rate' => $reworkRate,
                ],
                'pending_count' => $pendingCount,
                'daily_evaluations' => $dailyEvaluations,
            ],
        ]);
    }
}
