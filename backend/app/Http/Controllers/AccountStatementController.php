<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AccountStatement;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AccountStatementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('accountstatements.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = AccountStatement::with('client')->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'required|exists:clients,id',
            'invoice_number' => 'required|string|max:255',
            'date' => 'required|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'amount' => 'required|numeric',
            'paid' => 'sometimes|numeric|min:0',
            'balance' => 'required|numeric',
            'status' => 'sometimes|in:paid,pending,overdue,partial',
            'concept' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['paid'] = $data['paid'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        $item = AccountStatement::create($data)->load('client');
        return response()->json($item, 201);
    }

    public function show(AccountStatement $accountStatement)
    {
        return response()->json($accountStatement->load('client'));
    }

    public function update(Request $request, AccountStatement $accountStatement)
    {
        $validator = Validator::make($request->all(), [
            'invoice_number' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|date',
            'due_date' => 'nullable|date|after_or_equal:date',
            'amount' => 'sometimes|numeric',
            'paid' => 'sometimes|numeric|min:0',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:paid,pending,overdue,partial',
            'concept' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $accountStatement->update($validator->validated());
        return response()->json($accountStatement->load('client'));
    }

    public function destroy(AccountStatement $accountStatement)
    {
        $accountStatement->delete();
        return response()->json(null, 204);
    }
}
