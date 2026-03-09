<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Sale;
use App\Models\Client;
use App\Models\Product;
use App\Models\AccountStatement;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\QuoteMail;
use Barryvdh\DomPDF\Facade\Pdf;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class QuoteController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('quotes.view'),
                only: ['index', 'show', 'exportPdf', 'stats', 'getItems']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = Quote::with(['client', 'items'])->orderByDesc('created_at');
        
        // Búsqueda
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%");
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
        
        $items = $query->paginate($perPage);
        return response()->json($items);
    }

    public function selectListQuote(){
        $quotes = Quote::where('status', 'approved')->get();
        return response()->json($quotes);
    }

    /**
     * Obtener cotizaciones por cliente
     * Usado para cargar cotizaciones en SaleForm cuando se selecciona un cliente
     */
    public function getByClient(Request $request, $clientId = null)
    {
        // Support route parameter: /quotes/client/{client_id}
        $clientId = $clientId ?? $request->route('client_id');
        
        if (!$clientId) {
            return response()->json([
                'success' => false,
                'message' => 'Se requiere el ID del cliente'
            ], 400);
        }

        try {
            $quotes = Quote::where('client_id', $clientId)
                ->whereIn('status', ['approved'])
                ->orderByDesc('created_at')
                ->get()
                ->map(function ($quote) {
                    return [
                        'id' => $quote->id,
                        'code' => $quote->code,
                        'title' => $quote->title ?? 'Sin título',
                        'client_name' => $quote->client_name,
                        'subtotal' => $quote->subtotal,
                        'tax_percentage' => $quote->tax_percentage,
                        'tax' => $quote->tax,
                        'total' => $quote->total,
                        'status' => $quote->status,
                        'valid_until' => $quote->valid_until,
                        'items_count' => $quote->items_count ?? 0,
                        'created_at' => $quote->created_at,
                    ];
                });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'success' => true,
            'data' => $quotes
        ]);
    }

    /**
     * Obtener los items de una cotización
     * Usado para auto-rellenar los items en SaleForm
     */
    public function getItems(Quote $quote)
    {
        $items = $quote->items()->with('product')->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'unit' => $item->unit,
                    'part_number' => $item->part_number,
                    'description' => $item->description,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total' => $item->total,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'code' => $item->product->code,
                        'unit' => $item->product->unit,
                        'price' => $item->product->price,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:quotes,code',
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string|max:255',
            'status' => 'sometimes|in:draft,sent,approved,rejected,expired',
            'valid_until' => 'required|date_format:Y-m-d',
            'tax_percentage' => 'sometimes|numeric|min:0|max:100',
            'tax' => 'sometimes|numeric|min:0',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|integer',
            'items.*.product_id' => 'sometimes|nullable|exists:products,id',
            'items.*.unit' => 'sometimes|nullable|string|max:50',
            'items.*.partNumber' => 'sometimes|nullable|string|max:100',
            'items.*.part_number' => 'sometimes|nullable|string|max:100',
            'items.*.description' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unitPrice' => 'sometimes|numeric|min:0',
            'items.*.unit_price' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $client = Client::findOrFail($data['client_id']);
        
        // Obtener el porcentaje de impuesto enviado (por defecto 16%)
        $taxPercentage = isset($data['tax_percentage']) ? floatval($data['tax_percentage']) : 16;
        
        // Guardar items antes de sobrescribir
        $itemsData = $data['items'] ?? [];
        unset($data['items']);
        
        $data['client_name'] = $client->name;
        $data['items_count'] = 0;
        $data['subtotal'] = 0;
        $data['tax_percentage'] = $taxPercentage;
        $data['tax'] = 0;
        $data['total'] = 0;
        $data['status'] = $data['status'] ?? 'draft';
        $data['created_by'] = $request->user()->name ?? 'Sistema';

        $quote = null;
        
        DB::transaction(function () use ($data, $itemsData, &$quote, $taxPercentage) {
            $quote = Quote::create($data);

            foreach ($itemsData as $itemData) {
                $unitPrice = $itemData['unitPrice'] ?? $itemData['unit_price'] ?? 0;
                $quantity = $itemData['quantity'] ?? 0;
                $description = $itemData['description'] ?? '';
                $unit = $itemData['unit'] ?? 'PZA';
                $partNumber = $itemData['partNumber'] ?? $itemData['part_number'] ?? 'PRD-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
                
                // Si no tiene product_id pero tiene description, crear el producto automáticamente
                $productId = $itemData['product_id'] ?? null;
                if (!$productId && $description) {
                    $product = Product::create([
                        'code' => $partNumber,
                        'name' => 'temp-name-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                        'unit' => $unit,
                        'price' => $unitPrice,
                        'stock' => 0,
                        'min_stock' => 0,
                        'status' => 'active',
                    ]);
                    $productId = $product->id;
                }
                
                $quote->items()->create([
                    'product_id' => $productId,
                    'unit' => $unit,
                    'part_number' => $partNumber,
                    'description' => $description,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $quantity * $unitPrice,
                ]);
            }

            $this->recalculateTotals($quote, $taxPercentage);
        });

        return response()->json($quote->fresh(['client', 'items']), 201);
    }

    public function show(Quote $quote)
    {
        return response()->json($quote->load(['client', 'items']));
    }

    public function update(Request $request, Quote $quote)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|in:draft,sent,approved,rejected,expired',
            'valid_until' => 'sometimes|date_format:Y-m-d',
            'created_by' => 'sometimes|required|string|max:255',
            'tax_percentage' => 'sometimes|numeric|min:0|max:100',
            'tax' => 'sometimes|numeric|min:0',
            'items' => 'sometimes|array',
            'items.*.id' => 'sometimes|integer',
            'items.*.product_id' => 'sometimes|nullable|exists:products,id',
            'items.*.unit' => 'sometimes|nullable|string|max:50',
            'items.*.partNumber' => 'sometimes|nullable|string|max:100',
            'items.*.part_number' => 'sometimes|nullable|string|max:100',
            'items.*.description' => 'required_with:items|string',
            'items.*.quantity' => 'required_with:items|numeric|min:0.01',
            'items.*.unitPrice' => 'sometimes|numeric|min:0',
            'items.*.unit_price' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $itemsData = $data['items'] ?? null;
        unset($data['items']);
        
        // Obtener el porcentaje de impuesto enviado (por defecto 16%)
        $taxPercentage = isset($data['tax_percentage']) ? floatval($data['tax_percentage']) : null;
        // unset($data['tax_percentage']);

        // Guardar el status anterior para comparar
        $previousStatus = $quote->status;
        $newStatus = $data['status'] ?? $previousStatus;

        DB::transaction(function () use ($quote, $data, $itemsData, $previousStatus, $newStatus, $taxPercentage) {
            $quote->update($data);

            if ($itemsData !== null) {
                // Obtener IDs de items existentes
                $existingIds = collect($itemsData)
                    ->filter(fn($item) => isset($item['id']) && $item['id'])
                    ->pluck('id')
                    ->toArray();

                // Eliminar items que ya no están en la lista
                $quote->items()->whereNotIn('id', $existingIds)->delete();

                // Crear o actualizar items
                foreach ($itemsData as $itemData) {
                    $unitPrice = $itemData['unitPrice'] ?? $itemData['unit_price'] ?? 0;
                    $quantity = $itemData['quantity'] ?? 0;
                    $description = $itemData['description'] ?? '';
                    $unit = $itemData['unit'] ?? 'PZA';
                    $partNumber = $itemData['partNumber'] ?? $itemData['part_number'] ?? null;
                    
                    // Si no tiene product_id pero tiene description, crear el producto automáticamente
                    $productId = $itemData['product_id'] ?? null;
                    if (!$productId && $description) {
                        // Verificar si el producto ya existe por su código (partNumber)
                        if ($partNumber) {
                            $existingProduct = Product::where('code', $partNumber)->first();
                            if ($existingProduct) {
                                $productId = $existingProduct->id;
                            } else {
                                $product = Product::create([
                                    'code' => $partNumber,
                                    'name' => 'temp-name-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                                    'description' => $description,
                                    'unit' => $unit,
                                    'price' => $unitPrice,
                                    'stock' => 0,
                                    'min_stock' => 0,
                                    'status' => 'active',
                                ]);
                                $productId = $product->id;
                            }
                        } else {
                            // Generar código único si no hay partNumber
                            $product = Product::create([
                                'code' => 'P-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                                'name' => 'temp-name-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                                'description' => $description,
                                'unit' => $unit,
                                'price' => $unitPrice,
                                'stock' => 0,
                                'min_stock' => 0,
                                'status' => 'active',
                            ]);
                            $productId = $product->id;
                        }
                    }
                    
                    $itemFields = [
                        'product_id' => $productId,
                        'unit' => $unit,
                        'part_number' => $partNumber,
                        'description' => $description,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'total' => $quantity * $unitPrice,
                    ];

                    if (isset($itemData['id']) && $itemData['id']) {
                        $quote->items()->where('id', $itemData['id'])->update($itemFields);
                    } else {
                        $quote->items()->create($itemFields);
                    }
                }

                $this->recalculateTotals($quote, $taxPercentage);
            }

            // Crear venta automáticamente cuando la cotización se aprueba
            if ($previousStatus !== 'approved' && $newStatus === 'approved') {
                // $this->createSaleFromQuote($quote);
            }
        });

        return response()->json($quote->fresh(['client', 'items']));
    }

    /**
     * Create a sale from an approved quote.
     */
    protected function createSaleFromQuote(Quote $quote): Sale
    {
        // Verificar si ya existe una venta para esta cotización (por quote_id o quote_ref)
        $existingSale = Sale::where('quote_id', $quote->id)
            ->orWhere('quote_ref', $quote->code)
            ->first();
        if ($existingSale) {
            return $existingSale;
        }

        // Generar número de código único
        $code = 'V-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);

        // Calcular fecha de vencimiento (por defecto 7 días)
        $dueDate = now()->addDays(7);

        $sale = Sale::create([
            'code' => $code,
            'client_id' => $quote->client_id,
            'client_name' => $quote->client_name,
            'quote_id' => $quote->id,
            'quote_ref' => $quote->code,
            'items' => $quote->items_count,
            'subtotal' => $quote->subtotal,
            'tax' => $quote->tax,
            'total' => $quote->total,
            'status' => 'pending',
            'payment_type' => 'credit', // Por defecto crédito para generar cuenta por cobrar
            'credit_days' => 30, // 30 días por defecto
            'due_date' => $dueDate,
        ]);

        // Copiar los items de la cotización a la venta
        $quote->load('items');
        foreach ($quote->items as $quoteItem) {
            \App\Models\SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $quoteItem->product_id,
                'unit' => $quoteItem->unit,
                'part_number' => $quoteItem->part_number,
                'description' => $quoteItem->description,
                'quantity' => $quoteItem->quantity,
                'unit_price' => $quoteItem->unit_price,
                'discount_percentage' => $quoteItem->discount_percentage || 0,
                'discount_amount' => $quoteItem->discount_amount,
                'subtotal' => $quoteItem->subtotal,
            ]);
        }

        // Crear AccountStatement automáticamente (cuenta por cobrar)
        AccountStatement::create([
            'invoice_number' => $sale->code,
            'client_id' => $sale->client_id,
            'client_name' => $sale->client_name,
            'date' => now()->toDateString(),
            'due_date' => $sale->due_date,
            'amount' => $sale->total,
            'paid' => 0, // No se ha pagado aún
            'balance' => $sale->total, // Saldo pendiente
            'status' => 'pending',
            'concept' => 'Venta #' . $sale->code . ' (desde Cotización ' . $quote->code . ')',
        ]);

        return $sale;
    }

    public function destroy(Quote $quote)
    {
        $quote->items()->delete();
        $quote->delete();
        return response()->json(null, 204);
    }

    /**
     * Recalculate quote totals based on items.
     */
    protected function recalculateTotals(Quote $quote, ?float $customTax = null): void
    {
        $quote->refresh();
        
        $items = $quote->items()->get();
        
        $subtotal = $items->sum('total');
        
        // Si se proporciona un tax personalizado (porcentaje), usarlo; si no, calcular con 16%
        if ($customTax !== null && $customTax >= 0) {
            $tax = $subtotal * ($customTax / 100);
        } elseif ($quote->tax > 0 && $quote->tax < $subtotal) {
            // Si ya tiene un tax configurado, usarlo
            $tax = $quote->tax;
        } else {
            // Por defecto 16%
            $tax = $subtotal * 0.16;
        }
        
        $total = $subtotal + $tax;
        $totalQuantity = $items->sum('quantity');
        
        $quote->update([
            'items_count' => $totalQuantity,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
        ]);
    }

    /**
     * Get quote statistics.
     */
    public function stats()
    {
        $quotes = Quote::all();

        return response()->json([
            'total' => $quotes->count(),
            'draft' => $quotes->where('status', 'draft')->count(),
            'sent' => $quotes->where('status', 'sent')->count(),
            'approved' => $quotes->where('status', 'approved')->count(),
            'rejected' => $quotes->where('status', 'rejected')->count(),
            'expired' => $quotes->where('status', 'expired')->count(),
            'totalValue' => $quotes->sum('total'),
        ]);
    }

    /**
     * Export quote to PDF.
     */
    public function exportPdf(Quote $quote)
    {
        $quote->load(['client', 'items']);
        
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
        
        $pdf = Pdf::loadView('pdf.quote', compact('quote', 'company', 'logoData'));
        
        // Configurar PDF horizontal (landscape) con márgenes adecuados
        $pdf->setPaper('a4', 'landscape')->setOption('margin-top', 15)->setOption('margin-bottom', 15)->setOption('margin-left', 15)->setOption('margin-right', 15);
        
        return $pdf->download('cotizacion-' . $quote->code . '.pdf');
    }

    /**
     * Send quote by email to client.
     */
    public function sendEmail(Request $request, Quote $quote)
    {
        // Cargar relaciones necesarias
        $quote->load(['client', 'items']);

        // Verificar que el cliente tenga email
        if (!$quote->client || !$quote->client->email) {
            return response()->json([
                'message' => 'El cliente no tiene un correo electrónico registrado'
            ], 422);
        }

        // Validar que el estado actual permita enviar
        if (in_array($quote->status, ['approved', 'rejected'])) {
            return response()->json([
                'message' => 'No se puede enviar una cotización que ya ha sido aprobada o rechazada'
            ], 422);
        }

        try {
            // Enviar el correo con el PDF adjunto
            Mail::to($quote->client->email)->send(new QuoteMail($quote));

            // Actualizar el estado a 'sent' si estaba en 'draft'
            $previousStatus = $quote->status;
            if ($previousStatus === 'draft') {
                $quote->update(['status' => 'sent']);
            }

            return response()->json([
                'message' => 'Cotización enviada correctamente',
                'quote' => $quote->fresh(['client', 'items']),
                'previous_status' => $previousStatus,
                'new_status' => $quote->status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al enviar la cotización por correo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

