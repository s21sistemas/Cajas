<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SaleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('sales.view'),
                only: ['index', 'show', 'stats']
            ),

            new Middleware(
                PermissionMiddleware::using('sales.create'),
                only: ['store', 'recordPayment']
            ),

            new Middleware(
                PermissionMiddleware::using('sales.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('sales.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Sale::with('client')->orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invoice' => 'required|string|max:255|unique:sales,invoice',
            'client_id' => 'required|exists:clients,id',
            'quote_ref' => 'nullable|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'paid' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,partial,paid,overdue,cancelled',
            'payment_method' => 'required|string|max:255',
            'due_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['items'] = $data['items'] ?? 0;
        $data['subtotal'] = $data['subtotal'] ?? 0;
        $data['tax'] = $data['tax'] ?? 0;
        $data['total'] = $data['total'] ?? 0;
        $data['paid'] = $data['paid'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        $item = Sale::create($data)->load('client');
        return response()->json($item, 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load('client'));
    }

    public function update(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'quote_ref' => 'nullable|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'paid' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,partial,paid,overdue,cancelled',
            'payment_method' => 'sometimes|required|string|max:255',
            'due_date' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sale->update($validator->validated());
        return response()->json($sale->load('client'));
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(null, 204);
    }

    /**
     * Record a payment for a sale.
     */
    public function recordPayment(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Actualizar el monto pagado
        $newPaid = $sale->paid + $data['amount'];
        $sale->update(['paid' => $newPaid]);

        // Actualizar estado según el monto pagado
        if ($newPaid >= $sale->total) {
            $sale->update(['status' => 'paid']);
        } elseif ($newPaid > 0) {
            $sale->update(['status' => 'partial']);
        }

        // Aquí podrías crear un registro de movimiento bancario o cuenta por cobrar
        // Por simplicidad, solo actualizamos la venta

        return response()->json($sale->load('client'));
    }

    /**
     * Get sales statistics.
     */
    public function stats()
    {
        $sales = Sale::all();

        $totalRevenue = $sales->sum('total');
        $totalPaid = $sales->sum('paid');
        $pendingAmount = $totalRevenue - $totalPaid;

        return response()->json([
            'total' => $sales->count(),
            'pending' => $sales->where('status', 'pending')->count(),
            'paid' => $sales->where('status', 'paid')->count(),
            'partial' => $sales->where('status', 'partial')->count(),
            'overdue' => $sales->where('status', 'overdue')->count(),
            'totalRevenue' => $totalRevenue,
            'totalPaid' => $totalPaid,
            'pendingAmount' => $pendingAmount,
        ]);
    }
}
