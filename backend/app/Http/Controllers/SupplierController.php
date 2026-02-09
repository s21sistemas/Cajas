<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Supplier;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SupplierController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('suppliers.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Supplier::orderBy('name')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'rfc' => 'required|string|max:20|unique:suppliers,rfc',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'contact' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'lead_time' => 'sometimes|integer|min:0',
            'rating' => 'sometimes|integer|min:0|max:5',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['lead_time'] = $data['lead_time'] ?? 0;
        $data['rating'] = $data['rating'] ?? 0;
        $data['balance'] = $data['balance'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        $item = Supplier::create($data);
        return response()->json($item, 201);
    }

    public function show(Supplier $supplier)
    {
        return response()->json($supplier);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $supplier->id,
            'name' => 'sometimes|required|string|max:255',
            'rfc' => 'sometimes|required|string|max:20|unique:suppliers,rfc,' . $supplier->id,
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'contact' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'lead_time' => 'sometimes|integer|min:0',
            'rating' => 'sometimes|integer|min:0|max:5',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $supplier->update($validator->validated());
        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return response()->json(null, 204);
    }
}
