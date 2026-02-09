<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BankTransaction;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BankTransactionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('banktransactions.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('banktransactions.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('banktransactions.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('banktransactions.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = BankTransaction::orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'required|string|max:255',
            'type' => 'required|in:income,expense,transfer',
            'amount' => 'required|numeric',
            'balance' => 'required|numeric',
            'bank' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = BankTransaction::create($validator->validated());
        return response()->json($item, 201);
    }

    public function show(BankTransaction $bankTransaction)
    {
        return response()->json($bankTransaction);
    }

    public function update(Request $request, BankTransaction $bankTransaction)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'reference' => 'nullable|string|max:255',
            'description' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|in:income,expense,transfer',
            'amount' => 'sometimes|numeric',
            'balance' => 'sometimes|numeric',
            'bank' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bankTransaction->update($validator->validated());
        return response()->json($bankTransaction);
    }

    public function destroy(BankTransaction $bankTransaction)
    {
        $bankTransaction->delete();
        return response()->json(null, 204);
    }
}
