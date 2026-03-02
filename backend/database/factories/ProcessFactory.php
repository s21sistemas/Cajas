<?php

namespace Database\Factories;

use App\Models\ProcessType;
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
        $names = ['Corte', 'Impresión', 'Troquelado', 'Ensamblaje', 'Empaque', 'Plegado', 'Acabado', 'Control de Calidad'];

        return [
            'code' => 'PROC-' . fake()->unique()->numberBetween(1, 1000),
            'name' => fake()->randomElement($names),
            'process_type_id' => null, // Will be nullable
            'description' => fake()->optional()->sentence(),
            'requires_machine' => fake()->boolean(70),
            'estimated_time_min' => fake()->optional()->numberBetween(10, 480),
            'status' => 'active',
        ];
    }

    /**
     * Indicate that the process is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
        ]);
    }
}
