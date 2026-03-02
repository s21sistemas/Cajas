<?php

namespace Tests\Feature;

use App\Models\WorkOrder;
use App\Models\Product;
use App\Models\Process;
use App\Models\ProcessType;
use App\Models\ProductProcess;
use App\Models\Production;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class WorkOrderProductionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Deshabilitar todos los middlewares para los tests
        $this->withoutMiddleware();
    }

    /**
     * Helper para crear un tipo de proceso.
     */
    private function createProcessType(string $name = 'Proceso de prueba'): ProcessType
    {
        return ProcessType::create([
            'name' => $name,
            'description' => 'Tipo de proceso para testing',
        ]);
    }

    /**
     * Test que verifica que al crear una orden de trabajo con product_id,
     * se crean automáticamente las producciones basadas en los procesos del producto.
     */
    public function test_work_order_creates_productions_automatically(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear un producto
        $product = Product::factory()->create([
            'name' => 'Caja de cartón corrugado',
        ]);

        // Crear procesos asociados al tipo de proceso
        $process1 = Process::create([
            'name' => 'Corrugado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process2 = Process::create([
            'name' => 'Impresión',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process3 = Process::create([
            'name' => 'Troquelado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        // Crear procesos del producto
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'name' => 'Corrugado - ' . $product->name,
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'name' => 'Impresión - ' . $product->name,
            'sequence' => 2,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process3->id,
            'name' => 'Troquelado - ' . $product->name,
            'sequence' => 3,
        ]);

        // Verificar que se crearon los procesos del producto
        $this->assertEquals(3, ProductProcess::count());
        
        // Verificar que los ProductProcess tienen el product_id correcto
        $productProcesses = ProductProcess::where('product_id', $product->id)->get();
        $this->assertEquals(3, $productProcesses->count(), 'ProductProcesses con product_id=' . $product->id . ' no encontrados');

        // Verificar que no hay producciones antes de crear la orden
        $this->assertEquals(0, Production::count());

        // Crear una orden de trabajo con el product_id
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 1000,
            'status' => 'draft',
            'priority' => 'medium',
        ]);

        // Imprimir la respuesta para debugging
        $responseData = $response->json();
        
        // Verificar que la respuesta es exitosa
        $response->assertStatus(201);

        // Verificar que se creó la orden de trabajo
        $this->assertEquals(1, WorkOrder::count());
        $workOrder = WorkOrder::first();

        // Imprimir información de debugging
        echo "\n=== DEBUG INFO ===\n";
        echo "Product ID: " . $product->id . "\n";
        echo "Work Order product_id: " . $workOrder->product_id . "\n";
        echo "ProductProcess count: " . ProductProcess::count() . "\n";
        echo "ProductProcess for product: " . ProductProcess::where('product_id', $product->id)->count() . "\n";
        echo "Production count: " . Production::count() . "\n";
        echo "===================\n";

        // Verificar las producciones automáticamente que se crearon
        $productionCount = Production::count();
        $this->assertEquals(3, $productionCount, "Expected 3 productions but found {$productionCount}. Response: " . json_encode($responseData));
    }

    /**
     * Test que verifica que al crear una orden sin product_id,
     * no se crean producciones automáticamente.
     */
    public function test_work_order_without_product_creates_no_productions(): void
    {
        // Verificar que no hay producciones antes
        $this->assertEquals(0, Production::count());

        // Crear una orden de trabajo sin product_id
        $response = $this->postJson('/api/work-orders', [
            'product_name' => 'Producto personalizado',
            'quantity' => 500,
            'status' => 'draft',
            'priority' => 'low',
        ]);

        // Verificar que la respuesta es exitosa
        $response->assertStatus(201);

        // Verificar que se creó la orden de trabajo
        $this->assertEquals(1, WorkOrder::count());

        // Verificar que NO se crearon producciones
        $this->assertEquals(0, Production::count());
    }

    /**
     * Test que verifica que la orden de trabajo retorna las producciones creadas.
     */
    public function test_work_order_response_includes_productions(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción test');

        // Crear un producto con un proceso
        $product = Product::factory()->create();
        $process = Process::create([
            'name' => 'Proceso de prueba',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process->id,
            'name' => 'Proceso - ' . $product->name,
            'sequence' => 1,
        ]);

        // Crear una orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 100,
        ]);

        $response->assertStatus(201);

        // Verificar que la respuesta incluye las producciones
        $responseData = $response->json();
        $this->assertArrayHasKey('productions', $responseData);
        $this->assertCount(1, $responseData['productions']);
    }

    /**
     * Test que verifica que parent_production_id se asigna correctamente según la secuencia.
     */
    public function test_work_order_creates_productions_with_correct_parent_ids(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear un producto
        $product = Product::factory()->create([
            'name' => 'Caja de cartón para test',
        ]);

        // Crear 3 procesos
        $process1 = Process::create([
            'name' => 'Corrugado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process2 = Process::create([
            'name' => 'Impresión',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process3 = Process::create([
            'name' => 'Troquelado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        // Crear procesos del producto con secuencia
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'name' => 'Corrugado',
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'name' => 'Impresión',
            'sequence' => 2,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process3->id,
            'name' => 'Troquelado',
            'sequence' => 3,
        ]);

        // Crear una orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 1000,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        // Obtener las producciones ordenadas por ID
        $productions = Production::orderBy('id')->get();

        $this->assertEquals(3, $productions->count());

        // Primera producción: no debe tener parent_production_id
        $this->assertNull($productions[0]->parent_production_id, 
            'La primera producción no debe tener parent_production_id');

        // Segunda producción: debe tener parent_production_id = id de la primera
        $this->assertEquals($productions[0]->id, $productions[1]->parent_production_id,
            'La segunda producción debe tener parent_production_id = primera producción');

        // Tercera producción: debe tener parent_production_id = id de la segunda
        $this->assertEquals($productions[1]->id, $productions[2]->parent_production_id,
            'La tercera producción debe tener parent_production_id = segunda producción');
    }

    /**
     * Test que verifica que no se puede iniciar una producción si la producción padre no está completada.
     */
    public function test_cannot_start_production_if_parent_not_completed(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear un producto
        $product = Product::factory()->create();

        // Crear 2 procesos
        $process1 = Process::create([
            'name' => 'Corrugado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process2 = Process::create([
            'name' => 'Impresión',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        // Crear procesos del producto
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'name' => 'Corrugado',
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'name' => 'Impresión',
            'sequence' => 2,
        ]);

        // Crear una orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 1000,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        // Obtener las producciones
        $productions = Production::orderBy('id')->get();
        $firstProduction = $productions[0];
        $secondProduction = $productions[1];

        // La primera producción debe tener parent_production_id = null
        $this->assertNull($firstProduction->parent_production_id);

        // La segunda producción debe tener parent_production_id = primera producción
        $this->assertEquals($firstProduction->id, $secondProduction->parent_production_id);

        // Intentar iniciar la segunda producción sin completar la primera
        $response = $this->putJson("/api/productions/{$secondProduction->id}", [
            'status' => 'in_progress',
        ]);

        // Debe fallar porque la producción padre no está completada
        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertStringContainsString('debe estar completada primero', 
            $response->json('message'));
    }

    /**
     * Test que verifica que no se puede iniciar una producción si la producción padre no está aprobada por calidad.
     */
    public function test_cannot_start_production_if_parent_not_approved_by_quality(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear un producto
        $product = Product::factory()->create();

        // Crear 2 procesos
        $process1 = Process::create([
            'name' => 'Corrugado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process2 = Process::create([
            'name' => 'Impresión',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        // Crear procesos del producto
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'name' => 'Corrugado',
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'name' => 'Impresión',
            'sequence' => 2,
        ]);

        // Crear una orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 1000,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        // Obtener las producciones
        $productions = Production::orderBy('id')->get();
        $firstProduction = $productions[0];
        $secondProduction = $productions[1];

        // Completar la primera producción
        $firstProduction->update([
            'status' => 'completed',
            'good_parts' => 1000,
            'scrap_parts' => 0,
            'quality_status' => 'PENDING', // No aprobada por calidad
        ]);

        // Intentar iniciar la segunda producción
        $response = $this->putJson("/api/productions/{$secondProduction->id}", [
            'status' => 'in_progress',
        ]);

        // Debe fallar porque la producción padre no está aprobada por calidad
        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
        ]);
        $this->assertStringContainsString('aprobada por calidad', 
            $response->json('message'));
    }

    /**
     * Test que verifica que se puede iniciar una producción cuando la producción padre está completada y aprobada por calidad.
     */
    public function test_can_start_production_when_parent_approved_by_quality(): void
    {
        // Crear un tipo de proceso
        $processType = $this->createProcessType('Producción');

        // Crear un producto
        $product = Product::factory()->create();

        // Crear 2 procesos
        $process1 = Process::create([
            'name' => 'Corrugado',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        $process2 = Process::create([
            'name' => 'Impresión',
            'code' => 'PROC-' . strtoupper(str()->random(4)),
            'process_type_id' => $processType->id,
            'requires_machine' => true,
            'status' => 'active',
        ]);

        // Crear procesos del producto
        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'name' => 'Corrugado',
            'sequence' => 1,
        ]);

        ProductProcess::create([
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'name' => 'Impresión',
            'sequence' => 2,
        ]);

        // Crear una orden de trabajo
        $response = $this->postJson('/api/work-orders', [
            'product_id' => $product->id,
            'quantity' => 1000,
            'status' => 'pending',
            'priority' => 'medium',
        ]);

        $response->assertStatus(201);

        // Obtener las producciones
        $productions = Production::orderBy('id')->get();
        $firstProduction = $productions[0];
        $secondProduction = $productions[1];

        // Completar la primera producción Y aprobada por calidad
        $firstProduction->update([
            'status' => 'completed',
            'good_parts' => 1000,
            'scrap_parts' => 0,
            'quality_status' => 'APPROVED',
        ]);

        // Intentar iniciar la segunda producción
        $response = $this->putJson("/api/productions/{$secondProduction->id}", [
            'status' => 'in_progress',
        ]);

        // Debe funcionar porque la producción padre está completada y aprobada
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }
}
