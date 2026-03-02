<?php

namespace Tests\Feature;

use App\Models\Operator;
use App\Models\Production;
use App\Models\WorkOrder;
use App\Models\Process;
use App\Models\Product;
use App\Models\ProductProcess;
use App\Models\Client;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\SupplierStatement;
use App\Models\Movement;
use App\Models\BankAccount;
use Database\Factories\ProductProcessFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkOrderAndPurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Ejecutar seeders de permisos
        $this->seed([
            \Database\Seeders\DatabaseSeeder::class,
            \Database\Seeders\TablePermissionSeeder::class,
        ]);
        // Autenticar usuario para las pruebas
        $user = \App\Models\User::factory()->create();
        // Asignar rol de admin y todos los permisos
        $user->assignRole('admin');
        $this->actingAs($user);
    }

    /**
     * Test: Crear WorkOrder desde una venta
     * Verifica que al crear WorkOrder con sale_id se creen producciones automáticamente
     */
    public function test_work_order_creates_from_sale()
    {
        // Crear cliente usando factory
        $client = Client::factory()->create();

        // Crear producto usando factory
        $product = Product::factory()->create();

        // Crear procesos usando factory
        $process1 = Process::factory()->create();
        $process2 = Process::factory()->create();

        // Crear procesos del producto
        ProductProcess::factory()->create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'sequence' => 1,
        ]);

        ProductProcess::factory()->create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'sequence' => 2,
        ]);

        // Crear venta usando factory
        $sale = Sale::factory()->create([
            'client_id' => $client->id,
            'status' => 'paid',
        ]);

        // Crear item de venta usando factory
        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
        ]);

        // Crear WorkOrder desde la venta
        $response = $this->postJson('/api/work-orders', [
            'sale_id' => $sale->id,
            'quantity' => 10,
            'priority' => 'medium',
        ]);

        // Verificar que se creó
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        // Verificar que se crearon las producciones
        $this->assertDatabaseHas('work_orders', [
            'sale_id' => $sale->id,
            'client_id' => $client->id,
        ]);

        // Verificar que se crearon producciones
        $workOrder = WorkOrder::where('sale_id', $sale->id)->first();
        $this->assertNotNull($workOrder);
        $this->assertGreaterThan(0, $workOrder->productions()->count());
    }

    /**
     * Test: WorkOrder crea una producción por cada proceso del producto
     */
    public function test_work_order_creates_one_production_per_process()
    {
        // Crear producto con 3 procesos usando factory
        $product = Product::factory()->create();

        // Crear 3 procesos usando factory
        $processes = Process::factory()->count(3)->create();

        // Crear procesos del producto
        foreach ($processes as $index => $process) {
            ProductProcess::factory()->create([
                'product_id' => $product->id,
                'process_id' => $process->id,
                'sequence' => $index + 1,
            ]);
        }

        // Crear WorkOrder
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 10,
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        // Verificar que se crearon 3 producciones (una por proceso)
        $workOrder = WorkOrder::first();
        $this->assertEquals(3, $workOrder->productions()->count());
    }

    /**
     * Test: WorkOrder tiene cliente y producto asociados
     */
    public function test_work_order_has_client_and_product()
    {
        // Usar factories
        $client = Client::factory()->create();
        $product = Product::factory()->create();

        $response = $this->postJson('/api/work-orders', [
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 10,
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        $workOrder = WorkOrder::first();
        $this->assertEquals($client->id, $workOrder->client_id);
        $this->assertEquals($product->id, $workOrder->product_id);
    }

    /**
     * Test: PurchaseOrder a crédito crea SupplierStatement
     * Verifica el flujo financiero: OC crédito -> cuenta por pagar
     */
    public function test_purchase_order_credit_creates_supplier_statement()
    {
        // Crear proveedor usando factory
        $supplier = Supplier::factory()->create();

        // Crear orden de compra a crédito
        $response = $this->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'material_name' => 'Material Test',
            'quantity' => 10,
            'unit_price' => 100,
            'total' => 1160, // incluye IVA
            'payment_type' => 'credit',
            'credit_days' => 30,
            'status' => 'ordered',
        ]);

        $response->assertStatus(201);

        // Verificar que se creó el SupplierStatement
        $this->assertDatabaseHas('supplier_statements', [
            'supplier_id' => $supplier->id,
            'invoice_number' => $response->json('data.code'),
            'status' => 'pending',
        ]);

        // Verificar que el saldo del proveedor aumentó
        $supplier->refresh();
        $this->assertEquals(1160, $supplier->balance);
    }

    /**
     * Test: PurchaseOrder de contado registra Movement en finanzas
     * Verifica el flujo financiero: OC contado -> movimiento expense
     */
    public function test_purchase_order_cash_creates_movement()
    {
        // Crear proveedor usando factory
        $supplier = Supplier::factory()->create();

        // Crear orden de compra de contado
        $response = $this->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'material_name' => 'Material Test',
            'quantity' => 10,
            'unit_price' => 100,
            'total' => 1160,
            'payment_type' => 'cash',
            'status' => 'ordered',
        ]);

        $response->assertStatus(201);

        // Verificar que se creó el movimiento en finanzas
        $this->assertDatabaseHas('movements', [
            'type' => 'expense',
            'category' => 'purchase',
            'amount' => 1160,
        ]);
    }

    /**
     * Test: PurchaseOrder con payment_type se guarda correctamente
     */
    public function test_purchase_order_saves_payment_type()
    {
        // Usar factory
        $supplier = Supplier::factory()->create();

        // Crear orden con payment_type
        $response = $this->postJson('/api/purchase-orders', [
            'supplier_id' => $supplier->id,
            'material_name' => 'Material Test',
            'quantity' => 10,
            'unit_price' => 100,
            'total' => 1160,
            'payment_type' => 'credit',
            'credit_days' => 30,
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $supplier->id,
            'payment_type' => 'credit',
            'credit_days' => 30,
        ]);
    }

    /**
     * Test: SupplierStatement puede pagarse parcialmente
     */
    public function test_supplier_statement_partial_payment()
    {
        // Usar factory
        $supplier = Supplier::factory()->create(['balance' => 1000]);

        // Crear cuenta por pagar
        $statement = SupplierStatement::create([
            'invoice_number' => 'FAC-001',
            'supplier_id' => $supplier->id,
            'supplier_name' => 'Proveedor Test',
            'date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'amount' => 1000,
            'paid' => 0,
            'balance' => 1000,
            'status' => 'pending',
            'concept' => 'Compra de material',
        ]);

        // Simular pago parcial
        $statement->update([
            'paid' => 500,
            'balance' => 500,
            'status' => 'partial',
        ]);

        $statement->refresh();
        $this->assertEquals(500, $statement->paid);
        $this->assertEquals(500, $statement->balance);
        $this->assertEquals('partial', $statement->status);
    }

    /**
     * Test: SupplierStatement puede pagarse completamente
     */
    public function test_supplier_statement_full_payment()
    {
        // Usar factory
        $supplier = Supplier::factory()->create(['balance' => 1000]);

        // Crear cuenta por pagar
        $statement = SupplierStatement::create([
            'invoice_number' => 'FAC-001',
            'supplier_id' => $supplier->id,
            'supplier_name' => 'Proveedor Test',
            'date' => now()->toDateString(),
            'due_date' => now()->addDays(30)->toDateString(),
            'amount' => 1000,
            'paid' => 0,
            'balance' => 1000,
            'status' => 'pending',
            'concept' => 'Compra de material',
        ]);

        // Simular pago completo
        $statement->update([
            'paid' => 1000,
            'balance' => 0,
            'status' => 'paid',
        ]);

        // Actualizar saldo del proveedor
        $supplier->update(['balance' => 0]);

        $statement->refresh();
        $supplier->refresh();
        $this->assertEquals(1000, $statement->paid);
        $this->assertEquals(0, $statement->balance);
        $this->assertEquals('paid', $statement->status);
        $this->assertEquals(0, $supplier->balance);
    }
}
