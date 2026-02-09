<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BankAccountController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('bankaccounts.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('bankaccounts.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('bankaccounts.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('bankaccounts.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = BankAccount::orderBy('bank')->orderBy('name')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bank' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'clabe' => 'nullable|string|max:18',
            'type' => 'required|in:checking,savings,credit',
            'currency' => 'required|in:MXN,USD',
            'balance' => 'sometimes|numeric',
            'available_balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,blocked',
            'last_movement' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['balance'] = $data['balance'] ?? 0;
        $data['available_balance'] = $data['available_balance'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';

        $item = BankAccount::create($data);
        return response()->json($item, 201);
    }

    public function show(BankAccount $bankAccount)
    {
        return response()->json($bankAccount);
    }

    public function update(Request $request, BankAccount $bankAccount)
    {
        $validator = Validator::make($request->all(), [
            'bank' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'clabe' => 'nullable|string|max:18',
            'type' => 'sometimes|in:checking,savings,credit',
            'currency' => 'sometimes|in:MXN,USD',
            'balance' => 'sometimes|numeric',
            'available_balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,blocked',
            'last_movement' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bankAccount->update($validator->validated());
        return response()->json($bankAccount);
    }

    public function destroy(BankAccount $bankAccount)
    {
        $bankAccount->delete();
        return response()->json(null, 204);
    }
}
