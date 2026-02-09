<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Discount;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DiscountController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('discounts.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('discounts.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('discounts.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('discounts.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Discount::with('employee')->orderByDesc('start_date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'type' => 'required|in:loan,infonavit,fonacot,alimony,other',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'period' => 'required|string',
            'status' => 'sometimes|in:active,completed,paused',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $employee = Employee::findOrFail($data['employee_id']);
        $data['employee_name'] = $employee->name;
        $data['department'] = $employee->department;

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $item = Discount::create($data)->load('employee');
        return response()->json($item, 201);
    }

    public function show(Discount $discount)
    {
        return response()->json($discount->load('employee'));
    }

    public function update(Request $request, Discount $discount)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:loan,infonavit,fonacot,alimony,other',
            'description' => 'nullable|string',
            'amount' => 'sometimes|numeric|min:0',
            'period' => 'sometimes|string',
            'status' => 'sometimes|in:active,completed,paused',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $discount->update($validator->validated());
        return response()->json($discount->load('employee'));
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();
        return response()->json(null, 204);
    }
}
