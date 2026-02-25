<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Machine>
 */
class MachineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['corte', 'troquelado', 'impresion', 'ensamble', 'empaque', 'plegado', 'acabado'];
        $statuses = ['operational', 'maintenance', 'offline', 'broken'];
        $brands = ['Heidelberg', 'Bobst', 'Windmöller', 'Horizon', 'Boschert', 'Biesse', 'Muller Martini'];
        $locations = ['Área de Corte A', 'Área de Corte B', 'Área de Impresión', 'Área de Troquelado', 'Área de Empaque', 'Línea de Ensamble 1', 'Línea de Ensamble 2'];

        return [
            'code' => 'MAQ-' . fake()->unique()->numberBetween(1, 100),
            'name' => fake()->randomElement($types) . ' ' . fake()->randomElement(['industrial', 'automática', 'semiautomática', 'de precisión']),
            'type' => fake()->randomElement($types),
            'axes' => fake()->randomElement([0, 3, 4, 5]),
            'brand' => fake()->randomElement($brands),
            'model' => fake()->bothify('??-###'),
            'location' => fake()->randomElement($locations),
            'status' => fake()->randomElement($statuses),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
