<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Models\Role;

class RoleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('roles.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('roles.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('roles.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('roles.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(
            Role::with('permissions:id,name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => 'web', // importante
            ]);

            $role->syncPermissions($data['permissions']);
        });

        return response()->json(['message' => 'Rol creado'], 201);
    }

    public function show($id)
    {
        $role = Role::with('permissions:id,name')->find($id);

        if (!$role) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:100|unique:roles,name,' . $id,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        DB::transaction(function () use ($role, $data) {
            if (isset($data['name'])) {
                $role->update(['name' => $data['name']]);
            }

            if (isset($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }
        });

        return response()->json(['message' => 'Rol actualizado']);
    }

    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json(['error' => 'Rol no encontrado'], 404);
        }

        $role->syncPermissions([]);
        $role->delete();

        return response()->json(['message' => 'Rol eliminado']);
    }
}
