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
            'color' => 'required|string|max:15',
            'license_plate' => 'required|string|max:20|unique:vehicles,license_plate',
            'status' => 'nullable|in:Available,Assigned,Under repair,Out of service,Accident,Stolen,Sold',
            'vehicle_photos' => 'nullable|string',
            'labeled' => 'required|in:YES,NO',
            'gps' => 'required|in:YES,NO',
            'taxes_paid' => 'required|in:YES,NO',
            'insurance_company' => 'required|string|max:50',
            'insurance_company_phone' => 'required|string|max:15',
            'insurance_file' => 'nullable|string',
            'policy_number' => 'required|string',
            'expiration_date' => 'required|date',
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
            'insurance_company' => 'sometimes|required|string|max:50',
            'insurance_company_phone' => 'sometimes|required|string|max:15',
            'insurance_file' => 'sometimes|nullable|string',
            'policy_number' => 'sometimes|required|string',
            'expiration_date' => 'sometimes|required|date',
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
