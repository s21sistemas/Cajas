<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['materia-prima', 'insumos', 'herramientas', 'maquinaria', 'empaque', 'servicios'];
        $statuses = ['active', 'inactive', 'pending'];
        $states = ['CDMX', 'Nuevo León', 'Jalisco', 'Puebla', 'Querétaro', 'Estado de México'];

        return [
            'code' => 'PROV-' . fake()->unique()->numberBetween(1, 1000),
            'name' => fake()->company() . ' ' . fake()->randomElement(['SA de CV', 'SC', 'S de RL', 'SAPI de CV']),
            'rfc' => strtoupper(fake()->bothify('???-######-??')),
            'email' => fake()->companyEmail(),
            'phone' => '(55) ' . fake()->numberBetween(1000, 9999) . '-' . fake()->numberBetween(1000, 9999),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->randomElement($states),
            'contact' => fake()->name(),
            'category' => fake()->randomElement($categories),
            'lead_time' => fake()->numberBetween(1, 30),
            'rating' => fake()->numberBetween(1, 5),
            'balance' => fake()->randomFloat(2, 0, 50000),
            'status' => fake()->randomElement($statuses),
        ];
    }
}
