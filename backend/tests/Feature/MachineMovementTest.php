<?php

namespace Tests\Feature;

use App\Models\Machine;
use App\Models\MachineMovement;
use App\Models\Production;
use App\Models\Operator;
use App\Models\Product;
use App\Models\Process;
use App\Models\ProcessType;
use App\Models\WorkOrder;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pruebas para el sistema de Machine Movements.
 * 
 * Este test verifica la funcionalidad de tracking de uso de máquinas
 * que permite calcular la utilización real de cada máquina en el sistema.
 * 
 * @author Villazco Team
 * @date 2026-03-01
 */
class MachineMovementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Deshabilitar todos los middlewares para los tests
        $this->withoutMiddleware();
    }

    /**
     * Helper: Crea una máquina para testing.
     * 
     * @param string $name Nombre de la máquina
     * @return Machine
     */
    private function createMachine(string $name = 'Máquina de prueba'): Machine
    {
        return Machine::create([
            'name' => $name,
            'code' => 'MAQ-' . strtoupper(str()->random(4)),
            'type' => 'Impresora',
            'brand' => 'Marca prueba',
            'model' => 'Modelo prueba',
            'location' => 'Planta 1',
            'status' => 'available',
        ]);
    }

    /**
     * Helper: Crea un operador para testing.
     * 
     * @param string $name Nombre del operador
     * @return Operator
     */
    private function createOperator(string $name = 'Operador prueba'): Operator
    {
        return Operator::create([
            'name' => $name,
            'employee_code' => 'EMP-' . strtoupper(str()->random(4)),
            'active' => true,
        ]);
    }

    /**
     * Test: Verifica que se puede crear un movimiento de máquina.
     * 
     * Este test crea una máquina y verifica que se puede registrar
     * un movimiento de uso (inicio de operación).
     */
    public function test_can_create_machine_movement(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Impresora Heidelberg');

        // Crear movimiento de inicio
        $response = $this->postJson('/api/machine-movements', [
            'machine_id' => $machine->id,
            'start_time' => now()->toISOString(),
            'status' => 'active',
        ]);

        // Verificar que la respuesta es exitosa
        $response->assertStatus(201);
        
        // Verificar que el movimiento se creó en la base de datos
        $this->assertDatabaseHas('machine_movements', [
            'machine_id' => $machine->id,
            'status' => 'active',
        ]);
    }

    /**
     * Test: Verifica que se puede iniciar el uso de máquina.
     * 
     * Este test usa el endpoint especial /start que facilita
     * el inicio del tracking de una máquina.
     */
    public function test_can_start_machine_usage(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Cortadora Industrial');

        // Solicitar inicio de uso
        $response = $this->postJson('/api/machine-movements/start', [
            'machine_id' => $machine->id,
        ]);

        // Verificar respuesta exitosa
        $response->assertStatus(201);
        
        // Verificar estructura de respuesta
        $response->assertJsonStructure([
            'id',
            'machine_id',
            'start_time',
            'status',
        ]);
    }

    /**
     * Test: Verifica que se puede detener el uso de máquina.
     * 
     * Este test crea un movimiento activo y luego lo detiene,
     * verificando que se registra la hora de fin.
     */
    public function test_can_stop_machine_usage(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Troqueladora');

        // Iniciar uso
        $startResponse = $this->postJson('/api/machine-movements/start', [
            'machine_id' => $machine->id,
        ]);
        
        $movementId = $startResponse->json('id');

        // Detener uso
        $stopResponse = $this->postJson("/api/machine-movements/{$movementId}/stop", []);

        // Verificar respuesta exitosa
        $stopResponse->assertStatus(200);
        
        // Verificar que el movimiento tiene hora de fin
        $this->assertDatabaseHas('machine_movements', [
            'id' => $movementId,
            'status' => 'completed',
        ]);
        
        // Verificar que tiene end_time
        $movement = MachineMovement::find($movementId);
        $this->assertNotNull($movement->end_time);
    }

    /**
     * Test: Verifica que se puede obtener la lista de movimientos.
     * 
     * Este test verifica que el endpoint index devuelve
     * todos los movimientos de máquina registrados.
     */
    public function test_can_list_machine_movements(): void
    {
        // Crear máquinas y movimientos
        $machine1 = $this->createMachine('Máquina 1');
        $machine2 = $this->createMachine('Máquina 2');

        MachineMovement::create([
            'machine_id' => $machine1->id,
            'start_time' => now()->subHours(2),
            'status' => 'completed',
        ]);

        MachineMovement::create([
            'machine_id' => $machine2->id,
            'start_time' => now()->subHour(),
            'status' => 'in_progress',
        ]);

        // Obtener lista
        $response = $this->getJson('/api/machine-movements');

        // Verificar respuesta
        $response->assertStatus(200);
        
        // Verificar que hay 2 movimientos
        $response->assertJsonCount(2);
    }

    /**
     * Test: Verifica que se puede calcular la utilización de máquina.
     * 
     * Este test verifica el endpoint de utilización que calcula
     * el porcentaje de tiempo activo de una máquina.
     */
    public function test_can_get_machine_utilization(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Máquina de utilization');

        // Crear movimiento activo de 2 horas
        $movement = MachineMovement::create([
            'machine_id' => $machine->id,
            'start_time' => now()->subHours(2),
            'end_time' => now(),
            'status' => 'completed',
        ]);

        // Obtener utilización
        $response = $this->getJson("/api/machine-movements/utilization/{$machine->id}");

        // Verificar respuesta
        $response->assertStatus(200);
        
        // Verificar estructura de respuesta
        $response->assertJsonStructure([
            'machine_id',
            'total_minutes',
            'utilization_percentage',
        ]);
    }

    /**
     * Test: Verifica que al completar producción, se cierra el movimiento de máquina.
     * 
     * Este test verifica la integración entre Production y MachineMovement,
     * cuando una producción pasa a completed debe cerrar el movement.
     */
    public function test_production_completion_closes_machine_movement(): void
    {
        // Crear elementos necesarios
        $machine = $this->createMachine('Máquina producción');
        $operator = $this->createOperator('Operador producción');
        $processType = ProcessType::create([
            'name' => 'Proceso producción',
            'description' => 'Proceso para test',
        ]);
        $process = Process::create([
            'name' => 'Proceso test',
            'code' => 'PROC-TEST',
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);
        $product = Product::create([
            'name' => 'Producto test',
            'sku' => 'PROD-TEST-' . str()->random(4),
            'status' => 'active',
        ]);

        // Crear work order con producción
        $client = Client::create([
            'name' => 'Cliente test',
            'email' => 'test@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
            'notes' => 'Work order para test de machine movement',
        ]);

        // Crear producción
        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process->id,
            'machine_id' => $machine->id,
            'operator_id' => $operator->id,
            'target_quantity' => 100,
            'good_parts' => 0,
            'status' => 'pending',
            'quality_status' => 'pending',
        ]);

        // Iniciar producción (esto debe crear un machine movement)
        $this->putJson("/api/productions/{$production->id}", [
            'status' => 'in_progress',
        ]);

        // Verificar que se creó el movement
        $this->assertDatabaseHas('machine_movements', [
            'machine_id' => $machine->id,
            'production_id' => $production->id,
            'status' => 'in_progress',
        ]);

        // Completar producción
        $this->putJson("/api/productions/{$production->id}", [
            'status' => 'completed',
            'good_parts' => 95,
            'scrap_parts' => 5,
        ]);

        // Verificar que el movement se cerró
        $this->assertDatabaseHas('machine_movements', [
            'machine_id' => $machine->id,
            'production_id' => $production->id,
            'status' => 'completed',
        ]);

        // Verificar que la máquina volvió a estar disponible
        $machine->refresh();
        $this->assertEquals('available', $machine->status);
    }

    /**
     * Test: Verifica el reporte de máquinas con machine_movements.
     * 
     * Este test verifica que el ReportController calcula correctamente
     * la utilización usando los movimientos reales.
     */
    public function test_report_calculates_utilization_from_movements(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Máquina reporte');

        // Crear movimientos que sumen 4 horas en las últimas 24 horas
        MachineMovement::create([
            'machine_id' => $machine->id,
            'start_time' => now()->subHours(6),
            'end_time' => now()->subHours(4), // 2 horas
            'status' => 'completed',
        ]);

        MachineMovement::create([
            'machine_id' => $machine->id,
            'start_time' => now()->subHours(3),
            'end_time' => now()->subHour(), // 2 horas
            'status' => 'completed',
        ]);

        // Solicitar reporte de máquinas
        $response = $this->getJson('/api/reports/machines?start_date=' . now()->subDay()->toDateString() . '&end_date=' . now()->toDateString());

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que la máquina tiene utilization calculada
        $machines = $response->json();
        $this->assertNotEmpty($machines);
        
        // La máquina debe tener calculated utilization
        $machineData = collect($machines)->firstWhere('id', $machine->id);
        $this->assertNotNull($machineData);
        $this->assertArrayHasKey('utilization', $machineData);
        $this->assertArrayHasKey('total_hours', $machineData);
    }

    /**
     * Test: Verifica que se puede eliminar un movimiento de máquina.
     * 
     * Este test verifica la eliminación lógica de un movement.
     */
    public function test_can_delete_machine_movement(): void
    {
        // Crear máquina y movimiento
        $machine = $this->createMachine('Máquina eliminar');
        $movement = MachineMovement::create([
            'machine_id' => $machine->id,
            'start_time' => now(),
            'status' => 'in_progress',
        ]);

        // Eliminar movimiento
        $response = $this->deleteJson("/api/machine-movements/{$movement->id}");

        // Verificar respuesta
        $response->assertStatus(200);
    }

    /**
     * Test: Verifica que una máquina no puede tener dos movimientos activos.
     * 
     * Este test previene que una máquina se use en dos lugares al mismo tiempo.
     */
    public function test_machine_cannot_have_two_active_movements(): void
    {
        // Crear máquina
        $machine = $this->createMachine('Máquina concurrente');

        // Crear primer movimiento activo
        MachineMovement::create([
            'machine_id' => $machine->id,
            'start_time' => now()->subHour(),
            'status' => 'in_progress',
        ]);

        // Intentar crear segundo movimiento activo
        $response = $this->postJson('/api/machine-movements/start', [
            'machine_id' => $machine->id,
        ]);

        // Debe retornar error (409 - Conflicto)
        $response->assertStatus(409);
    }
}
