<?php

namespace Database\Seeders;

use App\Models\Operator;
use Illuminate\Database\Seeder;

class OperatorSeeder extends Seeder
{
    /**
     * Seed the operators table.
     */
    public function run(): void
    {
        $operators = [
            [
                'employee_code' => 'OP-001',
                'name' => 'Juan Pérez García',
                'shift' => 'matutino',
                'specialty' => 'corte',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-002',
                'name' => 'María López Hernández',
                'shift' => 'matutino',
                'specialty' => 'impresión',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-003',
                'name' => 'Carlos Ramírez Torres',
                'shift' => 'vespertino',
                'specialty' => 'troquelado',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-004',
                'name' => 'Ana Martínez Ruiz',
                'shift' => 'vespertino',
                'specialty' => 'ensamble',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-005',
                'name' => 'Roberto Díaz Sánchez',
                'shift' => 'matutino',
                'specialty' => 'empaque',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-006',
                'name' => 'Laura Flores Mendoza',
                'shift' => 'vespertino',
                'specialty' => 'control-calidad',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-007',
                'name' => 'Miguel Ángel Cruz',
                'shift' => 'matutino',
                'specialty' => 'corte',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-008',
                'name' => 'Sofia González Pérez',
                'shift' => 'vespertino',
                'specialty' => 'impresión',
                'active' => false,
            ],
            [
                'employee_code' => 'OP-009',
                'name' => 'Fernando López Martínez',
                'shift' => 'matutino',
                'specialty' => 'troquelado',
                'active' => true,
            ],
            [
                'employee_code' => 'OP-010',
                'name' => 'Elena Rodríguez Vargas',
                'shift' => 'vespertino',
                'specialty' => 'ensamble',
                'active' => true,
            ],
        ];

        foreach ($operators as $operator) {
            Operator::firstOrCreate(
                ['employee_code' => $operator['employee_code']],
                $operator
            );
        }
    }
}
