<?php

namespace App\Http\Controllers;

use App\Models\Operator;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class OperatorController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('operators.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('operators.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('operators.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('operators.delete'),
                only: ['destroy']
            ),
        ];
    }
    
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search');
        
        $query = Operator::query();
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('shift', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }
        
        $operators = $query->paginate($perPage);
        
        return response()->json($operators);
    }

    /**
     * Display operator statistics.
     */
    public function stats()
    {
        $total = Operator::count();
        $active = Operator::where('active', true)->count();
        $inactive = Operator::where('active', false)->count();
        
        return response()->json([
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_code' => 'required|string|max:255|unique:operators,employee_code',
            'name' => 'required|string|max:255',
            'shift' => 'nullable|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'active' => 'sometimes|boolean',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'hire_date' => 'nullable|date',
        ]);

        $operator = Operator::create($data);

        return response()->json($operator, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Operator $operator)
    {
        return response()->json($operator);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Operator $operator)
    {
        $data = $request->validate([
            'employee_code' => 'sometimes|required|string|max:255|unique:operators,employee_code,' . $operator->id,
            'name' => 'sometimes|required|string|max:255',
            'shift' => 'nullable|string|max:255',
            'specialty' => 'nullable|string|max:255',
            'active' => 'sometimes|boolean',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'hire_date' => 'nullable|date',
        ]);

        $operator->update($data);

        return response()->json($operator);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Operator $operator)
    {
        $operator->delete();
        return response()->json(null, 204);
    }
}
