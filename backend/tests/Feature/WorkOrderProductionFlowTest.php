<?php

namespace Tests\Feature;

use App\Models\WorkOrder;
use App\Models\Product;
use App\Models\Process;
use App\Models\ProcessType;
use App\Models\ProductProcess;
use App\Models\Production;
use App\Models\Operator;
use App\Models\Client;
use App\Models\Machine;
use App\Models\QualityEvaluation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pruebas para el flujo de Órdenes de Trabajo y Producción.
 * 
 * Este test verifica el flujo completo desde la creación de
 * una orden de trabajo hasta la finalización de la producción,
 * incluyendo el control de calidad y el tracking de máquinas.
 * 
 * @author Villazco Team
 * @date 2026-03-01
 */
class WorkOrderProductionFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Deshabilitar todos los middlewares para los tests
        $this->withoutMiddleware();
    }

    /**
     * Helper: Crea un tipo de proceso.
     * 
     * @param string $name
     * @return ProcessType
     */
    private function createProcessType(string $name = 'Proceso prueba'): ProcessType
    {
        return ProcessType::create([
            'name' => $name,
            'description' => 'Tipo de proceso para testing',
        ]);
    }

    /**
     * Helper: Crea un proceso.
     * 
     * @param ProcessType $processType
     * @param bool $requiresMachine
     * @return Process
     */
    private function createProcess(ProcessType $processType, bool $requiresMachine = true): Process
    {
        return Process::create([
            'name' => 'Proceso ' . str()->random(4),
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => $requiresMachine,
            'status' => 'active',
        ]);
    }

    /**
     * Test: Verifica que al crear una orden de trabajo, se crean las producciones automáticamente.
     * 
     * Este test verifica que cuando se crea una WorkOrder con un producto,
     * el sistema automáticamente crea las producciones basadas en los procesos
     * definidos en la receta del producto.
     */
    public function test_work_order_creates_productions_from_product_processes(): void
    {
        // Crear tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear producto
        $product = Product::create([
            'name' => 'Caja de cartón',
            'sku' => 'CAJA-' . str()->random(4),
            'status' => 'active',
        ]);

        // Crear procesos
        $process1 = $this->createProcess($processType);
        $process2 = $this->createProcess($processType);
        $process3 = $this->createProcess($processType);

        // Crear receta del producto (procesos asociados)
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'sequence' => 1,
            'estimated_time' => 60,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'sequence' => 2,
            'estimated_time' => 45,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process3->id,
            'sequence' => 3,
            'estimated_time' => 30,
        ]);

        // Crear cliente
        $client = Client::create([
            'name' => 'Cliente prueba',
            'email' => 'prueba@cliente.com',
            'status' => 'active',
        ]);

        // Crear orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'pending',
            'notes' => 'Orden de prueba',
        ]);

        // Verificar respuesta
        $response->assertStatus(201);

        // Obtener la orden creada
        $workOrder = WorkOrder::where('client_id', $client->id)->first();

        // Verificar que se crearon 3 producciones (una por cada proceso)
        $productions = Production::where('work_order_id', $workOrder->id)->get();
        $this->assertCount(3, $productions);

        // Verificar el orden de las producciones
        $this->assertEquals($process1->id, $productions[0]->process_id);
        $this->assertEquals($process2->id, $productions[1]->process_id);
        $this->assertEquals($process3->id, $productions[2]->process_id);

        // Verificar que la primera producción es la activa
        $this->assertEquals('pending', $productions[0]->status);
        $this->assertEquals(1, $productions[0]->sequence);
    }

    /**
     * Test: Verifica que no se puede iniciar una producción si la anterior no está aprobada.
     * 
     * Este test verifica el control de flujo: una producción no puede iniciar
     * si la producción anterior no ha pasado el control de calidad.
     */
    public function test_cannot_start_production_if_previous_not_approved(): void
    {
        // Crear elementos
        $processType = $this->createProcessType();
        $process1 = $this->createProcess($processType);
        $process2 = $this->createProcess($processType);

        $product = Product::create([
            'name' => 'Producto flujo',
            'sku' => 'PROD-FLUJO-' . str()->random(4),
            'status' => 'active',
        ]);

        // Crear receta
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'sequence' => 2,
        ]);

        $client = Client::create([
            'name' => 'Cliente flujo',
            'email' => 'flujo@cliente.com',
            'status' => 'active',
        ]);

        // Crear work order
        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        // Crear producciones
        $prod1 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process1->id,
            'target_quantity' => 100,
            'status' => 'completed',
            'quality_status' => 'pending', // Pendiente de calidad
            'sequence' => 1,
        ]);

        $prod2 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process2->id,
            'target_quantity' => 100,
            'status' => 'pending',
            'quality_status' => 'pending',
            'sequence' => 2,
        ]);

        // Intentar iniciar producción 2 (sin aprobar producción 1)
        $response = $this->putJson("/api/productions/{$prod2->id}", [
            'status' => 'in_progress',
        ]);

        // Debe retornar error (no puede iniciar sin aprobación anterior)
        $response->assertStatus(422);
    }

    /**
     * Test: Verifica que al aprobar calidad, la siguiente producción puede iniciar.
     * 
     * Este test verifica el flujo completo: producción 1 -> calidad -> 
     * aprobación -> producción 2 puede iniciar.
     */
    public function test_quality_approval_allows_next_production(): void
    {
        // Crear elementos
        $processType = $this->createProcessType();
        $process1 = $this->createProcess($processType);
        $process2 = $this->createProcess($processType);

        $product = Product::create([
            'name' => 'Producto aprobacion',
            'sku' => 'PROD-APROB-' . str()->random(4),
            'status' => 'active',
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'sequence' => 2,
        ]);

        $client = Client::create([
            'name' => 'Cliente aprobacion',
            'email' => 'aprob@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        // Crear producciones
        $prod1 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process1->id,
            'target_quantity' => 100,
            'good_parts' => 95,
            'scrap_parts' => 5,
            'status' => 'completed',
            'quality_status' => 'pending',
            'sequence' => 1,
        ]);

        $prod2 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process2->id,
            'target_quantity' => 95,
            'status' => 'pending',
            'quality_status' => 'pending',
            'sequence' => 2,
        ]);

        // Aprobar calidad de producción 1
        $this->postJson('/api/quality', [
            'production_id' => $prod1->id,
            'approved_parts' => 95,
            'rejected_parts' => 0,
            'observations' => 'Aprobado',
            'status' => 'approved',
        ]);

        // Ahora intentar iniciar producción 2
        $response = $this->putJson("/api/productions/{$prod2->id}", [
            'status' => 'in_progress',
        ]);

        // Debe permitir iniciar
        $response->assertStatus(200);
    }

    /**
     * Test: Verifica que una orden de trabajo se completa cuando todas las producciones terminan.
     * 
     * Este test verifica que cuando todas las producciones de una
     * orden de trabajo están completadas, la orden de trabajo
     * también se marca como completada.
     */
    public function test_work_order_completes_when_all_productions_complete(): void
    {
        // Crear elementos
        $processType = $this->createProcessType();
        $process = $this->createProcess($processType);

        $product = Product::create([
            'name' => 'Producto completado',
            'sku' => 'PROD-COMP-' . str()->random(4),
            'status' => 'active',
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process->id,
            'sequence' => 1,
        ]);

        $client = Client::create([
            'name' => 'Cliente completado',
            'email' => 'comp@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        // Crear producción y completarla
        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process->id,
            'target_quantity' => 100,
            'good_parts' => 100,
            'status' => 'completed',
            'quality_status' => 'approved',
            'sequence' => 1,
        ]);

        // Verificar que la orden de trabajo se completó
        $workOrder->refresh();
        $this->assertEquals('completed', $workOrder->status);
    }

    /**
     * Test: Verifica que se puede eliminar una producción y las siguientes se actualizan.
     * 
     * Este test verifica que al eliminar una producción en medio,
     * las siguientes producciones actualizan su secuencia.
     */
    public function test_can_delete_production_and_update_sequence(): void
    {
        // Crear elementos
        $processType = $this->createProcessType();
        $process1 = $this->createProcess($processType);
        $process2 = $this->createProcess($processType);
        $process3 = $this->createProcess($processType);

        $product = Product::create([
            'name' => 'Producto eliminacion',
            'sku' => 'PROD-ELIM-' . str()->random(4),
            'status' => 'active',
        ]);

        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process1->id, 'sequence' => 1]);
        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process2->id, 'sequence' => 2]);
        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process3->id, 'sequence' => 3]);

        $client = Client::create([
            'name' => 'Cliente eliminacion',
            'email' => 'elim@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        // Crear producciones
        $prod1 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process1->id,
            'target_quantity' => 100,
            'status' => 'completed',
            'quality_status' => 'approved',
            'sequence' => 1,
        ]);

        $prod2 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process2->id,
            'target_quantity' => 100,
            'status' => 'pending',
            'sequence' => 2,
        ]);

        $prod3 = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process3->id,
            'target_quantity' => 100,
            'status' => 'pending',
            'sequence' => 3,
        ]);

        // Eliminar producción 2
        $response = $this->deleteJson("/api/productions/{$prod2->id}");
        $response->assertStatus(200);

        // Verificar que producción 3 ahora es secuencia 2
        $prod3->refresh();
        $this->assertEquals(2, $prod3->sequence);
    }

    /**
     * Test: Verifica que el panel de operador muestra las producciones asignadas.
     * 
     * Este test verifica el endpoint que provee datos para el
     * panel del operador de producción.
     */
    public function test_operator_panel_shows_assigned_productions(): void
    {
        // Crear operador
        $operator = Operator::create([
            'name' => 'Operador prueba',
            'code' => 'OP-' . strtoupper(str()->random(4)),
            'status' => 'active',
        ]);

        // Crear elementos de producción
        $processType = $this->createProcessType();
        $process = $this->createProcess($processType);
        $product = Product::create([
            'name' => 'Producto operador',
            'sku' => 'PROD-OP-' . str()->random(4),
            'status' => 'active',
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process->id,
            'sequence' => 1,
        ]);

        $client = Client::create([
            'name' => 'Cliente operador',
            'email' => 'op@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        // Crear producción asignada al operador
        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process->id,
            'operator_id' => $operator->id,
            'target_quantity' => 100,
            'status' => 'pending',
            'sequence' => 1,
        ]);

        // Obtener producciones del operador
        $response = $this->getJson("/api/productions?operator_id={$operator->id}");

        // Verificar respuesta
        $response->assertStatus(200);
        
        $productions = $response->json();
        $this->assertNotEmpty($productions);
    }

    /**
     * Test: Verifica que se puede registrar partes buenas y scrap.
     * 
     * Este test verifica que el operador puede registrar la cantidad
     * de partes buenas y partes scrap al completar una producción.
     */
    public function test_can_register_good_and_scrap_parts(): void
    {
        // Crear elementos
        $processType = $this->createProcessType();
        $process = $this->createProcess($processType);
        $operator = Operator::create([
            'name' => 'Operador partes',
            'code' => 'OP-PARTES-' . str()->random(4),
            'status' => 'active',
        ]);
        $product = Product::create([
            'name' => 'Producto partes',
            'sku' => 'PROD-PARTES-' . str()->random(4),
            'status' => 'active',
        ]);

        $client = Client::create([
            'name' => 'Cliente partes',
            'email' => 'partes@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process->id,
            'operator_id' => $operator->id,
            'target_quantity' => 100,
            'status' => 'in_progress',
            'sequence' => 1,
        ]);

        // Registrar partes
        $response = $this->putJson("/api/productions/{$production->id}", [
            'status' => 'completed',
            'good_parts' => 92,
            'scrap_parts' => 8,
            'quality_status' => 'pending',
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que se registraron las partes
        $production->refresh();
        $this->assertEquals(92, $production->good_parts);
        $this->assertEquals(8, $production->scrap_parts);
        $this->assertEquals('completed', $production->status);
        $this->assertEquals('pending', $production->quality_status);
    }

    /**
     * Test: Verifica que una máquina puede asignarse a una producción.
     * 
     * Este test verifica que se puede asignar una máquina a una
     * producción y que esto afecta el estado de la máquina.
     */
    public function test_can_assign_machine_to_production(): void
    {
        // Crear máquina disponible
        $machine = Machine::create([
            'name' => 'Máquina asignación',
            'code' => 'MAQ-ASIG-' . str()->random(4),
            'type' => 'Tipo prueba',
            'status' => 'available',
            'location' => 'Planta 1',
        ]);

        // Crear elementos de producción
        $processType = $this->createProcessType();
        $process = $this->createProcess($processType, true);
        $product = Product::create([
            'name' => 'Producto máquina',
            'sku' => 'PROD-MAQ-' . str()->random(4),
            'status' => 'active',
        ]);

        $client = Client::create([
            'name' => 'Cliente máquina',
            'email' => 'maq@cliente.com',
            'status' => 'active',
        ]);

        $workOrder = WorkOrder::create([
            'client_id' => $client->id,
            'product_id' => $product->id,
            'quantity' => 100,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'process_id' => $process->id,
            'machine_id' => $machine->id,
            'target_quantity' => 100,
            'status' => 'pending',
            'sequence' => 1,
        ]);

        // Asignar y iniciar producción
        $response = $this->putJson("/api/productions/{$production->id}", [
            'status' => 'in_progress',
            'machine_id' => $machine->id,
        ]);

        // Verificar respuesta
        $response->assertStatus(200);

        // Verificar que la máquina cambió a "in_use"
        $machine->refresh();
        $this->assertEquals('in_use', $machine->status);
    }
}
