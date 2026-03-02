<?php

namespace Database\Seeders;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Database\Seeder;

class QuoteSeeder extends Seeder
{
    /**
     * Seed the quotes table with draft quotes.
     */
    public function run(): void
    {
        $clients = Client::all();
        $products = Product::where('status', 'active')->get();

        if ($clients->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No clients or products found. Please run ClientSeeder and ProductSeeder first.');
            return;
        }

        $quotes = [
            [
                'title' => 'Cotización de cajas para pedido de temporada',
                'items_count' => 3,
                'subtotal' => 7750.00,
                'tax_percentage' => 16.00,
                'tax' => 1240.00,
                'total' => 8990.00,
                'valid_until' => now()->addDays(30)->format('Y-m-d'),
            ],
            [
                'title' => 'Caja corrugada para exportación',
                'items_count' => 2,
                'subtotal' => 15000.00,
                'tax_percentage' => 16.00,
                'tax' => 2400.00,
                'total' => 17400.00,
                'valid_until' => now()->addDays(15)->format('Y-m-d'),
            ],
            [
                'title' => 'Pedido mensual de cajas estándar',
                'items_count' => 4,
                'subtotal' => 8500.00,
                'tax_percentage' => 16.00,
                'tax' => 1360.00,
                'total' => 9860.00,
                'valid_until' => now()->addDays(20)->format('Y-m-d'),
            ],
            [
                'title' => 'Cajas para tienda departamental',
                'items_count' => 5,
                'subtotal' => 22500.00,
                'tax_percentage' => 16.00,
                'tax' => 3600.00,
                'total' => 26100.00,
                'valid_until' => now()->addDays(45)->format('Y-m-d'),
            ],
            [
                'title' => 'Cajas troqueladas para Joyería',
                'items_count' => 2,
                'subtotal' => 4500.00,
                'tax_percentage' => 16.00,
                'tax' => 720.00,
                'total' => 5220.00,
                'valid_until' => now()->addDays(10)->format('Y-m-d'),
            ],
            [
                'title' => 'Cajas para bakery artesanal',
                'items_count' => 3,
                'subtotal' => 3200.00,
                'tax_percentage' => 16.00,
                'tax' => 512.00,
                'total' => 3712.00,
                'valid_until' => now()->addDays(7)->format('Y-m-d'),
            ],
            [
                'title' => 'Cajas para電子產品 (electrónica)',
                'items_count' => 4,
                'subtotal' => 18500.00,
                'tax_percentage' => 16.00,
                'tax' => 2960.00,
                'total' => 21460.00,
                'valid_until' => now()->addDays(30)->format('Y-m-d'),
            ],
            [
                'title' => 'Empaque para supermercado',
                'items_count' => 6,
                'subtotal' => 32000.00,
                'tax_percentage' => 16.00,
                'tax' => 5120.00,
                'total' => 37120.00,
                'valid_until' => now()->addDays(60)->format('Y-m-d'),
            ],
        ];

        $quoteIndex = 1;

        foreach ($quotes as $quoteData) {
            // Select a random client
            $client = $clients->random();
            
            // Generate quote code
            $quoteCode = 'COT-' . str_pad($quoteIndex, 5, '0', STR_PAD_LEFT);
            
            $quote = Quote::create([
                'code' => $quoteCode,
                'client_id' => $client->id,
                'client_name' => $client->name,
                'title' => $quoteData['title'],
                'items_count' => $quoteData['items_count'],
                'subtotal' => $quoteData['subtotal'],
                'tax_percentage' => $quoteData['tax_percentage'],
                'tax' => $quoteData['tax'],
                'total' => $quoteData['total'],
                'status' => 'draft', // All quotes as draft
                'valid_until' => $quoteData['valid_until'],
                'created_by' => 'Sistema',
            ]);

            // Create quote items (random 2-5 items per quote)
            $numItems = min($quoteData['items_count'], $products->count());
            $selectedProducts = $products->random($numItems);

            foreach ($selectedProducts as $product) {
                $quantity = rand(50, 500);
                $unitPrice = $product->price;
                $total = $quantity * $unitPrice;

                QuoteItem::create([
                    'quote_id' => $quote->id,
                    'product_id' => $product->id,
                    'description' => $product->name,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ]);
            }

            $quoteIndex++;
        }

        $this->command->info('Created ' . count($quotes) . ' draft quotes with items.');
    }
}
