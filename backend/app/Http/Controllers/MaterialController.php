<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MaterialController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('materials.view'),
                only: ['index', 'show', 'stats']
            ),

            new Middleware(
                PermissionMiddleware::using('materials.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('materials.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('materials.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = Material::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        return response()->json($query->orderBy('code')->paginate($perPage));
    }

    public function selectListMaterials(){
        return response()->json(Material::select('id', 'name', 'code', 'category', 'cost', 'unit', 'stock', 'min_stock')->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:255|unique:materials,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
        ]);

        // Valores por defecto
        $data['stock'] = $data['stock'] ?? 0;
        $data['min_stock'] = $data['min_stock'] ?? 0;

        $material = Material::create($data);

        return response()->json($material, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Material $material)
    {
        return response()->json($material);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Material $material)
    {
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:materials,code,' . $material->id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'min_stock' => 'nullable|integer|min:0',
        ]);

        $material->update($data);

        return response()->json($material);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        $material->delete();

        return response()->json(null, 204);
    }

    /**
     * Get material statistics.
     */
    public function stats()
    {
        $materials = Material::all();

        $byCategory = $materials->groupBy('category')->map->count();
        $lowStock = $materials->filter(function ($material) {
            return $material->stock <= $material->min_stock;
        })->count();

        return response()->json([
            'total' => $materials->count(),
            'byCategory' => $byCategory,
            'lowStock' => $lowStock,
        ]);
    }
}
