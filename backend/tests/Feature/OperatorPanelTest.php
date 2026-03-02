<?php

namespace Tests\Feature;

use App\Models\Operator;
use App\Models\Production;
use App\Models\WorkOrder;
use App\Models\Process;
use App\Models\Product;
use App\Models\Client;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\SupplierStatement;
use App\Models\Movement;
use App\Models\BankAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperatorPanelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: El operador puede iniciar sesión con su código de empleado
     * Verifica que el endpoint /api/operators/login funcione correctamente
     */
    public function test_operator_can_login_with_employee_code()
    {
        // Crear un operador activo
        $operator = Operator::create([
            'employee_code' => 'EMP001',
            'name' => 'Juan Pérez',
            'shift' => 'Matutino',
            'specialty' => 'Ensamblaje',
            'active' => true,
        ]);

        // Llamar al endpoint de login sin autenticación
        $response = $this->postJson('/api/operators/login', [
            'employee_code' => 'EMP001',
        ]);

        // Verificar respuesta exitosa
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'token',
                'operator' => [
                    'id',
                    'name',
                    'employeeCode',
                    'shift',
                    'specialty',
                ],
            ]);
    }

    /**
     * Test: El login falla con código de empleado inválido
     */
    public function test_operator_login_fails_with_invalid_code()
    {
        // Crear un operador
        Operator::create([
            'employee_code' => 'EMP001',
            'name' => 'Juan Pérez',
            'active' => true,
        ]);

        // Llamar con código incorrecto sin autenticación
        $response = $this->postJson('/api/operators/login', [
            'employee_code' => 'INVALID',
        ]);

        // Verificar que falla
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test: El login falla con código de empleado inactivo
     */
    public function test_operator_login_fails_with_inactive_operator()
    {
        // Crear un operador inactivo
        Operator::create([
            'employee_code' => 'EMP001',
            'name' => 'Juan Pérez',
            'active' => false,
        ]);

        // Llamar con operador inactivo sin autenticación
        $response = $this->postJson('/api/operators/login', [
            'employee_code' => 'EMP001',
        ]);

        // Verificar que falla
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test: Se requieren código de empleado para el login
     */
    public function test_operator_login_requires_employee_code()
    {
        // Llamar sin código sin autenticación
        $response = $this->postJson('/api/operators/login', []);

        // Verificar que falla validación
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
            ]);
    }

    /**
     * Test: El operador puede ver sus producciones asignadas
     */
    public function test_operator_can_view_assigned_productions()
    {
        // Crear datos necesarios
        $operator = Operator::create([
            'employee_code' => 'EMP001',
            'name' => 'Juan Pérez',
            'active' => true,
        ]);

        $client = Client::create([
            'code' => 'C-001',
            'name' => 'Cliente Test',
            'email' => 'cliente@test.com',
            'status' => 'active',
        ]);

        $product = Product::create([
            'name' => 'Producto Test',
            'sku' => 'PROD001',
            'status' => 'active',
        ]);

        $process = Process::create([
            'name' => 'Proceso Test',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'code' => 'WO-00001',
            'client_id' => $client->id,
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        // Crear producción asignada al operador
        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'operator_id' => $operator->id,
            'target_parts' => 10,
            'status' => 'pending',
        ]);

        // Llamar al endpoint con query parameter
        $response = $this->getJson("/api/operators/my-productions?operator_id={$operator->id}");

        // Verificar respuesta
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);
    }

    /**
     * Test: La producción del operador muestra información relacionada
     */
    public function test_production_includes_related_information()
    {
        // Crear datos necesarios
        $operator = Operator::create([
            'employee_code' => 'EMP001',
            'name' => 'Juan Pérez',
            'active' => true,
        ]);

        $client = Client::create([
            'code' => 'C-001',
            'name' => 'Cliente Test',
            'email' => 'cliente@test.com',
            'status' => 'active',
        ]);

        $product = Product::create([
            'name' => 'Producto Test',
            'sku' => 'PROD001',
            'status' => 'active',
        ]);

        $process = Process::create([
            'name' => 'Proceso Test',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'code' => 'WO-00001',
            'client_id' => $client->id,
            'client_name' => 'Cliente Test',
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'pending',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'operator_id' => $operator->id,
            'target_parts' => 10,
            'status' => 'pending',
        ]);

        // Verificar que la producción tiene las relaciones
        $this->assertNotNull($production->process);
        $this->assertNotNull($production->product);
        $this->assertNotNull($production->workOrder);
    }
}
