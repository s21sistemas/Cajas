<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Delivery;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;

class DeliveryController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('deliveries.view'),
                only: ['index', 'show']
            ),
            new Middleware(
                PermissionMiddleware::using('deliveries.create'),
                only: ['store']
            ),
            new Middleware(
                PermissionMiddleware::using('deliveries.edit'),
                only: ['update']
            ),
            new Middleware(
                PermissionMiddleware::using('deliveries.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        $query = Delivery::with('vehicle');

        if (request()->filled('vehicle_id')) {
            $query->where('vehicle_id', request()->integer('vehicle_id'));
        }

        return $query->orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver' => 'required|string|max:255',
            'origin_address' => 'required|string|max:255',
            'status' => 'nullable|in:pending,assigned,in_transit,completed,cancelled',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        if (! isset($validated['status'])) {
            $validated['status'] = 'pending';
        }

        $delivery = Delivery::create($validated);

        return response()->json($delivery, 201);
    }

    public function show($id)
    {
        return Delivery::with('vehicle')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $delivery = Delivery::findOrFail($id);

        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver' => 'sometimes|required|string|max:255',
            'origin_address' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|in:pending,assigned,in_transit,completed,cancelled',
            'started_at' => 'nullable|date',
            'completed_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        $delivery->update($validated);

        return response()->json($delivery);
    }

    public function destroy($id)
    {
        Delivery::findOrFail($id)->delete();
        return response()->json(['message' => 'Entrega eliminada']);
    }
}
