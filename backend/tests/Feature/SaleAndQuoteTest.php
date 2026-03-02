<?php

namespace Tests\Feature;

use App\Models\Quote;
use App\Models\QuoteItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Client;
use App\Models\Product;
use App\Models\Discount;
use App\Models\DiscountType;
use App\Models\AccountStatement;
use App\Models\Movement;
use App\Models\BankAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pruebas para el sistema de Cotizaciones y Ventas.
 * 
 * Este test verifica el flujo completo desde cotización hasta venta,
 * incluyendo el manejo de pagos (contado vs crédito) y la generación
 * de cuentas por cobrar.
 * 
 * @author Villazco Team
 * @date 2026-03-01
 */
class SaleAndQuoteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Deshabilitar todos los middlewares para los tests
        $this->withoutMiddleware();
    }

    /**
     * Helper: Crea un cliente para testing.
     * 
     * @return Client
     */
    private function createClient(): Client
    {
        return Client::factory()->create([
            'name' => 'Cliente Test',
            'email' => 'test@cliente.com',
        ]);
    }

    /**
     * Helper: Crea un producto para testing.
     * 
     * @return Product
     */
    private function createProduct(): Product
    {
        return Product::factory()->create([
            'name' => 'Producto Test',
        ]);
    }

    /**
     * Helper: Crea una cuenta bancaria para testing.
     * 
     * @return BankAccount
     */
    private function createBankAccount(): BankAccount
    {
        return BankAccount::create([
            'name' => 'Banco Test',
            'account_number' => '1234567890',
            'account_type' => 'checking',
            'balance' => 10000.00,
            'status' => 'active',
        ]);
    }

    /**
     * Test: Verifica que se puede crear una cotización.
     * 
     * Este test verifica la creación básica de una cotización
     * con items y descuentos.
     */
    public function test_can_create_quote(): void
    {
        // Crear cliente y producto
        $client = $this->createClient();
        $product = $this->createProduct();

        // Crear cotización
        $response = $this->postJson('/api/quotes', [
            'client_id' => $client->id,
            'status' => 'pending',
            'valid_until' => now()->addDays(30)->toDateString(),
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_price' => 100.00,
                    'subtotal' => 1000.00,
                ]
            ]
        ]);

        // Verificar respuesta
        $response->assertStatus(201);
        
        // Verificar que se creó la cotización
        $this->assertDatabaseHas('quotes', [
            'client_id' => $client->id,
            'status' => 'pending',
        ]);
    }

    /**
     * Test: Verifica que se puede aprobar una cotización y crear venta pendiente.
     * 
     * Este test verifica el flujo: Cotización -> Aprobada -> Venta Pendiente
     */
    public function test_can_approve_quote_and_create_sale(): void
    {
        // Crear cotización
        $client = $this->createClient();
        $product = $this->createProduct();

        $quote = Quote::create([
            'client_id' => $client->id,
            'status' => 'pending',
            'valid_until' => now()->addDays(30),
            'subtotal' => 1000.00,
            'tax' => 160.00,
            'total' => 1160.00,
        ]);

        QuoteItem::create([
            'quote_id' => $quote->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 100.00,
            'subtotal' => 1000.00,
        ]);

        // Aprobar cotización
        $response = $this->putJson("/api/quotes/{$quote->id}", [
            'status' => 'approved',
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que la cotización está aprobada
        $quote->refresh();
        $this->assertEquals('approved', $quote->status);

        // Verificar que se creó una venta pendiente
        $this->assertDatabaseHas('sales', [
            'client_id' => $client->id,
            'status' => 'pending',
            'quote_id' => $quote->id,
        ]);
    }

    /**
     * Test: Verifica que se puede crear una venta directa sin cotización.
     * 
     * Este test verifica que se puede crear una venta directamente
     * sin passar por el proceso de cotización.
     */
    public function test_can_create_direct_sale(): void
    {
        // Crear cliente y producto
        $client = $this->createClient();
        $product = $this->createProduct();

        // Crear venta directa
        $response = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'cash',
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 5,
                    'unit_price' => 100.00,
                    'subtotal' => 500.00,
                ]
            ]
        ]);

        // Verificar respuesta
        $response->assertStatus(201);
        
        // Verificar que se creó la venta
        $this->assertDatabaseHas('sales', [
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'cash',
        ]);
    }

    /**
     * Test: Verifica que una venta de contado registra movimiento en finanzas.
     * 
     * Este test verifica el flujo de pago de contado:
     * Venta -> Completada -> Movimiento en finanzas
     */
    public function test_cash_sale_creates_finance_movement(): void
    {
        // Crear elementos necesarios
        $client = $this->createClient();
        $product = $this->createProduct();
        $bankAccount = $this->createBankAccount();

        // Crear venta de contado
        $sale = Sale::create([
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'cash',
            'subtotal' => 1000.00,
            'tax' => 160.00,
            'total' => 1160.00,
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 100.00,
            'subtotal' => 1000.00,
        ]);

        // Completar venta
        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'completed',
            'payment_type' => 'cash',
            'bank_account_id' => $bankAccount->id,
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que se creó un movimiento en finanzas
        $this->assertDatabaseHas('movements', [
            'type' => 'income',
            'amount' => 1160.00,
            'bank_account_id' => $bankAccount->id,
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
        ]);
    }

    /**
     * Test: Verifica que una venta a crédito crea cuenta por cobrar.
     * 
     * Este test verifica el flujo de crédito:
     * Venta -> Completada -> AccountStatement (cuenta por cobrar)
     */
    public function test_credit_sale_creates_account_statement(): void
    {
        // Crear elementos necesarios
        $client = $this->createClient();
        $product = $this->createProduct();

        // Crear venta a crédito
        $sale = Sale::create([
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'credit',
            'credit_days' => 30,
            'subtotal' => 1000.00,
            'tax' => 160.00,
            'total' => 1160.00,
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 100.00,
            'subtotal' => 1000.00,
        ]);

        // Completar venta
        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'completed',
            'payment_type' => 'credit',
            'credit_days' => 30,
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que se creó una cuenta por cobrar
        $this->assertDatabaseHas('account_statements', [
            'client_id' => $client->id,
            'type' => 'receivable',
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
            'amount' => 1160.00,
            'status' => 'pending',
        ]);
    }

    /**
     * Test: Verifica que se puede pagar una cuenta por cobrar.
     * 
     * Este test verifica el flujo de cobro:
     * Cuenta por cobrar -> Pago -> Movimiento en finanzas
     */
    public function test_can_pay_account_statement(): void
    {
        // Crear elementos necesarios
        $client = $this->createClient();
        $bankAccount = $this->createBankAccount();

        // Crear cuenta por cobrar
        $accountStatement = AccountStatement::create([
            'client_id' => $client->id,
            'type' => 'receivable',
            'reference_type' => 'sale',
            'reference_id' => 1,
            'amount' => 1000.00,
            'paid_amount' => 0,
            'status' => 'pending',
            'due_date' => now()->addDays(30),
        ]);

        // Registrar pago
        $response = $this->postJson('/api/account-statements/' . $accountStatement->id . '/pay', [
            'bank_account_id' => $bankAccount->id,
            'amount' => 1000.00,
            'payment_date' => now()->toDateString(),
            'notes' => 'Pago completo',
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que se creó el movimiento
        $this->assertDatabaseHas('movements', [
            'type' => 'income',
            'amount' => 1000.00,
            'bank_account_id' => $bankAccount->id,
        ]);

        // Verificar que la cuenta está pagada
        $accountStatement->refresh();
        $this->assertEquals('paid', $accountStatement->status);
    }

    /**
     * Test: Verifica que se puede aplicar descuento a una venta.
     * 
     * Este test verifica que los descuentos se aplican correctamente
     * y afectan el total de la venta.
     */
    public function test_can_apply_discount_to_sale(): void
    {
        // Crear tipo de descuento y descuento
        $discountType = DiscountType::create([
            'name' => 'Porcentaje',
            'type' => 'percentage',
        ]);

        $discount = Discount::create([
            'name' => 'Descuento 10%',
            'discount_type_id' => $discountType->id,
            'value' => 10,
            'status' => 'active',
        ]);

        // Crear venta con descuento
        $client = $this->createClient();
        $product = $this->createProduct();

        $response = $this->postJson('/api/sales', [
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'cash',
            'discount_id' => $discount->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_price' => 100.00,
                    'subtotal' => 1000.00,
                ]
            ]
        ]);

        // Verificar respuesta
        $response->assertStatus(201);

        // Verificar que el descuento se aplicó
        $sale = Sale::where('client_id', $client->id)->first();
        $this->assertEquals(100, $sale->discount_amount); // 10% de 1000
        $this->assertEquals(1060, $sale->total); // 1000 - 100 + 160
    }

    /**
     * Test: Verifica que se puede obtener el PDF de una venta.
     * 
     * Este test verifica que el endpoint genera correctamente
     * el PDF de la venta.
     */
    public function test_can_generate_sale_pdf(): void
    {
        // Crear venta
        $client = $this->createClient();
        $product = $this->createProduct();

        $sale = Sale::create([
            'client_id' => $client->id,
            'status' => 'completed',
            'payment_type' => 'cash',
            'subtotal' => 1000.00,
            'tax' => 160.00,
            'total' => 1160.00,
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 100.00,
            'subtotal' => 1000.00,
        ]);

        // Solicitar PDF
        $response = $this->getJson("/api/sales/{$sale->id}/pdf");

        // Verificar que responde con PDF
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /**
     * Test: Verifica que se puede listar las cuentas por cobrar de un cliente.
     * 
     * Este test verifica el endpoint que lista todas las cuentas
     * por cobrar activas de un cliente específico.
     */
    public function test_can_list_client_account_statements(): void
    {
        // Crear cliente
        $client = $this->createClient();

        // Crear cuentas por cobrar
        AccountStatement::create([
            'client_id' => $client->id,
            'type' => 'receivable',
            'reference_type' => 'sale',
            'reference_id' => 1,
            'amount' => 1000.00,
            'paid_amount' => 0,
            'status' => 'pending',
            'due_date' => now()->addDays(30),
        ]);

        AccountStatement::create([
            'client_id' => $client->id,
            'type' => 'receivable',
            'reference_type' => 'sale',
            'reference_id' => 2,
            'amount' => 500.00,
            'paid_amount' => 500.00,
            'status' => 'paid',
            'due_date' => now()->subDays(5),
        ]);

        // Obtener cuentas del cliente
        $response = $this->getJson("/api/account-statements?client_id={$client->id}");

        // Verificar respuesta
        $response->assertStatus(200);
        
        // Deben haber 2 cuentas
        $statements = $response->json();
        $this->assertCount(2, $statements);
    }

    /**
     * Test: Verifica que una venta cancelada no afecta finanzas.
     * 
     * Este test verifica que al cancelar una venta,
     * no se crean movimientos ni cuentas por cobrar.
     */
    public function test_cancelled_sale_does_not_create_finance_records(): void
    {
        // Crear venta
        $client = $this->createClient();
        $product = $this->createProduct();

        $sale = Sale::create([
            'client_id' => $client->id,
            'status' => 'pending',
            'payment_type' => 'cash',
            'subtotal' => 1000.00,
            'tax' => 160.00,
            'total' => 1160.00,
        ]);

        SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'unit_price' => 100.00,
            'subtotal' => 1000.00,
        ]);

        // Cancelar venta
        $response = $this->putJson("/api/sales/{$sale->id}", [
            'status' => 'cancelled',
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que NO se creó movimiento
        $this->assertDatabaseMissing('movements', [
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
        ]);

        // Verificar que NO se creó cuenta por cobrar
        $this->assertDatabaseMissing('account_statements', [
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
        ]);
    }
}
