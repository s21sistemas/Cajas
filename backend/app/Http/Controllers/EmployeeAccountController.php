<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmployeeAccount;
use App\Models\Employee;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EmployeeAccountController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('employeeaccounts.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('employeeaccounts.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('employeeaccounts.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('employeeaccounts.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Obtener todas las cuentas de empleados con datos calculados en tiempo real
     */
    public function index()
    {
        $employees = Employee::with(['loans', 'discounts', 'overtimes', 'guardPayments'])
            ->where('status', 'active')
            ->get();
        
        $accounts = $employees->map(function ($employee) {
            $baseSalary = $employee->salary ?? 0;
            
            // Calcular préstamos activos (balance pendiente)
            $loans = $employee->loans()
                ->where('status', 'active')
                ->sum('balance') ?? 0;
            
            // Calcular descuentos activos
            $discounts = $employee->discounts()
                ->where('status', 'active')
                ->sum('amount') ?? 0;
            
            // Calcular tiempo extra aprobado
            $overtime = $employee->overtimes()
                ->where('status', 'approved')
                ->sum('amount') ?? 0;
            
            // Calcular pagos de guardias
            $guards = $employee->guardPayments()
                ->sum('amount') ?? 0;
            
            // Calcular balance neto
            $netBalance = $baseSalary + $overtime + $guards - $loans - $discounts;
            
            return [
                'id' => $employee->id,
                'employee_id' => $employee->id,
                'employee_name' => $employee->name,
                'department' => $employee->department,
                'base_salary' => $baseSalary,
                'loans' => $loans,
                'discounts' => $discounts,
                'overtime' => $overtime,
                'guards' => $guards,
                'net_balance' => $netBalance,
            ];
        });
        
        return response()->json($accounts);
    }

    /**
     * Obtener una cuenta de empleado específica
     */
    public function show($employeeId)
    {
        $employee = Employee::with(['loans', 'discounts', 'overtimes', 'guardPayments'])
            ->findOrFail($employeeId);
        
        $baseSalary = $employee->salary ?? 0;
        
        $loans = $employee->loans()
            ->where('status', 'active')
            ->sum('balance') ?? 0;
        
        $discounts = $employee->discounts()
            ->where('status', 'active')
            ->sum('amount') ?? 0;
        
        $overtime = $employee->overtimes()
            ->where('status', 'approved')
            ->sum('amount') ?? 0;
        
        $guards = $employee->guardPayments()
            ->sum('amount') ?? 0;
        
        $netBalance = $baseSalary + $overtime + $guards - $loans - $discounts;
        
        return response()->json([
            'id' => $employee->id,
            'employee_id' => $employee->id,
            'employee_name' => $employee->name,
            'department' => $employee->department,
            'base_salary' => $baseSalary,
            'loans' => $loans,
            'discounts' => $discounts,
            'overtime' => $overtime,
            'guards' => $guards,
            'net_balance' => $netBalance,
            'employee' => $employee,
        ]);
    }

    public function store()
    {
        $item = EmployeeAccount::create();
        return response()->json($item, 201);
    }

    public function update(EmployeeAccount $employeeAccount)
    {
        // Sin campos aún: se deja preparado para futuro.
        return response()->json($employeeAccount);
    }

    public function destroy(EmployeeAccount $employeeAccount)
    {
        $employeeAccount->delete();
        return response()->json(null, 204);
    }
}
