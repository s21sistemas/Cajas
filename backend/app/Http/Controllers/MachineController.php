<?php

namespace App\Http\Controllers;

use App\Models\Machine;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MachineController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),

            new Middleware(
                PermissionMiddleware::using('machines.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('machines.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Devuelve todas las máquinas
        return response()->json(Machine::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar los datos según la migración
        $data = $request->validate([
            'code' => 'required|string|max:255|unique:machines,code',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'axes' => 'required|integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Asigna el valor por defecto de status si no se envió
        if (!isset($data['status'])) {
            $data['status'] = 'available';
        }

        $machine = Machine::create($data);

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
        // Validar los datos según la migración
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:machines,code,' . $machine->id,
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'axes' => 'sometimes|required|integer|min:1|max:255',
            'status' => 'sometimes|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $machine->update($data);

        return response()->json($machine);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Machine $machine)
    {
        $machine->delete();
        return response()->json(null, 204);
    }
}
