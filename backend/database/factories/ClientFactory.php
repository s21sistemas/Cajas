<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Client>
 */
class ClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['active', 'inactive', 'blocked'];
        $states = ['CDMX', 'Nuevo León', 'Jalisco', 'Puebla', 'Querétaro', 'Estado de México'];

        return [
            'code' => 'CLI-' . fake()->unique()->numberBetween(1, 1000),
            'name' => fake()->company(),
            'rfc' => strtoupper(fake()->bothify('???-######-??')),
            'email' => fake()->companyEmail(),
            'phone' => '(55) ' . fake()->numberBetween(1000, 9999) . '-' . fake()->numberBetween(1000, 9999),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->randomElement($states),
            'credit_limit' => fake()->randomFloat(2, 10000, 500000),
            'balance' => fake()->randomFloat(2, 0, 100000),
            'status' => fake()->randomElement($statuses),
        ];
    }
}
