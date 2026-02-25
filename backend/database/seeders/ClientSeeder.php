<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Seed the clients table.
     */
    public function run(): void
    {
        $clients = [
            [
                'code' => 'CLI-001',
                'name' => 'Comercializadora XYZ',
                'rfc' => 'XYZ-123456789',
                'email' => 'contacto@xyz.com',
                'phone' => '(55) 1234-5678',
                'address' => 'Av. Principal 100, Col. Centro',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 100000.00,
                'balance' => 0.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-002',
                'name' => 'Distribuidora ABC',
                'rfc' => 'ABC-987654321',
                'email' => 'ventas@abc.com',
                'phone' => '(55) 9876-5432',
                'address' => 'Calle 2 #45, Col. Industrial',
                'city' => 'Monterrey',
                'state' => 'Nuevo León',
                'credit_limit' => 150000.00,
                'balance' => 25000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-003',
                'name' => 'Empaques del Norte',
                'rfc' => 'EN-456789123',
                'email' => 'info@empaquesnorte.com',
                'phone' => '(81) 5678-1234',
                'address' => 'Blvd. Madero 500, Col. San Pedro',
                'city' => 'Monterrey',
                'state' => 'Nuevo León',
                'credit_limit' => 200000.00,
                'balance' => 45000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-004',
                'name' => 'Supermercados La Oferta',
                'rfc' => 'SLO-789123456',
                'email' => 'compras@laoferta.com',
                'phone' => '(55) 3456-7890',
                'address' => 'Av. Insurgentes 2500, Col. Roma',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 500000.00,
                'balance' => 120000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-005',
                'name' => 'Farmacias del Bienestar',
                'rfc' => 'FB-321654987',
                'email' => 'operaciones@fbienestar.com',
                'phone' => '(55) 7890-1234',
                'address' => 'Calle 5 #100, Col. Condesa',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 300000.00,
                'balance' => 75000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-006',
                'name' => 'Restaurante El Sazón',
                'rfc' => 'RS-654987321',
                'email' => 'administracion@elsazon.com',
                'phone' => '(55) 2345-6789',
                'address' => 'Av. Chapalilla 80, Col. Ajusco',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 25000.00,
                'balance' => 5000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-007',
                'name' => 'Tecnología de Empaque SA',
                'rfc' => 'TE-147258369',
                'email' => 'ventas@tecnologiaempaque.com',
                'phone' => '(33) 3698-1470',
                'address' => 'Av. López Mateos 1500, Col. Prados',
                'city' => 'Guadalajara',
                'state' => 'Jalisco',
                'credit_limit' => 180000.00,
                'balance' => 30000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-008',
                'name' => 'Exportadora Mexicana',
                'rfc' => 'EX-852963741',
                'email' => 'export@exportmexicana.com',
                'phone' => '(55) 7418-5296',
                'address' => 'Periférico 5000, Col. Polanco',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 1000000.00,
                'balance' => 250000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-009',
                'name' => 'Artes Gráficas Modernas',
                'rfc' => 'AGM-963852741',
                'email' => 'contacto@artesgraficas.com',
                'phone' => '(55) 8527-9631',
                'address' => 'Eje Central 200, Col. Doctores',
                'city' => 'Ciudad de México',
                'state' => 'CDMX',
                'credit_limit' => 75000.00,
                'balance' => 15000.00,
                'status' => 'active',
            ],
            [
                'code' => 'CLI-010',
                'name' => 'Panadería Industrial del Centro',
                'rfc' => 'PIC-741852963',
                'email' => 'compras@panindustrial.com',
                'phone' => '(55) 9638-7412',
                'address' => 'Calle 10 #25, Col. Centro',
                'city' => 'Puebla',
                'state' => 'Puebla',
                'credit_limit' => 50000.00,
                'balance' => 8000.00,
                'status' => 'active',
            ],
        ];

        foreach ($clients as $client) {
            Client::firstOrCreate(
                ['code' => $client['code']],
                $client
            );
        }
    }
}
