<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\SupplierStatement;
use App\Models\Movement;
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
                only: ['index', 'show', 'stats']
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
        $query = PurchaseOrder::with(['supplier', 'material']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('supplier_name', 'like', "%{$search}%")
                  ->orWhere('material_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:255|unique:purchase_orders,code',
            'supplier_id' => 'required|exists:suppliers,id',
            'material_id' => 'nullable|exists:materials,id',
            'material_name' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'iva_percentage' => 'nullable|numeric|min:0|max:100',
            'iva' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'items' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:draft,paid,pending,approved,ordered,partial,received,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'sometimes|integer|min:0',
            'requested_by' => 'sometimes|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'expected_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $supplier = Supplier::findOrFail($data['supplier_id']);
        
        // Auto-generar código si no se proporciona
        if (!isset($data['code'])) {
            $data['code'] = 'OC-' . date('Ymd') . '-' . 
                str_pad(PurchaseOrder::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);
        }
        
        $data['supplier_name'] = $supplier->name;
        $data['items'] = $data['items'] ?? $data['quantity'] ?? 0;
        $data['total'] = $data['total'] ?? 0;
        $data['status'] = $data['status'] ?? 'draft';
        $data['priority'] = $data['priority'] ?? 'medium';
        $data['requested_by'] = $data['requested_by'] ?? 'Sistema';

        $purchaseOrder = PurchaseOrder::create($data)->load('supplier');
        
        // Crear registro en el estado de cuenta del proveedor al crear la orden
        // Solo si el estado es diferente de draft (draft es pendiente de aprobación)
        if ($purchaseOrder->status === 'ordered') {
            $this->createOrUpdateSupplierStatementFromOrder($purchaseOrder);
        }
        
        return response()->json($purchaseOrder->load('supplier'), 201);
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier'));
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'supplier_id' => 'sometimes|required|exists:suppliers,id',
            'material_id' => 'nullable|exists:materials,id',
            'material_name' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'subtotal' => 'nullable|numeric|min:0',
            'iva_percentage' => 'nullable|numeric|min:0|max:100',
            'iva' => 'nullable|numeric|min:0',
            'items' => 'sometimes|integer|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,paid,pending,approved,ordered,partial,received,cancelled',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'sometimes|integer|min:0',
            'requested_by' => 'sometimes|required|string|max:255',
            'approved_by' => 'nullable|string|max:255',
            'expected_date' => 'nullable|date',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Obtener el estado anterior
        $previousStatus = $purchaseOrder->status;
        $newStatus = $data['status'] ?? $previousStatus;
        
        // Actualizar supplier_name si cambia supplier_id
        if (isset($data['supplier_id'])) {
            $supplier = Supplier::find($data['supplier_id']);
            if ($supplier) {
                $data['supplier_name'] = $supplier->name;
            }
        }
        
        // Actualizar items si cambia quantity
        if (isset($data['quantity'])) {
            $data['items'] = $data['quantity'];
        }

        $purchaseOrder->update($data);
        
        // Si el estado cambia a "ordered", procesar según tipo de pago
        if ($newStatus === 'ordered' && $previousStatus !== 'ordered') {
            $this->createOrUpdateSupplierStatementFromOrder($purchaseOrder);
        }
        
        return response()->json($purchaseOrder->load('supplier'));
    }
    
    /**
     * Crea o actualiza un registro en el estado de cuenta del proveedor cuando la orden se marca como ordenada
     */
    private function createOrUpdateSupplierStatementFromOrder(PurchaseOrder $order): void
    {
        $supplier = $order->supplier;
        if (!$supplier) {
            return;
        }
        
        // Calcular fecha de vencimiento basada en días de crédito
        $dueDate = $order->due_date;
        if (!$dueDate && $order->credit_days > 0) {
            $dueDate = now()->addDays($order->credit_days);
        } elseif (!$dueDate) {
            $dueDate = now()->addDays(30); // Default 30 días
        }
        
        // Buscar si ya existe un supplier statement para esta orden
        $supplierStatement = \App\Models\SupplierStatement::where('purchase_order_id', $order->id)->first();
        
        if ($supplierStatement) {
            // Actualizar existente
            $oldBalance = $supplierStatement->balance;
            $supplierStatement->update([
                'code' => $order->code,
                'supplier_name' => $order->supplier_name,
                'due_date' => $dueDate instanceof \Carbon\Carbon ? $dueDate->toDateString() : $dueDate,
                'amount' => $order->total,
                'balance' => $order->total - $supplierStatement->paid,
                'concept' => 'Orden de compra - ' . ($order->material_name ?? 'Material'),
            ]);
            
            // Ajustar el saldo del proveedor
            $supplier->balance = ($supplier->balance ?? 0) - $oldBalance + $supplierStatement->balance;
            $supplier->save();
        } else {
            // Crear nuevo registro
            \App\Models\SupplierStatement::create([
                'code' => $order->code,
                'purchase_order_id' => $order->id,
                'supplier_id' => $order->supplier_id,
                'supplier_name' => $order->supplier_name,
                'date' => now()->toDateString(),
                'due_date' => $dueDate instanceof \Carbon\Carbon ? $dueDate->toDateString() : $dueDate,
                'amount' => $order->total,
                'paid' => 0,
                'balance' => $order->total,
                'status' => 'pending',
                'concept' => 'Orden de compra - ' . ($order->material_name ?? 'Material'),
            ]);
            
            // Actualizar el saldo del proveedor
            $supplier->balance = ($supplier->balance ?? 0) + $order->total;
            $supplier->save();
        }
    }

    /**
     * Registra un pago a proveedor (cuenta por pagar)
     */
    public function recordPayment(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'bank_account_id' => 'nullable|exists:bank_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'payment_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Generar código único para el pago
        $code = 'PAG-PROV-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);

        // Obtener el supplier statement relacionado
        $supplierStatement = $purchaseOrder->supplierStatement;

        // Crear el pago vinculado al supplier_statement
        $payment = \App\Models\Payment::create([
            'code' => $code,
            'purchase_order_id' => $purchaseOrder->id,
            'supplier_statement_id' => $supplierStatement?->id,
            'bank_account_id' => $data['bank_account_id'] ?? null,
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'],
            'reference' => $data['reference'] ?? null,
            'notes' => $data['notes'] ?? null,
            'payment_date' => $data['payment_date'],
            'status' => 'completed',
            'type' => 'payable',
        ]);

        // Crear el movimiento en finanzas (egreso)
        if($data['bank_account_id']){
            Movement::create([
                'type' => 'expense',
                'bank_account_id' => $data['bank_account_id'],
                'category' => 'Materiales',
                'amount' => $data['amount'],
                'description' => 'Pago a proveedor - Orden #' . $purchaseOrder->code . ' - Pago #' . $code,
                'reference' => $code,
                'date' => $data['payment_date'],
                'status' => 'completed',
                'movementable_type' => \App\Models\Payment::class,
                'movementable_id' => $payment->id,
            ]);
        }

        // Actualizar la cuenta por pagar si existe
        if ($supplierStatement) {
            $newPaid = $supplierStatement->paid + $data['amount'];
            $newBalance = max(0, $supplierStatement->amount - $newPaid);
            
            $supplierStatement->update([
                'paid' => $newPaid,
                'balance' => $newBalance,
                'status' => $newBalance <= 0 ? 'paid' : 'pending',
            ]);

            // Verificar si la orden está completamente pagada
            $totalPaid = $purchaseOrder->payments()->sum('amount');
            if ($totalPaid >= $purchaseOrder->total) {
                $purchaseOrder->update(['status' => 'paid']);
            }
        }

        return response()->json($payment->load(['purchaseOrder', 'bankAccount']), 201);
    }

    /**
     * Obtener los pagos de una orden de compra
     */
    public function getPayments(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load(['payments', 'payments.bankAccount']));
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->delete();
        return response()->json(null, 204);
    }

    public function stats()
    {
        $orders = PurchaseOrder::all();
        return response()->json([
            'total' => $orders->count(),
            'pending' => $orders->where('status', 'pending')->count(),
            'approved' => $orders->where('status', 'approved')->count(),
            'received' => $orders->where('status', 'received')->count(),
            'totalAmount' => $orders->sum('total'),
        ]);
    }
}
