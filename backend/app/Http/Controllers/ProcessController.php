<?php

namespace App\Http\Controllers;

use App\Models\Process;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProcessController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('processes.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('processes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('processes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('processes.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = Process::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('process_type', 'like', "%{$search}%");
            });
        }

        if ($request->has('type') && $request->type && $request->type !== 'all') {
            $query->where('process_type', $request->type);
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate($perPage));
    }

    public function selectListProcesses(){
        return response()->json(Process::select('id', 'name')->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'nullable|string|max:255|unique:processes,code',
            'name' => 'required|string|max:255',
            'process_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'requires_machine' => 'sometimes|boolean',
            'estimated_time_min' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,inactive',
        ]);

        // Generar código si no se proporciona
        if (empty($data['code'])) {
            $data['code'] = 'PROC-' . str_pad(Process::max('id') + 1, 5, '0', STR_PAD_LEFT);
        }

        $data['status'] = $data['status'] ?? 'active';
        $data['requires_machine'] = $data['requires_machine'] ?? false;

        $process = Process::create($data);

        return response()->json($process, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Process $process)
    {
        return response()->json($process);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Process $process)
    {
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:processes,code,' . $process->id,
            'name' => 'sometimes|required|string|max:255',
            'process_type' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'requires_machine' => 'sometimes|boolean',
            'estimated_time_min' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $process->update($data);

        return response()->json($process);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Process $process)
    {
        $process->delete();

        return response()->json(null, 204);
    }

    /**
     * Get process statistics.
     */
    public function stats()
    {
        $processes = Process::all();

        return response()->json([
            'total' => $processes->count(),
            'active' => $processes->where('status', 'active')->count(),
            'inactive' => $processes->where('status', 'inactive')->count(),
            'byType' => $processes->groupBy('process_type')->map->count(),
            'withMachine' => $processes->where('requires_machine', true)->count(),
            'withoutMachine' => $processes->where('requires_machine', false)->count(),
        ]);
    }
}
