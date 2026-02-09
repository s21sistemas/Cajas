<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DiscountType;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DiscountTypeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('discounttypes.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('discounttypes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('discounttypes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('discounttypes.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(DiscountType::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:discount_types,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:legal,voluntary,company',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'active';

        $item = DiscountType::create($data);
        return response()->json($item, 201);
    }

    public function show(DiscountType $discountType)
    {
        return response()->json($discountType);
    }

    public function update(Request $request, DiscountType $discountType)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:discount_types,code,' . $discountType->id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|in:legal,voluntary,company',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $discountType->update($validator->validated());
        return response()->json($discountType);
    }

    public function destroy(DiscountType $discountType)
    {
        $discountType->delete();
        return response()->json(null, 204);
    }
}
