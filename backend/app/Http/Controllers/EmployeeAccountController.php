<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmployeeAccount;
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

    public function index()
    {
        return response()->json(EmployeeAccount::all());
    }

    public function store()
    {
        $item = EmployeeAccount::create();
        return response()->json($item, 201);
    }

    public function show(EmployeeAccount $employeeAccount)
    {
        return response()->json($employeeAccount);
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
