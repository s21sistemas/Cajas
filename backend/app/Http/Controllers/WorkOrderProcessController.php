<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WorkOrderProcess;

class WorkOrderProcessController extends Controller
{
    public function index(Request $request)
    {
        $query = WorkOrderProcess::with(['workOrder', 'process', 'machine', 'employee']);

        if ($request->filled('work_order_id')) {
            $query->where('work_order_id', $request->integer('work_order_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'work_order_id' => 'required|exists:work_orders,id',
            'process_id' => 'required|exists:processes,id',
            'machine_id' => 'nullable|exists:machines,id',
            'employee_id' => 'nullable|exists:employees,id',
            'status' => 'nullable|in:pending,working,finished',
            'quantity_done' => 'nullable|integer|min:0',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        $validated['status'] = $validated['status'] ?? 'pending';
        $validated['quantity_done'] = $validated['quantity_done'] ?? 0;

        $record = WorkOrderProcess::create($validated);

        return response()->json($record->load(['workOrder', 'process', 'machine', 'employee']), 201);
    }

    public function show(WorkOrderProcess $workOrderProcess)
    {
        return response()->json(
            $workOrderProcess->load(['workOrder', 'process', 'machine', 'employee'])
        );
    }

    public function update(Request $request, WorkOrderProcess $workOrderProcess)
    {
        $validated = $request->validate([
            'machine_id' => 'nullable|exists:machines,id',
            'employee_id' => 'nullable|exists:employees,id',
            'status' => 'sometimes|in:pending,working,finished',
            'quantity_done' => 'sometimes|integer|min:0',
            'started_at' => 'nullable|date',
            'finished_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        $workOrderProcess->update($validated);

        return response()->json(
            $workOrderProcess->load(['workOrder', 'process', 'machine', 'employee'])
        );
    }

    public function destroy(WorkOrderProcess $workOrderProcess)
    {
        $workOrderProcess->delete();

        return response()->json(null, 204);
    }
}
