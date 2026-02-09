<?php

namespace App\Http\Controllers;

use App\Models\Part;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PartController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('parts.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('parts.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('parts.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('parts.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Part::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:255|unique:parts,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material' => 'required|string|max:255',
            'drawing_url' => 'nullable|string|max:255',
            'status' => 'sometimes|in:design,ready_for_production,in_production,completed',
        ]);

        $part = Part::create($data);

        return response()->json($part, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        return response()->json($part);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Part $part)
    {
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:parts,code,' . $part->id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'material' => 'sometimes|required|string|max:255',
            'drawing_url' => 'nullable|string|max:255',
            'status' => 'sometimes|in:design,ready_for_production,in_production,completed',
        ]);

        $part->update($data);

        return response()->json($part);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        $part->delete();

        return response()->json(null, 204);
    }
}
