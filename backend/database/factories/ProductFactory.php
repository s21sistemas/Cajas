<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['cajas-estandar', 'cajas-especiales', 'cajas-troqueladas', 'cajas-reforzadas'];
        $statuses = ['active', 'inactive', 'discontinued'];

        return [
            'code' => 'CAJ-' . fake()->unique()->numberBetween(100, 999),
            'name' => fake()->randomElement([
                'Caja de cartón corrugado ',
                'Caja de cartón troquelada ',
                'Caja de cartón con divisor ',
                'Caja de cartón para pizza ',
                'Caja archivador ',
            ]) . fake()->randomElement(['pequeña', 'mediana', 'grande', 'extra grande']),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement($categories),
            'price' => fake()->randomFloat(2, 5, 100),
            'cost' => fake()->randomFloat(2, 2, 50),
            'unit' => 'pieza',
            'stock' => fake()->numberBetween(0, 1000),
            'min_stock' => fake()->numberBetween(10, 50),
            'status' => fake()->randomElement($statuses),
        ];
    }
}
