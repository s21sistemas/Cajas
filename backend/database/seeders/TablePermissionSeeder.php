<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TablePermissionSeeder extends Seeder
{
    /**
     * Lista canónica de permisos (derivada de los controladores).
     * Sin duplicados. Los que no estén aquí serán eliminados de la BD.
     */
    protected function permissions(): array
    {
        return [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete',
            'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
            'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
            'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.delete',
            'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
            'serviceorders.view', 'serviceorders.create', 'serviceorders.edit', 'serviceorders.delete',
            'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
            'purchaseorders.view', 'purchaseorders.create', 'purchaseorders.edit', 'purchaseorders.delete',
            'supplierstatements.view', 'supplierstatements.create', 'supplierstatements.edit', 'supplierstatements.delete',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'inventoryitems.view', 'inventoryitems.create', 'inventoryitems.edit', 'inventoryitems.delete',
            'warehouselocations.view', 'warehouselocations.create', 'warehouselocations.edit', 'warehouselocations.delete',
            'qritems.view', 'qritems.create', 'qritems.edit', 'qritems.delete',
            'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.delete',
            'machines.view', 'machines.create', 'machines.edit', 'machines.delete',
            'processes.view', 'processes.create', 'processes.edit', 'processes.delete',
            'productions.view', 'productions.create', 'productions.edit', 'productions.delete',
            'operators.view', 'operators.create', 'operators.edit', 'operators.delete',
            'warehouse.view', 'warehouse.create', 'warehouse.edit', 'warehouse.delete',
            'materials.view', 'materials.create', 'materials.edit', 'materials.delete',
            'bankaccounts.view', 'bankaccounts.create', 'bankaccounts.edit', 'bankaccounts.delete',
            'accountstatements.view', 'accountstatements.create', 'accountstatements.edit', 'accountstatements.delete',
            'banktransactions.view', 'banktransactions.create', 'banktransactions.edit', 'banktransactions.delete',
            'movements.view', 'movements.create', 'movements.edit', 'movements.delete',
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            'employeeaccounts.view', 'employeeaccounts.create', 'employeeaccounts.edit', 'employeeaccounts.delete',
            'loantypes.view', 'loantypes.create', 'loantypes.edit', 'loantypes.delete',
            'loans.view', 'loans.create', 'loans.edit', 'loans.delete',
            'loanpayments.view', 'loanpayments.create', 'loanpayments.edit', 'loanpayments.delete',
            'discounttypes.view', 'discounttypes.create', 'discounttypes.edit', 'discounttypes.delete',
            'vacationrequests.view', 'vacationrequests.create', 'vacationrequests.edit', 'vacationrequests.delete',
            'discounts.view', 'discounts.create', 'discounts.edit', 'discounts.delete',
            'disabilities.view', 'disabilities.create', 'disabilities.edit', 'disabilities.delete',
            'guardpayments.view', 'guardpayments.create', 'guardpayments.edit', 'guardpayments.delete',
            'overtimes.view', 'overtimes.create', 'overtimes.edit', 'overtimes.delete',
            'absences.view', 'absences.create', 'absences.edit', 'absences.delete',
            'maintenanceorders.view', 'maintenanceorders.create', 'maintenanceorders.edit', 'maintenanceorders.delete',
            'vehicles.view', 'vehicles.create', 'vehicles.edit', 'vehicles.delete',
            'deliveries.view', 'deliveries.create', 'deliveries.edit', 'deliveries.delete',
            'settings.view', 'settings.create', 'settings.edit', 'settings.delete',
            'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
        ];
    }

    /**
     * Roles y sus permisos. Solo se asignan permisos que existan en permissions().
     */
    protected function rolesWithPermissions(): array
    {
        $all = $this->permissions();
        $viewOnly = array_values(array_filter($all, fn ($p) => str_ends_with($p, '.view')));

        return [
            'Super Admin' => $all,
            'admin'       => $all,
            'operator'    => array_merge(
                $viewOnly,
                [
                    'workorders.view', 'workorders.create', 'workorders.edit',
                    'productions.view', 'productions.create', 'productions.edit',
                    'materials.view', 'materials.create', 'materials.edit',
                    'machines.view', 'processes.view', 'operators.view', 'cncprograms.view',
                    'inventoryitems.view', 'warehouselocations.view', 'qritems.view',
                ]
            ),
            'viewer' => $viewOnly,
        ];
    }

    public function run(): void
    {
        $guard = 'web';
        $permissions = $this->permissions();

        // 1. Crear permisos (sin duplicados)
        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
        }

        // 2. Eliminar permisos que ya no están en la lista
        $existingNames = DB::table('permissions')->where('guard_name', $guard)->pluck('name')->toArray();
        $toRemove = array_diff($existingNames, $permissions);
        if (!empty($toRemove)) {
            $staleIds = DB::table('permissions')->where('guard_name', $guard)->whereIn('name', $toRemove)->pluck('id');
            DB::table('role_has_permissions')->whereIn('permission_id', $staleIds)->delete();
            DB::table('permissions')->whereIn('name', $toRemove)->delete();
        }

        // 3. Crear/actualizar roles y sincronizar permisos (sin dejar permisos huérfanos en el rol)
        foreach ($this->rolesWithPermissions() as $roleName => $permNames) {
            $role = Role::firstOrCreate(
                ['name' => $roleName, 'guard_name' => $guard]
            );
            $valid = array_intersect($permNames, $permissions);
            $role->syncPermissions(array_values($valid));
        }
    }
}
