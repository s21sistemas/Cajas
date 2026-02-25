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

        return $this->paginated($products, 'Productos listados correctamente');
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

        return $this->created($product, 'Producto creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return $this->success($product, 'Producto obtenido correctamente');
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

        return $this->success($product, 'Producto actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return $this->deleted('Producto eliminado correctamente');
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

        return $this->paginated($products, 'Productos con stock bajo');
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

        return $this->success($data, 'Estadísticas de productos obtenidas correctamente');
    }

    /**
     * Get product with parts and processes.
     */
    public function showWithDetails(Product $product)
    {
        $product->load(['materials', 'processes.machine']);
        return $this->success($product, 'Producto con detalles obtenido correctamente');
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
            return $this->error('El material ya está asociado al producto');
        }

        $product->materials()->attach($data['material_id'], ['quantity' => $data['quantity']]);

        return $this->success($product->fresh()->load('materials'), 'Material agregado correctamente');
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
            return $this->error('El material no está asociado al producto');
        }

        $product->materials()->updateExistingPivot($partId, ['quantity' => $data['quantity']]);

        return $this->success($product->fresh()->load('materials'), 'Cantidad de material actualizada correctamente');
    }

    /**
     * Remove material (part) from product.
     */
    public function removePart(Product $product, int $partId)
    {
        $attached = $product->materials()->where('material_id', $partId)->exists();
        if (!$attached) {
            return $this->error('El material no está asociado al producto');
        }

        $product->materials()->detach($partId);

        return $this->success($product->fresh()->load('materials'), 'Material eliminado correctamente');
    }

    /**
     * Get materials (parts) of a product.
     */
    public function getParts(Product $product)
    {
        $parts = $product->materials()->withPivot('quantity')->get();
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
                    'material' => $material->material,
                ]
            ];
        });
        return $this->success($transformed, 'Materiales del producto obtenidos correctamente');
    }

    /**
     * Add process to product.
     */
    public function addProcess(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'process_type' => 'required|string|max:255',
            'description' => 'nullable|string',
            'machine_id' => 'nullable|exists:machines,id',
            'sequence' => 'required|integer|min:1',
            'estimated_time_min' => 'nullable|numeric|min:0',
        ]);

        // Create in product_processes pivot table
        $productProcess = ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => null, // Not linked to master process
            'name' => $data['name'],
            'sequence' => $data['sequence'],
            'estimated_minutes' => $data['estimated_time_min'] ?? null,
        ]);

        // Load machine if provided
        if (!empty($data['machine_id'])) {
            $productProcess->machine_id = $data['machine_id'];
            $productProcess->save();
        }

        return $this->success($productProcess->fresh('machine'), 'Proceso agregado correctamente');
    }

    /**
     * Update process of product.
     */
    public function updateProcess(Request $request, Product $product, ProductProcess $productProcess)
    {
        if ($productProcess->product_id != $product->id) {
            return $this->error('El proceso no pertenece a este producto');
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'process_type' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'machine_id' => 'nullable|exists:machines,id',
            'sequence' => 'sometimes|required|integer|min:1',
            'estimated_time_min' => 'nullable|numeric|min:0',
        ]);

        if (isset($data['name'])) {
            $productProcess->name = $data['name'];
        }
        if (isset($data['process_type'])) {
            $productProcess->process_type = $data['process_type'];
        }
        if (isset($data['sequence'])) {
            $productProcess->sequence = $data['sequence'];
        }
        if (isset($data['estimated_time_min'])) {
            $productProcess->estimated_minutes = $data['estimated_time_min'];
        }
        if (array_key_exists('machine_id', $data)) {
            $productProcess->machine_id = $data['machine_id'];
        }

        $productProcess->save();

        return $this->success($productProcess->fresh('machine'), 'Proceso actualizado correctamente');
    }

    /**
     * Remove process from product.
     */
    public function removeProcess(Product $product, ProductProcess $productProcess)
    {
        if ($productProcess->product_id != $product->id) {
            return $this->error('El proceso no pertenece a este producto');
        }

        $productProcess->delete();

        return $this->success(null, 'Proceso eliminado correctamente');
    }

    /**
     * Get processes of a product.
     */
    public function getProcesses(Product $product)
    {
        $processes = $product->productProcesses()->with('machine')->get();
        // Transform to match frontend expectations
        $transformed = $processes->map(function ($proc) {
            return [
                'id' => $proc->id,
                'name' => $proc->name,
                'processType' => $proc->process_type,
                'sequence' => $proc->sequence,
                'estimatedTimeMin' => $proc->estimated_minutes,
                'machine' => $proc->machine ? [
                    'id' => $proc->machine->id,
                    'name' => $proc->machine->name,
                ] : null,
            ];
        });
        return $this->success($transformed, 'Procesos del producto obtenidos correctamente');
    }
}
