<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Overtime;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class OvertimeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('overtimes.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('overtimes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('overtimes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('overtimes.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Overtime::with('employee')->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'hours' => 'required|numeric|min:0',
            'type' => 'required|in:simple,double,triple',
            'rate' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,paid',
            'reason' => 'nullable|string',
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

        $item = Overtime::create($data)->load('employee');
        return response()->json($item, 201);
    }

    public function show(Overtime $overtime)
    {
        return response()->json($overtime->load('employee'));
    }

    public function update(Request $request, Overtime $overtime)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'hours' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|in:simple,double,triple',
            'rate' => 'sometimes|numeric|min:0',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,paid',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $overtime->update($validator->validated());
        return response()->json($overtime->load('employee'));
    }

    public function destroy(Overtime $overtime)
    {
        $overtime->delete();
        return response()->json(null, 204);
    }
}
