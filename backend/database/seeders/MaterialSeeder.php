<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    /**
     * Seed the materials table.
     */
    public function run(): void
    {
        $materials = [
            // Cartones
            [
                'code' => 'CART-001',
                'name' => 'Cartón Corrugado Simple Cara (C)',
                'description' => 'Cartón corrugado de onda simple cara, ideal para impresiones',
                'category' => 'Cartón',
                'price' => 0.50,
                'cost' => 0.35,
                'unit' => 'kg',
                'stock' => 5000,
                'min_stock' => 1000,
            ],
            [
                'code' => 'CART-002',
                'name' => 'Cartón Corrugado Doble Cara (BC)',
                'description' => 'Cartón corrugado de doble cara, resistente para cajas de mayor peso',
                'category' => 'Cartón',
                'price' => 0.75,
                'cost' => 0.50,
                'unit' => 'kg',
                'stock' => 8000,
                'min_stock' => 2000,
            ],
            [
                'code' => 'CART-003',
                'name' => 'Cartón Corrugado Triple Cara (BCC)',
                'description' => 'Cartón corrugado de triple onda, máxima resistencia',
                'category' => 'Cartón',
                'price' => 1.00,
                'cost' => 0.70,
                'unit' => 'kg',
                'stock' => 3000,
                'min_stock' => 500,
            ],
            [
                'code' => 'CART-004',
                'name' => 'Cartón Plano (Liner)',
                'description' => 'Cartón plano para liner de corrugado',
                'category' => 'Cartón',
                'price' => 0.40,
                'cost' => 0.25,
                'unit' => 'kg',
                'stock' => 10000,
                'min_stock' => 3000,
            ],
            [
                'code' => 'CART-005',
                'name' => 'Cartón Microcorrugado (E)',
                'description' => 'Cartón microcorrugado para cajas pequeñas de alta calidad',
                'category' => 'Cartón',
                'price' => 0.60,
                'cost' => 0.40,
                'unit' => 'kg',
                'stock' => 2000,
                'min_stock' => 500,
            ],

            // Tintas
            [
                'code' => 'TINT-001',
                'name' => 'Tinta Flexográfica Negra',
                'description' => 'Tinta flexográfica de secado rápido color negro',
                'category' => 'Tinta',
                'price' => 45.00,
                'cost' => 30.00,
                'unit' => 'kg',
                'stock' => 200,
                'min_stock' => 50,
            ],
            [
                'code' => 'TINT-002',
                'name' => 'Tinta Flexográfica Cyan',
                'description' => 'Tinta flexográfica color cyan',
                'category' => 'Tinta',
                'price' => 55.00,
                'cost' => 38.00,
                'unit' => 'kg',
                'stock' => 100,
                'min_stock' => 30,
            ],
            [
                'code' => 'TINT-003',
                'name' => 'Tinta Flexográfica Magenta',
                'description' => 'Tinta flexográfica color magenta',
                'category' => 'Tinta',
                'price' => 55.00,
                'cost' => 38.00,
                'unit' => 'kg',
                'stock' => 100,
                'min_stock' => 30,
            ],
            [
                'code' => 'TINT-004',
                'name' => 'Tinta Flexográfica Amarilla',
                'description' => 'Tinta flexográfica color amarillo',
                'category' => 'Tinta',
                'price' => 50.00,
                'cost' => 35.00,
                'unit' => 'kg',
                'stock' => 100,
                'min_stock' => 30,
            ],

            // Pegamentos
            [
                'code' => 'PEG-001',
                'name' => 'Pegamento Base Agua (Caja fría)',
                'description' => 'Pegamento de base agua para máquinas de pegar automático',
                'category' => 'Pegamento',
                'price' => 25.00,
                'cost' => 15.00,
                'unit' => 'kg',
                'stock' => 500,
                'min_stock' => 100,
            ],
            [
                'code' => 'PEG-002',
                'name' => 'Pegamento Termofusible (Hot melt)',
                'description' => 'Pegamento termofusible para aplicaciones de alta velocidad',
                'category' => 'Pegamento',
                'price' => 35.00,
                'cost' => 22.00,
                'unit' => 'kg',
                'stock' => 300,
                'min_stock' => 80,
            ],
            [
                'code' => 'PEG-003',
                'name' => 'Pegamento para Autocierre',
                'description' => 'Pegamento especial para cintas de autocierre',
                'category' => 'Pegamento',
                'price' => 40.00,
                'cost' => 28.00,
                'unit' => 'kg',
                'stock' => 150,
                'min_stock' => 40,
            ],

            // Planchas de impresión
            [
                'code' => 'PLAN-001',
                'name' => 'Plancha Fotopolímero 1.7mm',
                'description' => 'Plancha de impresión fotopolímero para flexografía',
                'category' => 'Insumos',
                'price' => 180.00,
                'cost' => 120.00,
                'unit' => 'pza',
                'stock' => 50,
                'min_stock' => 15,
            ],
            [
                'code' => 'PLAN-002',
                'name' => 'Plancha Fotopolímero 2.84mm',
                'description' => 'Plancha de impresión fotopolímero para corrugado',
                'category' => 'Insumos',
                'price' => 220.00,
                'cost' => 150.00,
                'unit' => 'pza',
                'stock' => 30,
                'min_stock' => 10,
            ],

            // Cuchillas y Troqueles
            [
                'code' => 'CUCH-001',
                'name' => 'Cuchilla de Corte',
                'description' => 'Cuchilla de corte para troqueladora',
                'category' => 'Herramientas',
                'price' => 85.00,
                'cost' => 55.00,
                'unit' => 'pza',
                'stock' => 100,
                'min_stock' => 25,
            ],
            [
                'code' => 'CUCH-002',
                'name' => 'Cuchilla de Refile',
                'description' => 'Cuchilla de refile para acabado',
                'category' => 'Herramientas',
                'price' => 65.00,
                'cost' => 40.00,
                'unit' => 'pza',
                'stock' => 80,
                'min_stock' => 20,
            ],
            [
                'code' => 'CUCH-003',
                'name' => 'Hilo de Troquel',
                'description' => 'Hilo de acero para troquelado',
                'category' => 'Herramientas',
                'price' => 120.00,
                'cost' => 80.00,
                'unit' => 'kg',
                'stock' => 50,
                'min_stock' => 15,
            ],

            // Películas y materiales de empaque
            [
                'code' => 'PELI-001',
                'name' => 'Film Stretch',
                'description' => 'Film stretch para empaque de pallets',
                'category' => 'Empaque',
                'price' => 18.00,
                'cost' => 12.00,
                'unit' => 'kg',
                'stock' => 500,
                'min_stock' => 100,
            ],
            [
                'code' => 'PELI-002',
                'name' => 'Cinta Adhesiva de Empaque',
                'description' => 'Cinta adhesiva transparente para cierre de cajas',
                'category' => 'Empaque',
                'price' => 8.00,
                'cost' => 5.00,
                'unit' => 'rollos',
                'stock' => 1000,
                'min_stock' => 200,
            ],
            [
                'code' => 'PELI-003',
                'name' => 'Bolsa de Polietileno',
                'description' => 'Bolsas de polietileno para empaque individual',
                'category' => 'Empaque',
                'price' => 0.15,
                'cost' => 0.08,
                'unit' => 'pza',
                'stock' => 50000,
                'min_stock' => 10000,
            ],

            // Aceites y Lubricantes
            [
                'code' => 'ACEI-001',
                'name' => 'Aceite Lubricante para Máquinas',
                'description' => 'Aceite lubricante multigrado para maquinaria',
                'category' => 'Mantenimiento',
                'price' => 150.00,
                'cost' => 100.00,
                'unit' => 'lt',
                'stock' => 100,
                'min_stock' => 25,
            ],
            [
                'code' => 'ACEI-002',
                'name' => 'Grasa Lubricante',
                'description' => 'Grasa lubricante para rodamientos',
                'category' => 'Mantenimiento',
                'price' => 85.00,
                'cost' => 55.00,
                'unit' => 'kg',
                'stock' => 50,
                'min_stock' => 15,
            ],

            // Resistencias y repuestos eléctricos
            [
                'code' => 'REP-001',
                'name' => 'Resistencia para Máquina de Pegar',
                'description' => 'Resistencia de calentamiento para máquinas de hot melt',
                'category' => 'Repuestos',
                'price' => 250.00,
                'cost' => 170.00,
                'unit' => 'pza',
                'stock' => 20,
                'min_stock' => 5,
            ],
            [
                'code' => 'REP-002',
                'name' => 'Banda Transportadora de Goma',
                'description' => 'Banda de caucho para transportadores',
                'category' => 'Repuestos',
                'price' => 350.00,
                'cost' => 230.00,
                'unit' => 'mt',
                'stock' => 50,
                'min_stock' => 10,
            ],
        ];

        foreach ($materials as $material) {
            Material::firstOrCreate(
                ['code' => $material['code']],
                $material
            );
        }
    }
}
