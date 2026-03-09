<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Payment;
use App\Models\Client;
use App\Models\AccountStatement;
use App\Models\Movement;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
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
                only: ['store']
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
        $perPage = $request->integer('per_page', 100);
        $items = Sale::with(['client'])->orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    /**
     * Lista de ventas para select
     * Retorna ventas con información del cliente para mostrar en dropdown
     */
    public function selectList()
    {
        $sales = Sale::with(['client:id,name'])
            ->select('id', 'code', 'client_id', 'client_name', 'total', 'status')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'code' => $sale->code,
                    'client_id' => $sale->client_id,
                    'client_name' => $sale->client->name ?? $sale->client_name,
                    'total' => $sale->total,
                    'status' => $sale->status,
                    'code' => $sale->code,
                ];
            });

        return response()->json($sales);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:sales,code',
            'client_id' => 'required|exists:clients,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'quote_ref' => 'nullable|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax_rate' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,paid,overdue,cancelled',           
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'nullable|integer|min:0',           
            'sale_items' => 'sometimes|array',
            'sale_items.*.product_id' => 'nullable|exists:products,id',
            'sale_items.*.unit' => 'nullable|string|max:50',
            'sale_items.*.part_number' => 'nullable|string|max:100',
            'sale_items.*.description' => 'required|string|max:255',
            'sale_items.*.quantity' => 'required|numeric|min:0.01',
            'sale_items.*.unit_price' => 'required|numeric|min:0',
            'sale_items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sale_items.*.discount_amount' => 'nullable|numeric|min:0',
            'sale_items.*.subtotal' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['items'] = $data['items'] ?? 0;
        $data['subtotal'] = $data['subtotal'] ?? 0;
        $data['tax_rate'] = $data['tax_rate'] ?? 16;
        $data['tax'] = $data['tax'] ?? 0;
        $data['total'] = $data['total'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        // Extraer sale_items antes de crear la venta
        $saleItems = $data['sale_items'] ?? [];
        unset($data['sale_items']);

        $quantity = 0;
        foreach ($saleItems as $itemData) {
            $quantity += $itemData['quantity'];
        }

        $data['items'] = $quantity;
        $sale = Sale::create($data)->load('client');
        // Guardar los items de la venta
        foreach ($saleItems as $itemData) {            
            $sale->saleItems()->create([
                'product_id' => $itemData['product_id'] ?? null,
                'unit' => $itemData['unit'] ?? 'PZA',
                'part_number' => $itemData['part_number'] ?? null,
                'description' => $itemData['description'],
                'quantity' => $itemData['quantity'],
                'unit_price' => $itemData['unit_price'],
                'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                'discount_amount' => $itemData['discount_amount'] ?? 0,
                'subtotal' => $itemData['subtotal'] ?? ($itemData['quantity'] * $itemData['unit_price']),
            ]);
        }  

        // Crear AccountStatement según el tipo de pago
        // Si es crédito: cuenta por cobrar pendiente
        // Si es contado: ya está pagada
        // $isCredit = ($data['payment_type'] ?? 'cash') === 'credit';
        // $status = $data['status'];
        AccountStatement::create([
            'sale_id' => $sale->id,
            'client_id' => $sale->client_id,
            'client_name' => $sale->client_name,
            'date' => now()->toDateString(),
            'due_date' => now()->addDays((int) ($data['credit_days'] ?? 0))->toDateString(), // Usar la fecha de vencimiento si está definida, de lo contrario usar la fecha actual'
            'amount' => $sale->total,
            'paid' => 0 ,
            'balance' => $sale->total,
            'status' => 'pending',
            'concept' => 'Venta #' . $sale->code,
        ]);
        
        return response()->json($sale->load('saleItems'), 201);
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['client', 'quote', 'saleItems', 'saleItems.product']));
    }

    /**
     * Exportar venta a PDF
     */
    public function exportPdf(Sale $sale)
    {
        $sale->load(['client', 'quote', 'saleItems.product']);
        
        // Obtener datos de la empresa desde settings
        $companySettings = \App\Models\Setting::where('module', 'company')->get();
        $company = [];
        foreach ($companySettings as $setting) {
            $company[$setting->key] = $setting->value;
        }
        
        // URL del logo - primero buscar en settings, luego usar default
        $logoSetting = \App\Models\Setting::where('module', 'company')->where('key', 'logo')->first();
        $logoData = null;
        
        $logoPath = null;
        if ($logoSetting && $logoSetting->value) {
            // Si es una URL relativa del storage, convertir a ruta absoluta
            if (strpos($logoSetting->value, '/storage/') !== false) {
                $logoPath = public_path($logoSetting->value);
            }
        }
        
        // Si no hay logo en settings, usar el default
        if (!$logoPath || !file_exists($logoPath)) {
            $logoPath = public_path('villazco_logo.jpeg');
        }
        
        // Codificar imagen en base64 para el PDF
        if (file_exists($logoPath)) {
            $mimeType = mime_content_type($logoPath);
            $logoData = 'data:' . $mimeType . ';base64,' . base64_encode(file_get_contents($logoPath));
        }
        
        $pdf = Pdf::loadView('pdf.sale', compact('sale', 'company', 'logoData'));
        
        // Configurar PDF horizontal (landscape) con márgenes adecuados
        $pdf->setPaper('a4', 'landscape')->setOption('margin-top', 15)->setOption('margin-bottom', 15)->setOption('margin-left', 15)->setOption('margin-right', 15);
        
        return $pdf->download('venta-' . now() . '.pdf');
    }

    public function update(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'quote_id' => 'nullable|exists:quotes,id',
            'quote_ref' => 'nullable|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax_rate' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,paid,overdue,cancelled',
            'payment_type' => 'sometimes|in:cash,credit',
            'credit_days' => 'nullable|string|max:10',
            'sale_items' => 'sometimes|array',
            'sale_items.*.id' => 'nullable|exists:sale_items,id',
            'sale_items.*.product_id' => 'nullable|exists:products,id',
            'sale_items.*.unit' => 'nullable|string|max:50',
            'sale_items.*.part_number' => 'nullable|string|max:100',
            'sale_items.*.description' => 'required|string|max:255',
            'sale_items.*.quantity' => 'required|numeric|min:0.01',
            'sale_items.*.unit_price' => 'required|numeric|min:0',
            'sale_items.*.discount_percentage' => 'nullable|numeric|min:0|max:100',
            'sale_items.*.discount_amount' => 'nullable|numeric|min:0',
            'sale_items.*.subtotal' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Extraer sale_items antes de actualizar la venta
        $saleItems = $data['sale_items'] ?? [];
        unset($data['sale_items']);
        
        // Detectar cambio de status
        $oldStatus = $sale->status;
        $newStatus = $data['status'] ?? $oldStatus;
        $oldPaymentType = $sale->payment_type;
        $newPaymentType = $data['payment_type'] ?? $oldPaymentType;
        
        // Actualizar la venta
        $sale->update($data);
        
        // Actualizar los items de la venta si se enviaron
        if (!empty($saleItems)) {
            // Eliminar items que no están en la nueva lista
            $existingIds = $sale->saleItems()->pluck('id')->toArray();
            $newIds = array_filter(array_column($saleItems, 'id'));
            $toDelete = array_diff($existingIds, $newIds);
            
            if (!empty($toDelete)) {
                $sale->saleItems()->whereIn('id', $toDelete)->delete();
            }
            
            // Crear o actualizar items
            foreach ($saleItems as $itemData) {
                if (!empty($itemData['id'])) {
                    // Actualizar item existente
                    $sale->saleItems()->where('id', $itemData['id'])->update([
                        'product_id' => $itemData['product_id'] ?? null,
                        'unit' => $itemData['unit'] ?? 'PZA',
                        'part_number' => $itemData['part_number'] ?? null,
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                        'discount_amount' => $itemData['discount_amount'] ?? 0,
                        'subtotal' => $itemData['subtotal'] ?? ($itemData['quantity'] * $itemData['unit_price']),
                    ]);
                } else {
                    // Crear nuevo item
                    $sale->saleItems()->create([
                        'product_id' => $itemData['product_id'] ?? null,
                        'unit' => $itemData['unit'] ?? 'PZA',
                        'part_number' => $itemData['part_number'] ?? null,
                        'description' => $itemData['description'],
                        'quantity' => $itemData['quantity'],
                        'unit_price' => $itemData['unit_price'],
                        'discount_percentage' => $itemData['discount_percentage'] ?? 0,
                        'discount_amount' => $itemData['discount_amount'] ?? 0,
                        'subtotal' => $itemData['subtotal'] ?? ($itemData['quantity'] * $itemData['unit_price']),
                    ]);
                }
            }
        }
        
       $accountStatement = $sale->accountStatement;
        if ($accountStatement) {
            $accountStatement->update([
                'paid' => $sale->total,
                'balance' => 0,
                'status' => 'paid',
                'due_date' => now()->toDateString(),
            ]);
        }
        
        return response()->json($sale->load(['client', 'quote', 'saleItems']));
    }

    /**
     * Crear un pago para una venta
     * Este método crea el pago, el movimiento en finanzas y actualiza la cuenta por cobrar
     */
    public function createPayment(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'bank_account_id' => 'required|exists:bank_accounts,id',
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
        $code = 'PAG-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);

        // Obtener la cuenta por cobrar relacionada
        $accountStatement = $sale->accountStatement;

        // Crear el pago vinculado al account_statement
        $payment = Payment::create([
            'code' => $code,
            'sale_id' => $sale->id,
            'account_statement_id' => $accountStatement?->id,
            'bank_account_id' => $data['bank_account_id'],
            'amount' => $data['amount'],
            'payment_method' => $data['payment_method'],
            'reference' => $data['reference'] ?? null,
            'notes' => $data['notes'] ?? null,
            'payment_date' => $data['payment_date'],
            'status' => 'completed',
            'type' => 'receivable',
        ]);

        // $bankAccount = BankAccount::find($data['bank_account_id'])->increment('balance', $data['amount']);

        // Crear el movimiento en finanzas vinculado al pago
        // Movement::create([
        //     'type' => 'income',
        //     'bank_account_id' => $data['bank_account_id'],
        //     'balance' => $bankAccount->balance,
        //     'amount' => $data['amount'],
        //     'description' => 'Pago de venta #' . $sale->code . ' - Pago #' . $code,
        //     'reference' => $code,
        //     'date' => $data['payment_date'],
        //     'status' => 'completed',
        //     'movementable_type' => Payment::class,
        //     'movementable_id' => $payment->id,
        // ]);

        // Actualizar la cuenta por cobrar si existe
        $accountStatement = $sale->accountStatement;
        if ($accountStatement) {
            $newPaid = $accountStatement->paid + $data['amount'];
            $newBalance = max(0, $accountStatement->amount - $newPaid);
            
            $accountStatement->update([
                'paid' => $newPaid,
                'balance' => $newBalance,
                'status' => $newBalance <= 0 ? 'paid' : 'pending',
                'payment_date' => $data['payment_date'],
            ]);
        }

        // Verificar si la venta está completamente pagada
        $totalPaid = $sale->payments()->sum('amount');
        if ($totalPaid >= $sale->total) {
            $sale->update(['status' => 'paid']);
        }

        return response()->json($payment->load(['sale', 'bankAccount']), 201);
    }

    /**
     * Obtener los pagos de una venta
     */
    public function getPayments(Sale $sale)
    {
        return response()->json($sale->load(['payments', 'payments.bankAccount']));
    }

    public function destroy(Sale $sale)
    {
        $sale->delete();
        return response()->json(null, 204);
    }

    /**
     * Get sales statistics.
     */
    public function stats()
    {
        $sales = Sale::all();

        $totalRevenue = $sales->sum('total');

        return response()->json([
            'total' => $sales->count(),
            'totalAmount' => $totalRevenue,
        ]);
    }

    /**
     * Obtener ventas por cliente
     * Usado para cargar ventas en WorkOrder cuando se selecciona un cliente
     * Accessible con login sin permisos especiales
     */
    public function getByClient(Request $request)
    {
        $clientId = $request->route('client_id');
        
        if (!$clientId) {
            return response()->json([
                'success' => false,
                'message' => 'Se requiere el ID del cliente'
            ], 400);
        }

        $sales = Sale::where('client_id', $clientId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'invoice' => $sale->code,
                    'client_name' => $sale->client_name,
                    'total' => $sale->total,
                    'status' => $sale->status,
                    'due_date' => $sale->due_date,
                    'created_at' => $sale->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $sales
        ]);
    }

    /**
     * Obtener los items de una venta
     */
    public function getItems(Sale $sale)
    {
        return response()->json([
            'success' => true,
            'data' => $sale->saleItems()->with('product')->get()
        ]);
    }

    /**
     * Agregar un item a la venta
     */
    public function addItem(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'unit' => 'nullable|string|max:50',
            'part_number' => 'nullable|string|max:100',
            'description' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['sale_id'] = $sale->id;
        
        // Calcular subtotal
        $subtotal = $data['quantity'] * $data['unit_price'];
        if (isset($data['discount_percentage']) && $data['discount_percentage'] > 0) {
            $subtotal -= $subtotal * ($data['discount_percentage'] / 100);
        }
        if (isset($data['discount_amount']) && $data['discount_amount'] > 0) {
            $subtotal -= $data['discount_amount'];
        }
        $data['subtotal'] = max(0, $subtotal);

        $item = SaleItem::create($data);
        
        // Recalcular totales de la venta
        $sale->recalculateTotals($sale->tax_rate ?? 16);

        return response()->json([
            'success' => true,
            'message' => 'Item agregado correctamente',
            'data' => $item->load('product')
        ], 201);
    }

    /**
     * Actualizar un item de la venta
     */
    public function updateItem(Request $request, Sale $sale, SaleItem $item)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id',
            'unit' => 'nullable|string|max:50',
            'part_number' => 'nullable|string|max:100',
            'description' => 'sometimes|required|string|max:255',
            'quantity' => 'sometimes|required|numeric|min:0.01',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Calcular subtotal
        if (isset($data['quantity']) || isset($data['unit_price'])) {
            $quantity = $data['quantity'] ?? $item->quantity;
            $unitPrice = $data['unit_price'] ?? $item->unit_price;
            $subtotal = $quantity * $unitPrice;
            
            $discountPercentage = $data['discount_percentage'] ?? $item->discount_percentage ?? 0;
            $discountAmount = $data['discount_amount'] ?? $item->discount_amount ?? 0;
            
            if ($discountPercentage > 0) {
                $subtotal -= $subtotal * ($discountPercentage / 100);
            }
            if ($discountAmount > 0) {
                $subtotal -= $discountAmount;
            }
            $data['subtotal'] = max(0, $subtotal);
        }

        $item->update($data);
        
        // Recalcular totales de la venta
        $sale->recalculateTotals($sale->tax_rate ?? 16);

        return response()->json([
            'success' => true,
            'message' => 'Item actualizado correctamente',
            'data' => $item->load('product')
        ]);
    }

    /**
     * Eliminar un item de la venta
     */
    public function deleteItem(Sale $sale, SaleItem $item)
    {
        $item->delete();
        
        // Recalcular totales de la venta
        $sale->recalculateTotals($sale->tax_rate ?? 16);

        return response()->json([
            'success' => true,
            'message' => 'Item eliminado correctamente'
        ]);
    }

    /**
     * Registrar pago de una venta
     * Si es de contado: crea Movement en finanzas
     * Si es crédito: actualiza AccountStatement
     */
    public function recordPayment(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:255',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $amount = $data['amount'];

        return DB::transaction(function () use ($sale, $data, $amount) {
            // Si es de contado, registrar en movimientos de banco
            if ($sale->payment_type === 'cash' || $sale->payment_type === 'contado') {
                $bankAccount = BankAccount::findOrFail($data['bank_account_id']);
                
                // Crear movimiento de ingreso
                $movement = Movement::create([
                    'date' => now()->toDateString(),
                    'type' => 'income',
                    'category' => 'Ventas',
                    'description' => 'Pago de Venta #' . $sale->code,
                    'reference' => $data['reference'] ?? 'PAGO-' . date('Ymd') . '-' . str_pad($sale->id, 4, '0', STR_PAD_LEFT),
                    'bank_account_id' => $data['bank_account_id'],
                    'amount' => $amount,
                    'balance' => $bankAccount->balance + $amount,
                    'status' => 'completed',
                ]);

                // Actualizar saldo de cuenta bancaria
                $bankAccount->balance += $amount;
                $bankAccount->save();
            }

            // Actualizar o crear AccountStatement
            $accountStatement = AccountStatement::where('code', $sale->code)->first();
            
            if ($accountStatement) {
                $newPaid = $accountStatement->paid + $amount;
                $newBalance = $accountStatement->amount - $newPaid;
                
                $accountStatement->update([
                    'paid' => $newPaid,
                    'balance' => max(0, $newBalance),
                    'status' => $newBalance <= 0 ? 'paid' : 'partial',
                ]);
            } else {
                // Crear account statement si no existe
                AccountStatement::create([
                    'code' => $sale->code,
                    'client_id' => $sale->client_id,
                    'client_name' => $sale->client_name,
                    'date' => now()->toDateString(),
                    'due_date' => $sale->due_date,
                    'amount' => $sale->total,
                    'paid' => $amount,
                    'balance' => $sale->total - $amount,
                    'status' => $amount >= $sale->total ? 'paid' : 'partial',
                    'concept' => 'Venta #' . $sale->code . ' - Pago registrado',
                ]);
            }

            // Actualizar estado de la venta
            $isPaid = $accountStatement ? ($accountStatement->paid + $amount) >= $sale->total : $amount >= $sale->total;
            if ($isPaid) {
                $sale->update(['status' => 'paid']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago registrado correctamente',
                'data' => [
                    'sale' => $sale->fresh(),
                    'amount_paid' => $amount,
                    'payment_method' => $data['payment_method'],
                ]
            ]);
        });
    }

    /**
     * Completar venta (pasar de pending a pagada)
     * Registra el pago y crea el movimiento correspondiente
     */
    public function complete(Request $request, Sale $sale)
    {
        $validator = Validator::make($request->all(), [
            'payment_type' => 'sometimes|in:cash,credit,contado,credito',
            'credit_days' => 'nullable|integer|min:0',
            'bank_account_id' => 'required_if:payment_type,cash|required_if:payment_type,contado|nullable|exists:bank_accounts,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $previousStatus = $sale->status;

        return DB::transaction(function () use ($sale, $data, $previousStatus) {
            // Actualizar tipo de pago si se proporciona
            if (isset($data['payment_type'])) {
                $sale->update([
                    'payment_type' => $data['payment_type'],
                    'credit_days' => $data['credit_days'] ?? $sale->credit_days,
                ]);

                // Si es crédito, calcular nueva fecha de vencimiento
                if (in_array($data['payment_type'], ['credit', 'credito']) && isset($data['credit_days'])) {
                    $dueDate = now()->addDays($data['credit_days']);
                    $sale->update(['due_date' => $dueDate]);
                }
            }

            // Si es de contado, registrar movimiento en finanzas
            $paymentType = $data['payment_type'] ?? $sale->payment_type;
            if (in_array($paymentType, ['cash', 'contado'])) {
                $bankAccountId = $data['bank_account_id'] ?? null;
                
                if (!$bankAccountId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Para ventas de contado debe seleccionar una cuenta bancaria'
                    ], 422);
                }

                $bankAccount = BankAccount::findOrFail($bankAccountId);

                // Crear movimiento de ingreso
                Movement::create([
                    'date' => now()->toDateString(),
                    'type' => 'income',
                    'category' => 'Ventas',
                    'description' => 'Pago completo de Venta #' . $sale->code,
                    'reference' => 'VNTA-' . $sale->code . '-' . date('Ymd'),
                    'bank_account_id' => $bankAccountId,
                    'amount' => $sale->total,
                    'balance' => $bankAccount->balance + $sale->total,
                    'status' => 'completed',
                ]);

                // Actualizar saldo
                $bankAccount->balance += $sale->total;
                $bankAccount->save();

                // Actualizar account statement
                $accountStatement = $sale->accountStatement;
                if ($accountStatement) {
                    $accountStatement->update([
                        'paid' => $sale->total,
                        'balance' => 0,
                        'status' => 'paid',
                    ]);
                }
            }

            // Actualizar estado de la venta
            $sale->update(['status' => 'paid']);

            return response()->json([
                'success' => true,
                'message' => 'Venta completada correctamente',
                'data' => $sale->fresh(['client', 'quote'])
            ]);
        });
    }
}
