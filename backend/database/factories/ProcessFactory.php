<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Process>
 */
class ProcessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $processTypes = ['corte', 'troquelado', 'impresion', 'plegado', 'ensamble', 'empaque', 'control-calidad', 'almacenamiento'];
        $statuses = ['active', 'inactive'];

        return [
            'code' => 'PROC-' . fake()->unique()->numberBetween(100, 999),
            'name' => fake()->randomElement([
                'Corte de ',
                'Troquelado de ',
                'Impresión de ',
                'Plegado de ',
                'Ensamblado de ',
                'Empaque de ',
                'Control de calidad de ',
            ]) . fake()->randomElement(['láminas', 'cajas', 'productos', 'material']),
            'process_type' => fake()->randomElement($processTypes),
            'description' => fake()->sentence(),
            'requires_machine' => fake()->boolean(70),
            'sequence' => fake()->numberBetween(1, 10),
            'estimated_time_min' => fake()->randomFloat(2, 1, 30),
            'status' => fake()->randomElement($statuses),
            'order_index' => fake()->numberBetween(1, 10),
        ];
    }
}
