<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ClientController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('clients.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('clients.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('clients.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('clients.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $clients = Client::orderBy('name')->paginate($perPage);
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:clients,code',
            'name' => 'required|string|max:255',
            'rfc' => 'nullable|string|max:13',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'credit_limit' => 'sometimes|numeric|min:0',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['credit_limit'] = $data['credit_limit'] ?? 0;
        $data['balance'] = $data['balance'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';

        $client = Client::create($data);
        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        return response()->json($client);
    }

    public function update(Request $request, Client $client)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:clients,code,' . $client->id,
            'name' => 'sometimes|required|string|max:255',
            'rfc' => 'nullable|string|max:13',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'credit_limit' => 'sometimes|numeric|min:0',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $client->update($validator->validated());
        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(null, 204);
    }
}
