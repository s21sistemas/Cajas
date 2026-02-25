<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $departments = ['Producción', 'Calidad', 'Almacén', 'Comercial', 'Finanzas', 'RRHH', 'Mantenimiento', 'Dirección'];
        $positions = [
            'Gerente de Producción', 'Coordinadora de Calidad', 'Supervisor de Corte',
            'Supervisora de Impresión', 'Supervisor de Empaque', 'Gerente de Ventas',
            'Vendedor', 'Auxiliar Contable', 'Mantenimiento', 'Recursos Humanos',
            'Operador de Máquina', 'Operadora de Empaque', 'Técnico de Calidad'
        ];
        $statuses = ['active', 'inactive', 'vacation'];

        return [
            'code' => 'EMP-' . fake()->unique()->numberBetween(1, 1000),
            'name' => fake()->name(),
            'position' => fake()->randomElement($positions),
            'department' => fake()->randomElement($departments),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '(55) ' . fake()->numberBetween(1000, 9999) . '-' . fake()->numberBetween(1000, 9999),
            'salary' => fake()->randomFloat(2, 8000, 80000),
            'hire_date' => fake()->dateBetween('-5 years', 'now'),
            'status' => fake()->randomElement($statuses),
            'avatar' => null,
        ];
    }
}
