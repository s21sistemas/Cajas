<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Process;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductProcess>
 */
class ProductProcessFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'process_id' => Process::factory(),
            'name' => null, // nullable now
            'sequence' => fake()->numberBetween(1, 10),
            'estimated_minutes' => fake()->optional()->numberBetween(15, 240),
        ];
    }
}
