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
    public function index()
    {
        return response()->json(Operator::all());
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
