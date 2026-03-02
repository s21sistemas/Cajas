<?php

namespace App\Http\Controllers;

use App\Models\MachineMovement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MachineMovementController extends Controller
{
    /**
     * Display a listing of machine movements.
     */
    public function index(Request $request): JsonResponse
    {
        $query = MachineMovement::with(['machine', 'production', 'operator']);

        if ($request->machine_id) {
            $query->where('machine_id', $request->machine_id);
        }

        if ($request->production_id) {
            $query->where('production_id', $request->production_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->start_date && $request->end_date) {
            $query->inDateRange($request->start_date, $request->end_date);
        }

        $movements = $query->orderBy('start_time', 'desc')->paginate(20);

        return response()->json($movements);
    }

    /**
     * Store a newly created machine movement.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'machine_id' => 'required|exists:machines,id',
            'production_id' => 'nullable|exists:productions,id',
            'operator_id' => 'nullable|exists:operators,id',
            'start_time' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $movement = MachineMovement::create([
            'machine_id' => $validated['machine_id'],
            'production_id' => $validated['production_id'] ?? null,
            'operator_id' => $validated['operator_id'] ?? null,
            'start_time' => $validated['start_time'] ?? now(),
            'status' => 'active',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Machine movement created successfully',
            'data' => $movement->load(['machine', 'production', 'operator']),
        ], 201);
    }

    /**
     * Display the specified machine movement.
     */
    public function show(int $id): JsonResponse
    {
        $movement = MachineMovement::with(['machine', 'production', 'operator'])->findOrFail($id);

        return response()->json($movement);
    }

    /**
     * Update the specified machine movement.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $movement = MachineMovement::findOrFail($id);

        $validated = $request->validate([
            'end_time' => 'nullable|date|after:start_time',
            'status' => 'nullable|in:active,paused,completed,cancelled',
            'notes' => 'nullable|string',
            'operator_id' => 'nullable|exists:operators,id',
        ]);

        $movement->update($validated);

        return response()->json([
            'message' => 'Machine movement updated successfully',
            'data' => $movement->load(['machine', 'production', 'operator']),
        ]);
    }

    /**
     * Remove the specified machine movement.
     */
    public function destroy(int $id): JsonResponse
    {
        $movement = MachineMovement::findOrFail($id);
        $movement->delete();

        return response()->json([
            'message' => 'Machine movement deleted successfully',
        ]);
    }

    /**
     * Get machine utilization statistics.
     */
    public function utilization(Request $request, int $machineId): JsonResponse
    {
        $startDate = $request->start_date ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $request->end_date ?? now()->endOfMonth()->format('Y-m-d');

        $movements = MachineMovement::forMachine($machineId)
            ->inDateRange($startDate, $endDate)
            ->get();

        $totalMinutes = 0;
        $activeMinutes = 0;
        $pausedMinutes = 0;
        $completedCount = 0;

        foreach ($movements as $movement) {
            $duration = $movement->getDurationMinutes();
            $totalMinutes += $duration;

            switch ($movement->status) {
                case 'active':
                    $activeMinutes += $duration;
                    break;
                case 'paused':
                    $pausedMinutes += $duration;
                    break;
                case 'completed':
                    $completedCount++;
                    $activeMinutes += $duration;
                    break;
            }
        }

        $periodMinutes = now()->parse($startDate)->diffInMinutes($endDate);
        $utilization = $periodMinutes > 0 ? ($activeMinutes / $periodMinutes) * 100 : 0;

        return response()->json([
            'machine_id' => $machineId,
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'statistics' => [
                'total_movements' => $movements->count(),
                'completed_count' => $completedCount,
                'total_minutes' => $totalMinutes,
                'active_minutes' => $activeMinutes,
                'paused_minutes' => $pausedMinutes,
                'utilization_percentage' => round($utilization, 2),
            ],
        ]);
    }

    /**
     * Start a machine movement (helper method).
     */
    public function start(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'machine_id' => 'required|exists:machines,id',
            'production_id' => 'nullable|exists:productions,id',
            'operator_id' => 'nullable|exists:operators,id',
            'notes' => 'nullable|string',
        ]);

        // Check if there's already an active movement for this machine
        $activeMovement = MachineMovement::where('machine_id', $validated['machine_id'])
            ->where('status', 'active')
            ->first();

        if ($activeMovement) {
            return response()->json([
                'message' => 'Machine already has an active movement',
                'active_movement' => $activeMovement,
            ], 400);
        }

        $movement = MachineMovement::create([
            'machine_id' => $validated['machine_id'],
            'production_id' => $validated['production_id'] ?? null,
            'operator_id' => $validated['operator_id'] ?? null,
            'start_time' => now(),
            'status' => 'active',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Machine movement started successfully',
            'data' => $movement->load(['machine', 'production', 'operator']),
        ], 201);
    }

    /**
     * Stop a machine movement (helper method).
     */
    public function stop(int $id): JsonResponse
    {
        $movement = MachineMovement::findOrFail($id);

        if ($movement->status !== 'active') {
            return response()->json([
                'message' => 'Machine movement is not active',
            ], 400);
        }

        $movement->update([
            'end_time' => now(),
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Machine movement stopped successfully',
            'data' => $movement->load(['machine', 'production', 'operator']),
        ]);
    }
}
