<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movement;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MovementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('movements.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Movement::with('bankAccount')->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'type' => 'required|in:income,expense,transfer',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|numeric',
            'balance' => 'required|numeric',
            'status' => 'sometimes|in:completed,pending,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'completed';

        $item = Movement::create($data)->load('bankAccount');
        return response()->json($item, 201);
    }

    public function show(Movement $movement)
    {
        return response()->json($movement->load('bankAccount'));
    }

    public function update(Request $request, Movement $movement)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:income,expense,transfer',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'amount' => 'sometimes|numeric',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:completed,pending,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $movement->update($validator->validated());
        return response()->json($movement->load('bankAccount'));
    }

    public function destroy(Movement $movement)
    {
        $movement->delete();
        return response()->json(null, 204);
    }
}
