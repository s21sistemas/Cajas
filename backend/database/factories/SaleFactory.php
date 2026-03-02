<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'paid', 'overdue', 'cancelled'];
        $paymentTypes = ['cash', 'credit'];

        return [
            'code' => 'V-' . fake()->unique()->numberBetween(1, 10000),
            'client_id' => Client::factory(),
            'client_name' => fake()->company(),
            'quote_id' => null,
            'quote_ref' => null,
            'items' => fake()->numberBetween(1, 10),
            'subtotal' => fake()->randomFloat(2, 100, 10000),
            'tax_rate' => 16,
            'tax' => 0,
            'total' => 0,
            'status' => fake()->randomElement($statuses),
            'payment_type' => fake()->randomElement($paymentTypes),
            'credit_days' => null,
            'payment_method' => fake()->randomElement(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
        ];
    }

    /**
     * Indicate that the sale is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
        ]);
    }

    /**
     * Indicate that the sale is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }
}
