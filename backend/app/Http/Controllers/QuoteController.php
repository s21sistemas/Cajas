<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Sale;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
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
                only: ['index', 'show', 'exportPdf', 'stats']
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
        unset($data['tax_percentage']);
        
        $data['client_name'] = $client->name;
        $data['items_count'] = 0;
        $data['subtotal'] = 0;
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
                
                $quote->items()->create([
                    'product_id' => $itemData['product_id'] ?? null,
                    'unit' => $itemData['unit'] ?? null,
                    'part_number' => $itemData['partNumber'] ?? $itemData['part_number'] ?? null,
                    'description' => $itemData['description'],
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
        unset($data['tax_percentage']);

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
                    
                    $itemFields = [
                        'product_id' => $itemData['product_id'] ?? null,
                        'unit' => $itemData['unit'] ?? null,
                        'part_number' => $itemData['partNumber'] ?? $itemData['part_number'] ?? null,
                        'description' => $itemData['description'],
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
                $this->createSaleFromQuote($quote);
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

        // Generar número de invoice único
        $invoice = 'V-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);

        // Calcular fecha de vencimiento (30 días por defecto)
        $dueDate = now()->addDays(30);

        $sale = Sale::create([
            'invoice' => $invoice,
            'client_id' => $quote->client_id,
            'client_name' => $quote->client_name,
            'quote_id' => $quote->id,
            'quote_ref' => $quote->code,
            'items' => $quote->items_count,
            'subtotal' => $quote->subtotal,
            'tax' => $quote->tax,
            'total' => $quote->total,
            'paid' => 0,
            'status' => 'pending',
            'payment_method' => 'pendiente',
            'due_date' => $dueDate,
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
        
        $pdf = Pdf::loadView('pdf.quote', compact('quote'));
        
        return $pdf->download('cotizacion-' . $quote->code . '.pdf');
    }
}
