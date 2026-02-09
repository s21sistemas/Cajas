<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PurchaseOrderController extends Controller
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('purchaseorders.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('purchaseorders.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('purchaseorders.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('purchaseorders.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = PurchaseOrder::with('supplier')->orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:purchase_orders,code',
            'supplier_id' => 'required|exists:suppliers,id',
            'items' => 'sometimes|integer|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,pending,approved,ordered,partial,received,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'requested_by' => 'required|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'expected_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $supplier = Supplier::findOrFail($data['supplier_id']);
        $data['supplier_name'] = $supplier->name;
        $data['items'] = $data['items'] ?? 0;
        $data['total'] = $data['total'] ?? 0;
        $data['status'] = $data['status'] ?? 'draft';
        $data['priority'] = $data['priority'] ?? 'medium';

        $item = PurchaseOrder::create($data)->load('supplier');
        return response()->json($item, 201);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier'));
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'sometimes|integer|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,pending,approved,ordered,partial,received,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'requested_by' => 'sometimes|required|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'expected_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $purchaseOrder->update($validator->validated());
        return response()->json($purchaseOrder->load('supplier'));
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return response()->json(null, 204);
    }
}
