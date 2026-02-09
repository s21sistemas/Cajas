<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Absence;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AbsenceController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('absences.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('absences.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('absences.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('absences.delete'),
                only: ['destroy']
            ),
        ];
    }

    // Lista todas las ausencias junto con el usuario relacionado
    public function index(Request $request)
    {
        $absences = Absence::with('employee')->paginate($request->get('per_page', 15));
        return response()->json($absences);
    }

    // Almacena una nueva ausencia
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'type' => 'required|in:justified,unjustified,late',
            'reason' => 'nullable|string',
            'status' => 'sometimes|in:registered,justified,discounted',
            'deduction' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Rellenar datos denormalizados desde employee
        $employee = Employee::findOrFail($data['employee_id']);
        $data['employee_name'] = $employee->name;
        $data['department'] = $employee->department;

        $absence = Absence::create($data);
        $absence->load('employee');
        return response()->json($absence, 201);
    }

    // Muestra la información de una ausencia específica
    public function show($id)
    {
        $absence = Absence::with('employee')->findOrFail($id);
        return response()->json($absence);
    }

    // Actualiza una ausencia existente
    public function update(Request $request, $id)
    {
        $absence = Absence::findOrFail($id);

        // Validar los datos que se quieren actualizar
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:justified,unjustified,late',
            'reason' => 'nullable|string',
            'status' => 'sometimes|in:registered,justified,discounted',
            'deduction' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Actualizar la ausencia con los datos validados
        $absence->update($validator->validated());
        $absence->load('employee');
        return response()->json($absence);
    }

    // Elimina una ausencia
    public function destroy($id)
    {
        $absence = Absence::findOrFail($id);
        $absence->delete();

        return response()->json(['message' => 'Ausencia eliminada exitosamente.']);
    }
}
