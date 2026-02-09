<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LoanType;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class LoanTypeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('loantypes.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('loantypes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('loantypes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('loantypes.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(LoanType::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:loan_types,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_amount' => 'required|numeric|min:0',
            'max_term_months' => 'required|integer|min:1',
            'interest_rate' => 'required|numeric|min:0',
            'requirements' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'active';

        $item = LoanType::create($data);
        return response()->json($item, 201);
    }

    public function show(LoanType $loanType)
    {
        return response()->json($loanType);
    }

    public function update(Request $request, LoanType $loanType)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:loan_types,code,' . $loanType->id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'max_amount' => 'sometimes|numeric|min:0',
            'max_term_months' => 'sometimes|integer|min:1',
            'interest_rate' => 'sometimes|numeric|min:0',
            'requirements' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $loanType->update($validator->validated());
        return response()->json($loanType);
    }

    public function destroy(LoanType $loanType)
    {
        $loanType->delete();
        return response()->json(null, 204);
    }
}
