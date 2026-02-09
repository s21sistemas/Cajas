<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear el usuario super admin si no existe
        $superAdmin = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('123456'), // Cambia la contraseña después de la primera vez
            ]
        );

        // Asignar el rol de super-admin al usuario
        if (! $superAdmin->hasRole('Super Admin')) {
            $role = Role::firstOrCreate(
                ['name' => 'Super Admin', 'guard_name' => 'web']
            );

            $permissions = Permission::pluck('id')->all();

            $role->syncPermissions($permissions);

            $superAdmin->assignRole($role);
        }
    }
}
