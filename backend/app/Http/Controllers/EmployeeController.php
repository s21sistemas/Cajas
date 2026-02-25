<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EmployeeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('employees.view'),
                only: ['index', 'show', 'stats', 'departments']
            ),

            new Middleware(
                PermissionMiddleware::using('employees.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('employees.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('employees.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $query = Employee::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->integer('per_page', 15);
        $employees = $query->latest()->paginate($perPage);

        return $this->paginated($employees, 'Empleados listados correctamente');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:employees,code',
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:employees,email',
            'phone' => 'nullable|string|max:255',
            'salary' => 'required|numeric|min:0',
            'hire_date' => 'required|date',
            'status' => 'sometimes|in:active,inactive,vacation',
            'avatar' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'active';

        $employee = Employee::create($data);
        return $this->created($employee, 'Empleado creado correctamente');
    }

    public function show(Employee $employee)
    {
        return $this->success($employee, 'Empleado obtenido correctamente');
    }

    public function update(Request $request, Employee $employee)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:employees,code,' . $employee->id,
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'department' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:employees,email,' . $employee->id,
            'phone' => 'nullable|string|max:255',
            'salary' => 'sometimes|required|numeric|min:0',
            'hire_date' => 'sometimes|required|date',
            'status' => 'sometimes|in:active,inactive,vacation',
            'avatar' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $employee->update($validator->validated());
        return $this->success($employee, 'Empleado actualizado correctamente');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return $this->deleted('Empleado eliminado correctamente');
    }

    public function stats()
    {
        $employees = Employee::all();
        $active = $employees->where('status', 'active')->count();
        $inactive = $employees->where('status', 'inactive')->count();
        $vacation = $employees->where('status', 'vacation')->count();
        $totalSalary = $employees->sum('salary');

        $data = [
            'total' => $employees->count(),
            'active' => $active,
            'inactive' => $inactive,
            'vacation' => $vacation,
            'totalSalary' => $totalSalary,
        ];

        return $this->success($data, 'Estadísticas de empleados obtenidas correctamente');
    }

    public function departments()
    {
        $departments = Employee::distinct()->pluck('department')->filter()->values();

        return $this->success($departments, 'Departamentos obtenidos correctamente');
    }
}
