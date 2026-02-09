<?php

namespace App\Http\Controllers;

use App\Models\Production;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProductionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('productions.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('productions.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Devuelve todas las producciones más recientes primero
        return response()->json(
            Production::latest()->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar según la migración
        $data = $request->validate([
            'process_id'   => 'required|exists:processes,id',
            'machine_id'   => 'required|exists:machines,id',
            'operator_id'  => 'required|exists:operators,id',
            'start_time'   => 'required|date',
            'end_time'     => 'nullable|date|after_or_equal:start_time',
            'good_parts'   => 'nullable|integer|min:0',
            'scrap_parts'  => 'nullable|integer|min:0',
            'notes'        => 'nullable|string',
        ]);

        // Valores predeterminados
        $data['good_parts'] = $data['good_parts'] ?? 0;
        $data['scrap_parts'] = $data['scrap_parts'] ?? 0;

        $production = Production::create($data);

        return response()->json($production, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Production $production)
    {
        return response()->json($production);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Production $production)
    {
        $data = $request->validate([
            'process_id'   => 'sometimes|required|exists:processes,id',
            'machine_id'   => 'sometimes|required|exists:machines,id',
            'operator_id'  => 'sometimes|required|exists:operators,id',
            'start_time'   => 'sometimes|required|date',
            'end_time'     => 'nullable|date|after_or_equal:start_time',
            'good_parts'   => 'nullable|integer|min:0',
            'scrap_parts'  => 'nullable|integer|min:0',
            'notes'        => 'nullable|string',
        ]);

        $production->update($data);

        return response()->json($production);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Production $production)
    {
        $production->delete();

        return response()->json(null, 204);
    }
}
