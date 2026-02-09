<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Spatie\Permission\Models\Role;

class UserController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('users.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('users.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('users.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('users.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $users = User::query()
            ->with(['roles', 'permissions'])
            ->paginate($perPage)
            ->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,

                // roles asignados
                'roles' => $user->roles->pluck('name')->values(),

                // permisos directos (sin rol)
                'direct_permissions' => $user->permissions->pluck('name')->values(),

                // permisos finales (roles + directos)
                'all_permissions' => $user->getAllPermissions()
                    ->pluck('name')
                    ->values(),
            ]);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role_id' => 'required|exists:roles,id',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('photo')) {
            $data['photo'] = $this->photoUp($request->file('photo'));
        }

        // 1Crear usuario (SIN role_id)
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        // Buscar rol correctamente
        $role = Role::findById($data['role_id'], 'web');

        // Asignar rol con Spatie
        $user->syncRoles([$role]);

        // Retornar usuario con roles cargados
        return $user->load('roles');

    }

    public function show(User $user)
    {
        return $user;
    }

    public function update(Request $request, User $user)
    {
        if (!$user) {
            return response()->json(['error' => 'Registro no encontrado'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'role_id' => 'required|exists:roles,id',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($request->hasFile('photo')) {
            if ($usuario->photo) {
                $this->photoDelete($usuario->photo);
            }
            $data['photo'] = $this->photoUp($request->file('photo'));
        }

        $user->update($data);

        $role = Role::findById($data['role_id'], 'web');

        $user->syncRoles([$role]);

        return $user->load('roles');
    }

    public function destroy(User $user)
    {
        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $carpeta = 'public/fotos_usuarios/';
        if ($usuario->photo) {
            Storage::delete("{$carpeta}/{$usuario->photo}");
        }

        $user->delete();

        // Si la carpeta está vacía, la eliminamos para evitar directorios innecesarios
        if (empty(Storage::files($carpeta))) {
            Storage::deleteDirectory($carpeta);
        }        

        return response()->noContent();
    }

    // * Función para subir una foto
    private function photoUp($archivo)
    {
        $nombre = time() . '_' . uniqid() . '.' . $archivo->extension();
        $archivo->storeAs("public/fotos_usuarios", $nombre);

        return $nombre;
    }

    // * Función para eliminar una foto
    private function photoDelete($nombreArchivo)
    {
        if($nombreArchivo !== 'default.png'){
            $ruta = storage_path("app/public/fotos_usuarios/{$nombreArchivo}");

            if (file_exists($ruta)) {
                unlink($ruta);
            }
        }
    }
}
