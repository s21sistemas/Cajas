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
            // Sistema
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete',
            
            // General
            'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
            'settings.view', 'settings.create', 'settings.edit', 'settings.delete',
            'reports.view', 'reports.create', 'reports.edit', 'reports.delete',
            
            // Ventas
            'clients.view', 'clients.create', 'clients.edit', 'clients.delete',
            'quotes.view', 'quotes.create', 'quotes.edit', 'quotes.delete',
            'sales.view', 'sales.create', 'sales.edit', 'sales.delete',
            'serviceorders.view', 'serviceorders.create', 'serviceorders.edit', 'serviceorders.delete',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            
            // Compras
            'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
            'purchaseorders.view', 'purchaseorders.create', 'purchaseorders.edit', 'purchaseorders.delete',
            'supplierstatements.view', 'supplierstatements.create', 'supplierstatements.edit', 'supplierstatements.delete',
            
            // Almacén
            'inventoryitems.view', 'inventoryitems.create', 'inventoryitems.edit', 'inventoryitems.delete',
            'warehouselocations.view', 'warehouselocations.create', 'warehouselocations.edit', 'warehouselocations.delete',
            'qritems.view', 'qritems.create', 'qritems.edit', 'qritems.delete',
            'warehouse.view', 'warehouse.create', 'warehouse.edit', 'warehouse.delete',
            'materials.view', 'materials.create', 'materials.edit', 'materials.delete',
            'warehousemovements.view', 'warehousemovements.create', 'warehousemovements.edit', 'warehousemovements.delete',
            
            // Producción
            'workorders.view', 'workorders.create', 'workorders.edit', 'workorders.delete',
            'quality.view', 'quality.create', 'quality.edit', 'quality.delete',
            'machines.view', 'machines.create', 'machines.edit', 'machines.delete',
            'machines.force_delete.view', 'machines.force_delete.create', 'machines.force_delete.edit', 'machines.force_delete.delete',
            'processes.view', 'processes.create', 'processes.edit', 'processes.delete',
            'processtypes.view', 'processtypes.create', 'processtypes.edit', 'processtypes.delete',
            'productions.view', 'productions.create', 'productions.edit', 'productions.delete',
            'operators.view', 'operators.create', 'operators.edit', 'operators.delete',
            'qualityevaluations.view', 'qualityevaluations.create', 'qualityevaluations.edit', 'qualityevaluations.delete',
            'maintenanceorders.view', 'maintenanceorders.create', 'maintenanceorders.edit', 'maintenanceorders.delete',
            
            // Finanzas
            'bankaccounts.view', 'bankaccounts.create', 'bankaccounts.edit', 'bankaccounts.delete',
            'accountstatements.view', 'accountstatements.create', 'accountstatements.edit', 'accountstatements.delete',
            'banktransactions.view', 'banktransactions.create', 'banktransactions.edit', 'banktransactions.delete',
            'movements.view', 'movements.create', 'movements.edit', 'movements.delete',
            
            // Recursos Humanos
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
            
            // Logística
            'vehicles.view', 'vehicles.create', 'vehicles.edit', 'vehicles.delete',
            'deliveries.view', 'deliveries.create', 'deliveries.edit', 'deliveries.delete',
            'gasolinereceipts.view', 'gasolinereceipts.create', 'gasolinereceipts.edit', 'gasolinereceipts.delete',
            
            // Órdenes de Pedido
            'ordenes_pedido.view', 'ordenes_pedido.create', 'ordenes_pedido.edit', 'ordenes_pedido.delete',
        ];
    }

    /**
     * Roles y sus permisos. Solo se asignan permisos que existan en permissions().
     */
    protected function rolesWithPermissions(): array
    {
        $all = $this->permissions();
        $viewOnly = array_values(array_filter($all, fn ($p) => str_ends_with($p, '.view')));

        // Permisos por módulo
        $hrPermissions = array_values(array_filter($all, fn ($p) => 
            str_starts_with($p, 'employees') ||
            str_starts_with($p, 'loans') ||
            str_starts_with($p, 'loantypes') ||
            str_starts_with($p, 'discount') ||
            str_starts_with($p, 'discounttypes') ||
            str_starts_with($p, 'vacation') ||
            str_starts_with($p, 'disabilities') ||
            str_starts_with($p, 'guardpayments') ||
            str_starts_with($p, 'overtimes') ||
            str_starts_with($p, 'absences') ||
            str_starts_with($p, 'employeeaccounts')
        ));

        $productionPermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'productions') ||
            str_starts_with($p, 'workorders') ||
            str_starts_with($p, 'machines') ||
            str_starts_with($p, 'processes') ||
            str_starts_with($p, 'processtypes') ||
            str_starts_with($p, 'operators') ||
            str_starts_with($p, 'qualityevaluations') ||
            str_starts_with($p, 'maintenanceorders')
        ));

        // Máquinas permissions para roles especiales
        $machinesPermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'machines')
        ));

        $machinesForceDeletePermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'machines.force_delete')
        ));

        $warehousePermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'inventoryitems') ||
            str_starts_with($p, 'warehouselocations') ||
            str_starts_with($p, 'warehouse') ||
            str_starts_with($p, 'materials') ||
            str_starts_with($p, 'qritems') ||
            str_starts_with($p, 'warehousemovements')
        ));

        $salesPermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'clients') ||
            str_starts_with($p, 'quotes') ||
            str_starts_with($p, 'sales') ||
            str_starts_with($p, 'serviceorders') ||
            str_starts_with($p, 'products')
        ));

        $purchasingPermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'suppliers') ||
            str_starts_with($p, 'purchaseorders') ||
            str_starts_with($p, 'supplierstatements')
        ));

        $financePermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'bankaccounts') ||
            str_starts_with($p, 'accountstatements') ||
            str_starts_with($p, 'banktransactions') ||
            str_starts_with($p, 'movements')
        ));

        $maintenancePermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'machines') ||
            str_starts_with($p, 'maintenanceorders')
        ));

        $logisticsPermissions = array_values(array_filter($all, fn ($p) =>
            str_starts_with($p, 'vehicles') ||
            str_starts_with($p, 'deliveries') ||
            str_starts_with($p, 'gasolinereceipts')
        ));

        return [
            // Roles de sistema
            'Super Admin' => $all,
            'admin'       => $all,
            
            // Roles por departamento
            'Gerente' => array_merge(
                array_values(array_filter($all, fn ($p) => str_ends_with($p, '.view'))),
                ['reports.view', 'reports.create', 'settings.view', 'settings.edit']
            ),
            
            'Recursos Humanos' => array_merge(
                $hrPermissions,
                ['employees.view', 'employees.create', 'employees.edit', 'employees.delete'],
                ['reports.view', 'reports.create']
            ),
            
            'Jefe de Producción' => array_merge(
                $productionPermissions,
                ['materials.view', 'inventoryitems.view', 'warehouse.view', 'reports.view']
            ),
            
            'Operador de Producción' => array_merge(
                array_values(array_filter($productionPermissions, fn ($p) => str_ends_with($p, '.view') || 
                    in_array($p, ['workorders.create', 'workorders.edit', 'productions.create', 'productions.edit', 'materials.create', 'materials.edit']))),
                ['machines.view', 'processes.view', 'operators.view', 'inventoryitems.view', 'warehouselocations.view', 'qritems.view']
            ),
            
            'Jefe de Almacén' => array_merge(
                $warehousePermissions,
                ['reports.view']
            ),
            
            'Almacenista' => array_merge(
                array_values(array_filter($warehousePermissions, fn ($p) => str_ends_with($p, '.view') || 
                    in_array($p, ['inventoryitems.create', 'inventoryitems.edit', 'materials.create', 'materials.edit', 'warehouse.create'])))
            ),
            
            'Ventas' => array_merge(
                $salesPermissions,
                ['clients.view', 'clients.create', 'clients.edit', 'quotes.create', 'quotes.edit', 'sales.create']
            ),
            
            'Jefe de Ventas' => array_merge(
                $salesPermissions,
                ['reports.view', 'reports.create']
            ),
            
            'Compras' => array_merge(
                $purchasingPermissions,
                ['suppliers.create', 'suppliers.edit']
            ),
            
            'Finanzas' => array_merge(
                $financePermissions,
                ['reports.view', 'reports.create', 'settings.view']
            ),
            
            'Contabilidad' => array_merge(
                $financePermissions,
                ['bankaccounts.view', 'accountstatements.view', 'banktransactions.view', 'movements.view']
            ),
            
            'Mantenimiento' => array_merge(
                $maintenancePermissions,
                ['machines.view', 'machines.create', 'machines.edit', 'machines.force_delete.view', 'machines.force_delete.delete']
            ),
            
            'Logística' => array_merge(
                $logisticsPermissions,
                ['vehicles.view', 'vehicles.create', 'vehicles.edit', 'deliveries.create', 'deliveries.edit', 'gasolinereceipts.create']
            ),
            
            'Proveedor Externo' => [
                'ordenes_pedido.view',
            ],
            
            // Roles legacy (mantener para compatibilidad)
            'operator'    => array_merge(
                $viewOnly,
                [
                    'workorders.view', 'workorders.create', 'workorders.edit',
                    'productions.view', 'productions.create', 'productions.edit',
                    'materials.view', 'materials.create', 'materials.edit',
                    'machines.view', 'processes.view', 'operators.view',
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
