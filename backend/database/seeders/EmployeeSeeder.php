<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Seed the employees table.
     */
    public function run(): void
    {
        $employees = [
            [
                'code' => 'EMP-001',
                'name' => 'Carlos Alberto Mendoza',
                'position' => 'Gerente de Producción',
                'department' => 'Producción',
                'email' => 'carlos.mendoza@empresa.com',
                'phone' => '(55) 1234-0001',
                'salary' => 45000.00,
                'hire_date' => '2020-01-15',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-002',
                'name' => 'María Fernanda Torres',
                'position' => 'Coordinadora de Calidad',
                'department' => 'Calidad',
                'email' => 'maria.torres@empresa.com',
                'phone' => '(55) 1234-0002',
                'salary' => 32000.00,
                'hire_date' => '2021-03-20',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-003',
                'name' => 'Roberto González López',
                'position' => 'Supervisor de Corte',
                'department' => 'Producción',
                'email' => 'roberto.gonzalez@empresa.com',
                'phone' => '(55) 1234-0003',
                'salary' => 28000.00,
                'hire_date' => '2019-07-10',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-004',
                'name' => 'Ana María Ruiz Sánchez',
                'position' => 'Supervisora de Impresión',
                'department' => 'Producción',
                'email' => 'ana.ruiz@empresa.com',
                'phone' => '(55) 1234-0004',
                'salary' => 28500.00,
                'hire_date' => '2019-09-05',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-005',
                'name' => 'José Luis Hernández',
                'position' => 'Supervisor de Empaque',
                'department' => 'Almacén',
                'email' => 'jose.hernandez@empresa.com',
                'phone' => '(55) 1234-0005',
                'salary' => 25000.00,
                'hire_date' => '2020-02-01',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-006',
                'name' => 'Patricia Velázquez Díaz',
                'position' => 'Gerente de Ventas',
                'department' => 'Comercial',
                'email' => 'patricia.velazquez@empresa.com',
                'phone' => '(55) 1234-0006',
                'salary' => 50000.00,
                'hire_date' => '2018-11-20',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-007',
                'name' => 'Miguel Ángel Ramírez',
                'position' => 'Vendedor',
                'department' => 'Comercial',
                'email' => 'miguel.ramirez@empresa.com',
                'phone' => '(55) 1234-0007',
                'salary' => 18000.00,
                'hire_date' => '2022-04-15',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-008',
                'name' => 'Gabriela Martínez Cruz',
                'position' => 'Auxiliar Contable',
                'department' => 'Finanzas',
                'email' => 'gabriela.martinez@empresa.com',
                'phone' => '(55) 1234-0008',
                'salary' => 15000.00,
                'hire_date' => '2023-01-10',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-009',
                'name' => 'Francisco Javier López',
                'position' => 'Mantenimiento',
                'department' => 'Mantenimiento',
                'email' => 'francisco.lopez@empresa.com',
                'phone' => '(55) 1234-0009',
                'salary' => 20000.00,
                'hire_date' => '2021-06-01',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-010',
                'name' => 'Rosa María Hernández',
                'position' => 'Recursos Humanos',
                'department' => 'RRHH',
                'email' => 'rosa.hernandez@empresa.com',
                'phone' => '(55) 1234-0010',
                'salary' => 22000.00,
                'hire_date' => '2020-08-15',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-011',
                'name' => 'Luis Carlos Mendoza',
                'position' => 'Operador de Máquina',
                'department' => 'Producción',
                'email' => 'luis.mendoza@empresa.com',
                'phone' => '(55) 1234-0011',
                'salary' => 12000.00,
                'hire_date' => '2023-02-20',
                'status' => 'active',
                'avatar' => null,
            ],
            [
                'code' => 'EMP-012',
                'name' => 'Sofia Pérez García',
                'position' => 'Operadora de Empaque',
                'department' => 'Almacén',
                'email' => 'sofia.perez@empresa.com',
                'phone' => '(55) 1234-0012',
                'salary' => 10000.00,
                'hire_date' => '2023-05-10',
                'status' => 'active',
                'avatar' => null,
            ],
        ];

        foreach ($employees as $employee) {
            Employee::firstOrCreate(
                ['code' => $employee['code']],
                $employee
            );
        }
    }
}
