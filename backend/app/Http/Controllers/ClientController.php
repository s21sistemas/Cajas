<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
                only: ['index', 'show', 'stats']
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

    public function index(Request $request): JsonResponse
    {
        $query = Client::query();

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return response()->json($query->paginate(100));
    }

    public function selectListClient(): JsonResponse
    {
        $clients = Client::where('status', 'active')->get();
        return response()->json($clients);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Client::count(),
            'active' => Client::where('status', 'active')->count(),
            'inactive' => Client::where('status', 'inactive')->count(),
            'blocked' => Client::where('status', 'blocked')->count(),
            'totalCredit' => (float) Client::sum('credit_limit'),
            'totalBalance' => (float) Client::sum('balance'),
        ];

        return response()->json($stats);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:clients,code',
            'contacto' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'name' => 'required|string|max:255',
            'rfc' => 'nullable|string|max:13',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,blocked',
        ]);

        $client = Client::create(array_merge($validated, [
            'credit_limit' => $validated['credit_limit'] ?? 0,
            'balance' => $validated['balance'] ?? 0,
            'status' => $validated['status'] ?? 'active',
        ]));

        return response()->json($client, 201);
    }

    public function show(Client $client): JsonResponse
    {
        return response()->json($client);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:clients,code,' . $client->id,
            'contacto' => 'nullable|string|max:255',
            'whatsapp' => 'nullable|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'rfc' => 'nullable|string|max:13',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,blocked',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client): JsonResponse
    {
        if ($client->sales()->exists() || $client->quotes()->exists()) {
            return response()->json([
                'message' => 'No se puede eliminar el cliente porque tiene ventas o cotizaciones asociadas',
            ], 422);
        }

        $client->delete();

        return response()->json(null, 204);
    }
}
