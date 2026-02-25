<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Branch;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BranchController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('branches.view'),
                only: ['index', 'show', 'stats']
            ),

            new Middleware(
                PermissionMiddleware::using('branches.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('branches.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('branches.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 100);
        $query = Branch::with('client');

        // Búsqueda
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($clientQuery) use ($search) {
                        $clientQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filtro por estado
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        // Filtro por cliente
        if ($clientId = $request->get('client_id')) {
            $query->where('client_id', $clientId);
        }

        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return response()->json($query->paginate($perPage));
    }

    public function stats()
    {
        $stats = [
            'total' => Branch::count(),
            'active' => Branch::where('status', 'active')->count(),
            'inactive' => Branch::where('status', 'inactive')->count(),
            'cities' => Branch::distinct('city')->count(),
        ];

        return response()->json($stats);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:branches,code',
            'name' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['status'] = $data['status'] ?? 'active';

        $item = Branch::create($data)->load('client');
        return response()->json($item, 201);
    }

    public function show(Branch $branch)
    {
        return response()->json($branch->load('client'));
    }

    public function update(Request $request, Branch $branch)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:branches,code,' . $branch->id,
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $branch->update($validator->validated());
        return response()->json($branch->load('client'));
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();
        return response()->json(null, 204);
    }
}
