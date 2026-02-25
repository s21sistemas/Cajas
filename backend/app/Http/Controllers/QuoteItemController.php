<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Support\Facades\Validator;

class QuoteItemController extends Controller
{
    /**
     * Store a newly created quote item.
     */
    public function store(Request $request, Quote $quote)
    {
        $validator = Validator::make($request->all(), [
            'unit' => 'nullable|string|max:50',
            'part_number' => 'nullable|string|max:100',
            'description' => 'required|string',
            'quantity' => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Calcular total del item
        $data['quote_id'] = $quote->id;
        $data['total'] = $data['quantity'] * $data['unit_price'];

        $item = QuoteItem::create($data);

        // Recalcular totales de la cotización
        $this->recalculateQuoteTotals($quote);

        return response()->json($item, 201);
    }

    /**
     * Update the specified quote item.
     */
    public function update(Request $request, Quote $quote, QuoteItem $item)
    {
        // Verificar que el item pertenece a la cotización
        if ($item->quote_id !== $quote->id) {
            return response()->json(['error' => 'El item no pertenece a esta cotización'], 403);
        }

        $validator = Validator::make($request->all(), [
            'unit' => 'sometimes|nullable|string|max:50',
            'part_number' => 'sometimes|nullable|string|max:100',
            'description' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|numeric|min:0.01',
            'unit_price' => 'sometimes|required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Recalcular total del item si hay cambios en cantidad o precio
        if (isset($data['quantity']) || isset($data['unit_price'])) {
            $quantity = $data['quantity'] ?? $item->quantity;
            $unitPrice = $data['unit_price'] ?? $item->unit_price;
            $data['total'] = $quantity * $unitPrice;
        }

        $item->update($data);

        // Recalcular totales de la cotización
        $this->recalculateQuoteTotals($quote);

        return response()->json($item);
    }

    /**
     * Remove the specified quote item.
     */
    public function destroy(Quote $quote, QuoteItem $item)
    {
        // Verificar que el item pertenece a la cotización
        if ($item->quote_id !== $quote->id) {
            return response()->json(['error' => 'El item no pertenece a esta cotización'], 403);
        }

        $item->delete();

        // Recalcular totales de la cotización
        $this->recalculateQuoteTotals($quote);

        return response()->json(null, 204);
    }

    /**
     * Recalculate quote totals based on items.
     */
    protected function recalculateQuoteTotals(Quote $quote): void
    {
        $quote->refresh();
        
        $items = $quote->items;
        
        $subtotal = $items->sum('total');
        $tax = $subtotal * 0.16;
        $total = $subtotal + $tax;

        $quote->update([
            'items' => $items->count(),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
        ]);
    }
}
