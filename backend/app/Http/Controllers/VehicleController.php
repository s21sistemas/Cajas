<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;

class VehicleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('vehicles.view'),
                only: ['index', 'show']
            ),
            new Middleware(
                PermissionMiddleware::using('vehicles.create'),
                only: ['store']
            ),
            new Middleware(
                PermissionMiddleware::using('vehicles.edit'),
                only: ['update']
            ),
            new Middleware(
                PermissionMiddleware::using('vehicles.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return Vehicle::orderByDesc('created_at')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_vehicle' => 'required|in:car,motorcycle',
            'brand' => 'required|string|max:50',
            'model' => 'required|string|max:15',
            'color' => 'nullable|string|max:15',
            'license_plate' => 'required|string|max:20|unique:vehicles,license_plate',
            'status' => 'nullable|in:Available,Assigned,Under repair,Out of service,Accident,Stolen,Sold',
            'vehicle_photos' => 'nullable|string',
            'labeled' => 'nullable|in:YES,NO',
            'gps' => 'nullable|in:YES,NO',
            'taxes_paid' => 'nullable|in:YES,NO',
            'insurance_company' => 'nullable|string|max:50',
            'insurance_company_phone' => 'nullable|string|max:15',
            'insurance_file' => 'nullable|string',
            'policy_number' => 'nullable|string',
            'expiration_date' => 'nullable|date',
        ]);

        if (! isset($validated['status'])) {
            $validated['status'] = 'Available';
        }

        $vehicle = Vehicle::create($validated);

        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle)
    {
        return response()->json($vehicle);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'type_vehicle' => 'sometimes|required|in:car,motorcycle',
            'brand' => 'sometimes|required|string|max:50',
            'model' => 'sometimes|required|string|max:15',
            'color' => 'sometimes|required|string|max:15',
            'license_plate' => 'sometimes|required|string|max:20|unique:vehicles,license_plate,' . $vehicle->id,
            'status' => 'sometimes|in:Available,Assigned,Under repair,Out of service,Accident,Stolen,Sold',
            'vehicle_photos' => 'sometimes|nullable|string',
            'labeled' => 'sometimes|required|in:YES,NO',
            'gps' => 'sometimes|required|in:YES,NO',
            'taxes_paid' => 'sometimes|required|in:YES,NO',
            'insurance_company' => 'sometimes|nullable|string|max:50',
            'insurance_company_phone' => 'sometimes|nullable|string|max:15',
            'insurance_file' => 'sometimes|nullable|string',
            'policy_number' => 'sometimes|nullable|string',
            'expiration_date' => 'sometimes|nullable|date',
        ]);

        $vehicle->update($validated);

        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();

        return response()->json(null, 204);
    }
}
