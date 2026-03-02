<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Lista de usuarios con diferentes roles
        $users = [
            [
                'name' => 'Super Administrador',
                'email' => 'superadmin@s21.com',
                'password' => 'password123',
                'role' => 'Super Admin',
            ],
            [
                'name' => 'Administrador Sistema',
                'email' => 'admin@s21.com',
                'password' => 'password123',
                'role' => 'admin',
            ],
            [
                'name' => 'Gerente General',
                'email' => 'gerente@s21.com',
                'password' => 'password123',
                'role' => 'Gerente',
            ],
            [
                'name' => 'Jefe de Recursos Humanos',
                'email' => 'rrhh@s21.com',
                'password' => 'password123',
                'role' => 'Recursos Humanos',
            ],
            [
                'name' => 'Jefe de Producción',
                'email' => 'jefe-produccion@s21.com',
                'password' => 'password123',
                'role' => 'Jefe de Producción',
            ],
            [
                'name' => 'Operador de Producción',
                'email' => 'operador@s21.com',
                'password' => 'password123',
                'role' => 'Operador de Producción',
            ],
            [
                'name' => 'Jefe de Almacén',
                'email' => 'jefe-almacen@s21.com',
                'password' => 'password123',
                'role' => 'Jefe de Almacén',
            ],
            [
                'name' => 'Almacenista',
                'email' => 'almacenista@s21.com',
                'password' => 'password123',
                'role' => 'Almacenista',
            ],
            [
                'name' => 'Vendedor',
                'email' => 'ventas@s21.com',
                'password' => 'password123',
                'role' => 'Ventas',
            ],
            [
                'name' => 'Jefe de Ventas',
                'email' => 'jefe-ventas@s21.com',
                'password' => 'password123',
                'role' => 'Jefe de Ventas',
            ],
            [
                'name' => 'Encargado de Compras',
                'email' => 'compras@s21.com',
                'password' => 'password123',
                'role' => 'Compras',
            ],
            [
                'name' => 'Finanzas',
                'email' => 'finanzas@s21.com',
                'password' => 'password123',
                'role' => 'Finanzas',
            ],
            [
                'name' => 'Contador',
                'email' => 'contador@s21.com',
                'password' => 'password123',
                'role' => 'Contabilidad',
            ],
            [
                'name' => 'Técnico de Mantenimiento',
                'email' => 'mantenimiento@s21.com',
                'password' => 'password123',
                'role' => 'Mantenimiento',
            ],
            [
                'name' => 'Logística',
                'email' => 'logistica@s21.com',
                'password' => 'password123',
                'role' => 'Logística',
            ],
            [
                'name' => 'Usuario de Solo Lectura',
                'email' => 'viewer@s21.com',
                'password' => 'password123',
                'role' => 'viewer',
            ],
            [
                'name' => 'Operador Legacy',
                'email' => 'operator@s21.com',
                'password' => 'password123',
                'role' => 'operator',
            ],
        ];

        foreach ($users as $userData) {
            $roleName = $userData['role'];
            unset($userData['role']);

            // Crear o actualizar usuario
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password']),
                ]
            );

            // Buscar el rol
            $role = Role::where('name', $roleName)->first();

            if ($role) {
                // Asignar el rol al usuario
                $user->assignRole($role);
                
                $this->command->info("Usuario {$user->email} asignado al rol: {$roleName}");
            } else {
                $this->command->warn("Rol '{$roleName}' no encontrado para usuario {$user->email}");
            }
        }

        $this->command->info('Seeding de usuarios con roles completado!');
    }
}
