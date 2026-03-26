<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Material;
use App\Models\Process;
use App\Models\ProductProcess;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Crear producto desde cotización.
     * Solo guarda: nombre, código, unidad, precio
     * NO tiene lista de materiales ni stock
     */
    public function createFromQuote(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255|unique:products,code',
            'unit' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
        ]);

        // Generar código si no se proporciona
        if (empty($data['code'])) {
            $data['code'] = 'P-' . date('Ymd') . '-' . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        }

        // Valores por defecto para productos creados desde cotización
        $data['stock'] = 0;
        $data['min_stock'] = 0;
        $data['status'] = 'active';

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::query();

        // Filtro por búsqueda
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtro por categoría
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filtro por estado
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filtro por stock mínimo
        if ($request->has('minStock')) {
            $query->where('stock', '<=', $request->minStock);
        }

        // Filtro por stock máximo
        if ($request->has('maxStock')) {
            $query->where('stock', '>=', $request->maxStock);
        }

        $perPage = $request->integer('per_page', 15);

        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    public function selectListProducts(){
        return response()->json(Product::select('id', 'code', 'name', 'description', 'category', 'price', 'cost', 'unit', 'stock', 'min_stock', 'status', 'created_at', 'updated_at')->where('status', 'active')->orderBy('name')->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:255|unique:products,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'cost' => 'nullable|numeric',
            'unit' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'minStock' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:diseño,en_producción,completado,active,inactive,discontinued',
        ]);

        // Valor por defecto para campos opcionales según migración
        $data['stock'] = $data['stock'] ?? 0;
        $data['min_stock'] = $data['minStock'] ?? 0;
        $data['status'] = $data['status'] ?? 'diseño';

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Cargar relaciones para mostrar en detalles
        $product->load(['materials.material', 'processes']);
        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'code' => 'sometimes|required|string|max:255|unique:products,code,' . $product->id,
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255',
            'price' => 'nullable|numeric',
            'cost' => 'nullable|numeric',
            'unit' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'minStock' => 'nullable|integer|min:0',
            'status' => 'sometimes|in:diseño,en_producción,completado,active,inactive,discontinued',
        ]);

        // Mapear minStock a min_stock
        if (isset($data['minStock'])) {
            $data['min_stock'] = $data['minStock'];
            unset($data['minStock']);
        }

        $product->update($data);

        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Producto eliminado correctamente']);
    }

    /**
     * Get low stock products.
     */
    public function lowStock(Request $request)
    {
        $query = Product::whereRaw('stock <= min_stock');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->integer('per_page', 15);

        $products = $query->latest()->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Get product statistics.
     */
    public function stats()
    {
        $total = Product::count();
        $active = Product::where('status', '!=', 'descontinuado')->count();
        $inactive = Product::where('status', 'descontinuado')->count();
        $lowStock = Product::whereRaw('stock <= min_stock')->count();

        $data = [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
            'lowStock' => $lowStock,
        ];

        return response()->json($data);
    }

    /**
     * Get product with parts and processes.
     */
    public function showWithDetails(Product $product)
    {
        $product->load(['materials', 'processes.machine']);
        return response()->json($product);
    }

    /**
     * Add material (part) to product (BOM).
     */
    public function addPart(Request $request, Product $product)
    {
        $data = $request->validate([
            'material_id' => 'required|exists:materials,id',
            'quantity' => 'required|numeric|min:0.001',
        ]);

        // Verificar si ya existe
        $exists = $product->materials()->where('material_id', $data['material_id'])->exists();
        if ($exists) {
            return response()->json(['message' => 'El material ya está asociado al producto'], 422);
        }

        $product->materials()->attach($data['material_id'], ['quantity' => $data['quantity']]);

        return response()->json($product->fresh()->load('materials'));
    }

    /**
     * Update material quantity in product.
     */
    public function updatePart(Request $request, Product $product, int $partId)
    {
        $data = $request->validate([
            'quantity' => 'required|numeric|min:0.001',
        ]);

        $attached = $product->materials()->where('material_id', $partId)->exists();
        if (!$attached) {
            return response()->json(['message' => 'El material no está asociado al producto'], 422);
        }

        $product->materials()->updateExistingPivot($partId, ['quantity' => $data['quantity']]);

        return response()->json($product->fresh()->load('materials'));
    }

    /**
     * Remove material (part) from product.
     */
    public function removePart(Product $product, int $partId)
    {
        $attached = $product->materials()->where('material_id', $partId)->exists();
        if (!$attached) {
            return response()->json(['message' => 'El material no está asociado al producto'], 422);
        }

        $product->materials()->detach($partId);

        return response()->json(['message' => 'Material eliminado correctamente']);
    }

    /**
     * Get materials (parts) of a product.
     */
    public function getParts(Product $product)
    {
        $parts = $product->materials()->withPivot('quantity', 'id')->get();
        // Transform to match frontend expectations
        $transformed = $parts->map(function ($material) {
            return [
                'id' => $material->pivot->id,
                'partId' => $material->id,
                'quantity' => $material->pivot->quantity,
                'part' => [
                    'id' => $material->id,
                    'code' => $material->code,
                    'name' => $material->name,
                    'description' => $material->description,
                ]
            ];
        });
        return response()->json($transformed);
    }

    /**
     * Add process to product.
     */
    public function addProcess(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'process_id' => 'required|exists:processes,id',
            'sequence' => 'required|integer|min:1',
        ]);

        $process = Process::find($data['process_id']);
        if (!$process) {
            return response()->json(['message' => 'El proceso no existe'], 422);
        }

        // Create in product_processes table
        $productProcess = ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process->id,
            'name' =>   $process->name,
            'process_type_id' => $process->process_type_id,
            'sequence' => $data['sequence'],
            'estimated_minutes' => $process->estimated_time_min ?? null,
        ]);

        return response()->json($productProcess->load('process'));
    }

    /**
     * Remove process from product.
     */
    public function removeProcess(Product $product, ProductProcess $productProcess)
    {
        if ($productProcess->product_id != $product->id) {
            return response()->json(['message' => 'El proceso no pertenece a este producto'], 422);
        }

        $productProcess->delete();

        return response()->json(['message' => 'Proceso eliminado correctamente']);
    }

    /**
     * Get processes of a product.
     */
    public function getProcesses(Product $product)
    {
        $processes = $product->productProcesses()->with('process')->orderBy('sequence')->get();
        // Transform to match frontend expectations
        $transformed = $processes->map(function ($proc) {
            return [
                'id' => $proc->id,
                'name' => $proc->name,
                'processType' => $proc->process && $proc->process->processType ? $proc->process->processType->name : null,
                'sequence' => $proc->sequence,
                'estimatedTimeMin' => $proc->estimated_minutes,
            ];
        });
        return response()->json($transformed);
    }
}
