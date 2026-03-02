<?php

namespace Database\Seeders;

use App\Models\BankAccount;
use Illuminate\Database\Seeder;

class BankAccountSeeder extends Seeder
{
    /**
     * Seed the bank_accounts table.
     */
    public function run(): void
    {
        $accounts = [
            [
                'bank' => 'BBVA',
                'name' => 'Cuenta Principal',
                'description' => 'Cuenta principal para operaciones',
                'account_number' => '0123456789',
                'clabe' => '012345678901234567',
                'type' => 'checking',
                'currency' => 'MXN',
                'balance' => 150000.00,
                'available_balance' => 150000.00,
                'status' => 'active',
            ],
            [
                'bank' => 'Santander',
                'name' => 'Cuenta de Ahorros',
                'description' => 'Cuenta de ahorro empresarial',
                'account_number' => '9876543210',
                'clabe' => '987654321098765432',
                'type' => 'savings',
                'currency' => 'MXN',
                'balance' => 50000.00,
                'available_balance' => 50000.00,
                'status' => 'active',
            ],
            [
                'bank' => 'Banorte',
                'name' => 'Cuenta de Clientes',
                'description' => 'Cuenta para pagos de clientes',
                'account_number' => '5678901234',
                'clabe' => '567890123456789012',
                'type' => 'checking',
                'currency' => 'MXN',
                'balance' => 75000.00,
                'available_balance' => 75000.00,
                'status' => 'active',
            ],
            [
                'bank' => 'Citibanamex',
                'name' => 'Cuenta Dólares',
                'description' => 'Cuenta en dólares para operaciones internacionales',
                'account_number' => '1234987654',
                'clabe' => '123498765432109876',
                'type' => 'checking',
                'currency' => 'USD',
                'balance' => 10000.00,
                'available_balance' => 10000.00,
                'status' => 'active',
            ],
            [
                'bank' => 'ScotiaBank',
                'name' => 'Cuenta de Gastos',
                'description' => 'Cuenta para gastos operativos',
                'account_number' => '4321098765',
                'clabe' => '432109876543210987',
                'type' => 'checking',
                'currency' => 'MXN',
                'balance' => 25000.00,
                'available_balance' => 25000.00,
                'status' => 'active',
            ],
        ];

        foreach ($accounts as $account) {
            BankAccount::create($account);
        }
    }
}
