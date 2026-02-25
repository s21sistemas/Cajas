<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Operator>
 */
class OperatorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $shifts = ['matutino', 'vespertino', 'nocturno'];
        $specialties = ['corte', 'impresion', 'troquelado', 'ensamble', 'empaque', 'control-calidad'];

        return [
            'employee_code' => 'OP-' . fake()->unique()->numberBetween(1, 100),
            'name' => fake()->name(),
            'shift' => fake()->randomElement($shifts),
            'specialty' => fake()->randomElement($specialties),
            'active' => fake()->boolean(90),
        ];
    }
}
