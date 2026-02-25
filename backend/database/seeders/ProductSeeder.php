<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Seed the products table.
     */
    public function run(): void
    {
        $products = [
            [
                'code' => 'CAJ-001',
                'name' => 'Caja de cartón corrugado 20x20x20 cm',
                'description' => 'Caja estándar para paquetería general',
                'category' => 'cajas-estandar',
                'price' => 15.50,
                'cost' => 8.00,
                'unit' => 'pieza',
                'stock' => 500,
                'min_stock' => 50,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-002',
                'name' => 'Caja de cartón corrugado 30x30x30 cm',
                'description' => 'Caja mediana para paquetería',
                'category' => 'cajas-estandar',
                'price' => 22.00,
                'cost' => 12.00,
                'unit' => 'pieza',
                'stock' => 350,
                'min_stock' => 30,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-003',
                'name' => 'Caja de cartón corrugado 40x40x40 cm',
                'description' => 'Caja grande para paquetería pesada',
                'category' => 'cajas-estandar',
                'price' => 35.00,
                'cost' => 18.00,
                'unit' => 'pieza',
                'stock' => 200,
                'min_stock' => 20,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-004',
                'name' => 'Caja de cartón para pizza',
                'description' => 'Caja especializada para delivery de pizza',
                'category' => 'cajas-especiales',
                'price' => 8.50,
                'cost' => 4.00,
                'unit' => 'pieza',
                'stock' => 1000,
                'min_stock' => 100,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-005',
                'name' => 'Caja de cartón con divisor',
                'description' => 'Caja con divisiones internas para botellas',
                'category' => 'cajas-especiales',
                'price' => 28.00,
                'cost' => 15.00,
                'unit' => 'pieza',
                'stock' => 150,
                'min_stock' => 20,
                'status' => 'inactive',
            ],
            [
                'code' => 'CAJ-006',
                'name' => 'Caja de cartón troquelada pequeña',
                'description' => 'Caja con autocierre para productos pequeños',
                'category' => 'cajas-troqueladas',
                'price' => 5.00,
                'cost' => 2.50,
                'unit' => 'pieza',
                'stock' => 2000,
                'min_stock' => 200,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-007',
                'name' => 'Caja de cartón troquelada mediana',
                'description' => 'Caja con autocierre para productos medianos',
                'category' => 'cajas-troqueladas',
                'price' => 12.00,
                'cost' => 6.00,
                'unit' => 'pieza',
                'stock' => 800,
                'min_stock' => 80,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-008',
                'name' => 'Caja de cartón con ventana',
                'description' => 'Caja con ventana de plástico para exhibición',
                'category' => 'cajas-especiales',
                'price' => 45.00,
                'cost' => 25.00,
                'unit' => 'pieza',
                'stock' => 100,
                'min_stock' => 10,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-009',
                'name' => 'Caja de cartón doble pared 50x50x50 cm',
                'description' => 'Caja reforzada para objetos pesados',
                'category' => 'cajas-reforzadas',
                'price' => 65.00,
                'cost' => 35.00,
                'unit' => 'pieza',
                'stock' => 50,
                'min_stock' => 10,
                'status' => 'active',
            ],
            [
                'code' => 'CAJ-010',
                'name' => 'Caja archivador',
                'description' => 'Caja para archivo documental',
                'category' => 'cajas-especiales',
                'price' => 18.00,
                'cost' => 9.00,
                'unit' => 'pieza',
                'stock' => 400,
                'min_stock' => 40,
                'status' => 'active',
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['code' => $product['code']],
                $product
            );
        }
    }
}
