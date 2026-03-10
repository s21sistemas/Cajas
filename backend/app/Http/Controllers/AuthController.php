<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Operator;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login de operador usando employee_code
     */
    public function operatorLogin(Request $request)
    {
        $data = $request->validate([
            'employee_code' => 'required|string',
        ]);

        $operator = Operator::where('employee_code', $data['employee_code'])->first();

        if (!$operator) {
            return response()->json(['error' => 'Código de empleado inválido'], 401);
        }

        if (!$operator->active) {
            return response()->json(['error' => 'El operador está inactivo'], 401);
        }

         // Asignar rol de productions.edit si no lo tiene
        if (!$operator->hasPermissionTo('productions.edit')) {
            $operator->givePermissionTo('productions.edit');
        }

        // Crear token para el operador
        $token = $operator->createToken('operator-api')->plainTextToken;

        return response()->json([
            'operator' => [
                'id' => $operator->id,
                'employee_code' => $operator->employee_code,
                'name' => $operator->name,
                'shift' => $operator->shift,
                'specialty' => $operator->specialty,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Cerrar sesión de operador
     */
    public function operatorLogout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Sesión de operador cerrada']);
    }

    /**
     * Obtener datos del operador actual
     */
    public function getOperatorUser(Request $request)
    {
        $operator = $request->user();
        
        return response()->json([
            'id' => $operator->id,
            'employee_code' => $operator->employee_code,
            'name' => $operator->name,
            'shift' => $operator->shift,
            'specialty' => $operator->specialty,
        ]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        if (!$user->hasRole('Empleado')) {

            $role = Role::firstOrCreate(
                ['name' => 'Empleado', 'guard_name' => 'web']
            );

            $permissions = Permission::pluck('id')->all();

            $role->syncPermissions($permissions);

            $user->assignRole($role);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ],
            'token' => $user->createToken('api')->plainTextToken,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames()->toArray(),
                'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
            ],
            'token' => $user->createToken('api')->plainTextToken,
        ]);
    }

    public function get_user(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'roles' => $user->getRoleNames()->toArray(),
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Sesión cerrada']);
    }
}
