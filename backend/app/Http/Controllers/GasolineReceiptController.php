<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GasolineReceipt;

class GasolineReceiptController extends Controller
{
    public function index()
    {
        return GasolineReceipt::with('vehicle')
            ->orderByDesc('created_at')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'mileage' => 'required|numeric|min:0',
            'liters' => 'required|numeric|min:0',
            'cost_per_liter' => 'required|numeric|min:0',
            'total_cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $receipt = GasolineReceipt::create($validated);

        return response()->json($receipt->load('vehicle'), 201);
    }

    public function show(GasolineReceipt $gasolineReceipt)
    {
        return response()->json($gasolineReceipt->load('vehicle'));
    }

    public function update(Request $request, GasolineReceipt $gasolineReceipt)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'mileage' => 'required|numeric|min:0',
            'liters' => 'required|numeric|min:0',
            'cost_per_liter' => 'required|numeric|min:0',
            'total_cost' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $gasolineReceipt->update($validated);

        return response()->json($gasolineReceipt->load('vehicle'));
    }

    public function destroy(GasolineReceipt $gasolineReceipt)
    {
        $gasolineReceipt->delete();

        return response()->json(null, 204);
    }
}
