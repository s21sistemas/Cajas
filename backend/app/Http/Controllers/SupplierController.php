<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SupplierController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('suppliers.view'),
                only: ['index', 'show', 'stats']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('suppliers.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $query = Supplier::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%")
                  ->orWhere('rfc', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->integer('per_page', 15);
        $suppliers = $query->latest()->paginate($perPage);

        return $this->paginated($suppliers, 'Proveedores listados correctamente');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'rfc' => 'required|string|max:13|unique:suppliers,rfc',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'lead_time' => 'nullable|integer|min:0',
            'rating' => 'nullable|integer|min:0|max:5',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $validator->validated();
        $data['balance'] = $data['balance'] ?? 0;
        $data['status'] = $data['status'] ?? 'pending';

        $supplier = Supplier::create($data);
        return $this->created($supplier, 'Proveedor creado correctamente');
    }

    public function show(Supplier $supplier)
    {
        return $this->success($supplier, 'Proveedor obtenido correctamente');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:255|unique:suppliers,code,' . $supplier->id,
            'name' => 'sometimes|required|string|max:255',
            'rfc' => 'sometimes|required|string|max:13|unique:suppliers,rfc,' . $supplier->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'contact' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'lead_time' => 'nullable|integer|min:0',
            'rating' => 'nullable|integer|min:0|max:5',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $supplier->update($validator->validated());
        return $this->success($supplier, 'Proveedor actualizado correctamente');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return $this->deleted('Proveedor eliminado correctamente');
    }

    public function stats()
    {
        $suppliers = Supplier::all();
        $active = $suppliers->where('status', 'active')->count();
        $inactive = $suppliers->where('status', 'inactive')->count();
        $pending = $suppliers->where('status', 'pending')->count();
        $totalBalance = $suppliers->sum('balance');
        $avgLeadTime = $suppliers->count() > 0 
            ? round($suppliers->avg('lead_time')) 
            : 0;

        $data = [
            'total' => $suppliers->count(),
            'active' => $active,
            'inactive' => $inactive,
            'pending' => $pending,
            'totalBalance' => $totalBalance,
            'avgLeadTime' => $avgLeadTime,
        ];

        return $this->success($data, 'Estadísticas de proveedores obtenidas correctamente');
    }
}
