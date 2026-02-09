<?php

namespace App\Http\Controllers;

use App\Models\CncProgram;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CncProgramController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),

            new Middleware(
                PermissionMiddleware::using('cncprograms.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('cncprograms.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('cncprograms.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('cncprograms.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retorna todos los programas CNC con su proceso relacionado
        return response()->json(
            CncProgram::with('process')->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'process_id' => 'required|exists:processes,id',
            'name' => 'required|string|max:255',
            'gcode_path' => 'required|string|max:255',
            'version' => 'sometimes|string|max:255',
            'active' => 'sometimes|boolean',
            'notes' => 'nullable|string'
        ]);

        $cncProgram = CncProgram::create($data);

        return response()->json($cncProgram->load('process'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(CncProgram $cncProgram)
    {
        // Retorna un programa CNC específico con su proceso relacionado
        return response()->json($cncProgram->load('process'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CncProgram $cncProgram)
    {
        $data = $request->validate([
            'process_id' => 'sometimes|required|exists:processes,id',
            'name' => 'sometimes|required|string|max:255',
            'gcode_path' => 'sometimes|required|string|max:255',
            'version' => 'sometimes|string|max:255',
            'active' => 'sometimes|boolean',
            'notes' => 'nullable|string'
        ]);

        $cncProgram->update($data);

        return response()->json($cncProgram->load('process'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CncProgram $cncProgram)
    {
        $cncProgram->delete();
        return response()->json(null, 204);
    }
}
