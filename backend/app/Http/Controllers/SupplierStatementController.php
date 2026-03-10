<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SupplierStatement;
use App\Models\Supplier;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SupplierStatementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('supplierstatements.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('supplierstatements.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('supplierstatements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('supplierstatements.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = SupplierStatement::with(['supplier'])->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'required|exists:suppliers,id',
            'code' => 'required|string|max:255',
            'date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:date',
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

        $supplier = Supplier::findOrFail($data['supplier_id']);
        $data['supplier_name'] = $supplier->name;
        $data['paid'] = $data['paid'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        $item = SupplierStatement::create($data)->load('supplier');
        return response()->json($item, 201);
    }

    public function show(SupplierStatement $supplierStatement)
    {
        return response()->json($supplierStatement->load('supplier'));
    }

    public function update(Request $request, SupplierStatement $supplierStatement)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|date',
            'due_date' => 'sometimes|date|after_or_equal:date',
            'amount' => 'sometimes|numeric',
            'paid' => 'sometimes|numeric|min:0',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:paid,pending,overdue,partial',
            'concept' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $supplierStatement->update($validator->validated());
        return response()->json($supplierStatement->load('supplier'));
    }

    public function destroy(SupplierStatement $supplierStatement)
    {
        $supplierStatement->delete();
        return response()->json(null, 204);
    }

    public function stats()
    {
        $statements = SupplierStatement::all();
        return response()->json([
            'totalInvoices' => $statements->count(),
            'totalPayable' => $statements->sum('balance'),
            'totalOverdue' => $statements->where('status', 'overdue')->sum('balance'),
            'totalPaid' => $statements->sum('paid'),
        ]);
    }
}
