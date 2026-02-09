<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GuardPayment;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class GuardPaymentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('guardpayments.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('guardpayments.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('guardpayments.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('guardpayments.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = GuardPayment::with('employee')->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'shift' => 'required|in:day,night,weekend,holiday',
            'hours' => 'required|numeric|min:0',
            'rate' => 'required|numeric|min:0',
            'amount' => 'required|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,paid',
            'notes' => 'nullable|string',
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

        $item = GuardPayment::create($data)->load('employee');
        return response()->json($item, 201);
    }

    public function show(GuardPayment $guardPayment)
    {
        return response()->json($guardPayment->load('employee'));
    }

    public function update(Request $request, GuardPayment $guardPayment)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'shift' => 'sometimes|in:day,night,weekend,holiday',
            'hours' => 'sometimes|numeric|min:0',
            'rate' => 'sometimes|numeric|min:0',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,approved,paid',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guardPayment->update($validator->validated());
        return response()->json($guardPayment->load('employee'));
    }

    public function destroy(GuardPayment $guardPayment)
    {
        $guardPayment->delete();
        return response()->json(null, 204);
    }
}
