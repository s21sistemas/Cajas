<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Disability;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DisabilityController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('disabilities.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('disabilities.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('disabilities.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('disabilities.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Disability::with('employee')->orderByDesc('start_date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|integer|min:1',
            'folio' => 'required|string|unique:disabilities,folio',
            'status' => 'sometimes|in:active,completed,pending',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $employee = Employee::findOrFail($data['employee_id']);
        $data['employee_name'] = $employee->name;
        $data['department'] = $employee->department;

        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        $item = Disability::create($data)->load('employee');
        return response()->json($item, 201);
    }

    public function show(Disability $disability)
    {
        return response()->json($disability->load('employee'));
    }

    public function update(Request $request, Disability $disability)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'days' => 'sometimes|integer|min:1',
            'folio' => 'sometimes|string|unique:disabilities,folio,' . $disability->id,
            'status' => 'sometimes|in:active,completed,pending',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $disability->update($validator->validated());
        return response()->json($disability->load('employee'));
    }

    public function destroy(Disability $disability)
    {
        $disability->delete();
        return response()->json(null, 204);
    }
}
