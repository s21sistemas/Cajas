<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WarehouseLocation;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class WarehouseLocationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('warehouselocations.view'),
                only: ['index', 'show', 'stats', 'occupancy', 'available']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouselocations.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouselocations.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('warehouselocations.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = WarehouseLocation::orderBy('name');

        if ($request->has('zone') && $request->zone) {
            $query->where('zone', $request->zone);
        }

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'zone' => 'nullable|string|max:255',
            'type' => 'required|string|max:255',
            'capacity' => 'sometimes|numeric|min:0',
            'occupancy' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['capacity'] = $data['capacity'] ?? 0;
        $data['occupancy'] = $data['occupancy'] ?? 0;

        $item = WarehouseLocation::create($data);
        return response()->json($item, 201);
    }

    public function show(WarehouseLocation $warehouseLocation)
    {
        return response()->json($warehouseLocation);
    }

    public function update(Request $request, WarehouseLocation $warehouseLocation)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'zone' => 'nullable|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'capacity' => 'sometimes|numeric|min:0',
            'occupancy' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $warehouseLocation->update($validator->validated());
        return response()->json($warehouseLocation);
    }

    public function destroy(WarehouseLocation $warehouseLocation)
    {
        $warehouseLocation->delete();
        return response()->json(null, 204);
    }

    /**
     * Get warehouse statistics.
     */
    public function stats()
    {
        $locations = WarehouseLocation::all();

        $byZone = $locations->groupBy('zone')->map(function ($items) {
            return [
                'capacity' => $items->sum('capacity'),
                'occupancy' => $items->sum('occupancy'),
            ];
        });

        return response()->json([
            'total' => $locations->count(),
            'totalCapacity' => $locations->sum('capacity'),
            'totalOccupancy' => $locations->sum('occupancy'),
            'averageOccupancy' => $locations->avg(fn($l) => $l->capacity > 0 ? ($l->occupancy / $l->capacity) * 100 : 0),
            'byZone' => $byZone,
        ]);
    }

    /**
     * Get occupancy details for a location.
     */
    public function occupancy(WarehouseLocation $warehouseLocation)
    {
        $occupancyPercent = $warehouseLocation->capacity > 0
            ? ($warehouseLocation->occupancy / $warehouseLocation->capacity) * 100
            : 0;

        return response()->json([
            'location' => $warehouseLocation,
            'occupancyPercent' => round($occupancyPercent, 2),
            'available' => max(0, $warehouseLocation->capacity - $warehouseLocation->occupancy),
        ]);
    }

    /**
     * Get available locations with capacity.
     */
    public function available()
    {
        $locations = WarehouseLocation::whereColumn('occupancy', '<', 'capacity')
            ->orderBy('name')
            ->get();

        return response()->json($locations);
    }
}
