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
    public function index()
    {
        // Devuelve todos los procesos
        return response()->json(Process::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar los datos segun migracion
        $data = $request->validate([
            'part_id' => 'required|exists:parts,id',
            'machine_id' => 'required|exists:machines,id',
            'process_type' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'sequence' => 'required|integer|min:1',
            'estimated_time_min' => 'nullable|numeric|min:0',
            'status' => 'sometimes|string|max:255'
        ]);

        // Valor por defecto para status si no se provee
        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

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
            'part_id' => 'sometimes|required|exists:parts,id',
            'machine_id' => 'sometimes|required|exists:machines,id',
            'process_type' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:255',
            'sequence' => 'sometimes|required|integer|min:1',
            'estimated_time_min' => 'nullable|numeric|min:0',
            'status' => 'sometimes|string|max:255'
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
}
