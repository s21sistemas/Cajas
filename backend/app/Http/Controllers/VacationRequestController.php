<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\VacationRequest;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class VacationRequestController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('vacationrequests.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('vacationrequests.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('vacationrequests.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('vacationrequests.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = VacationRequest::with('employee')->orderByDesc('start_date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'days' => 'required|integer|min:1',
            'days_available' => 'required|integer|min:0',
            'type' => 'required|in:vacation,personal,medical',
            'status' => 'sometimes|in:pending,approved,rejected,taken',
            'reason' => 'nullable|string',
            'approved_by' => 'nullable|string',
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

        $item = VacationRequest::create($data)->load('employee');
        return response()->json($item, 201);
    }

    public function show(VacationRequest $vacationRequest)
    {
        return response()->json($vacationRequest->load('employee'));
    }

    public function update(Request $request, VacationRequest $vacationRequest)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'days' => 'sometimes|integer|min:1',
            'days_available' => 'sometimes|integer|min:0',
            'type' => 'sometimes|in:vacation,personal,medical',
            'status' => 'sometimes|in:pending,approved,rejected,taken',
            'reason' => 'nullable|string',
            'approved_by' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vacationRequest->update($validator->validated());
        return response()->json($vacationRequest->load('employee'));
    }

    public function destroy(VacationRequest $vacationRequest)
    {
        $vacationRequest->delete();
        return response()->json(null, 204);
    }
}
