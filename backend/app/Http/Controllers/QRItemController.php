<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QRItem;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class QRItemController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('qritems.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('qritems.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('qritems.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('qritems.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(QRItem::orderByDesc('generated')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:q_r_items,code',
            'name' => 'required|string|max:255',
            'generated' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = QRItem::create($validator->validated());
        return response()->json($item, 201);
    }

    public function show(QRItem $qRItem)
    {
        return response()->json($qRItem);
    }

    public function update(Request $request, QRItem $qRItem)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|required|string|max:255',
            'name' => 'sometimes|required|string|max:255',
            'generated' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $qRItem->update($validator->validated());
        return response()->json($qRItem);
    }

    public function destroy(QRItem $qRItem)
    {
        $qRItem->delete();
        return response()->json(null, 204);
    }
}
