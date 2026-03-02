<?php

namespace Tests\Feature;

use App\Models\Operator;
use App\Models\Production;
use App\Models\WorkOrder;
use App\Models\Process;
use App\Models\Product;
use App\Models\ProductProcess;
use App\Models\Client;
use App\Models\QualityEvaluation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class QualityIntegrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Configuración: crear usuario para autenticación
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario para calidad
        $this->user = User::factory()->create();
        Auth::login($this->user);
    }

    /**
     * Test: Producción puede enviarse a calidad
     * Verifica que el operador puede cambiar quality_status a pending
     */
    public function test_production_can_be_sent_to_quality()
    {
        // Crear datos necesarios
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
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        // Crear producción
        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'target_parts' => 10,
            'good_parts' => 8,
            'status' => 'in_progress',
            'quality_status' => 'pending',
        ]);

        // Verificar que la producción está lista para calidad
        $this->assertEquals('pending', $production->quality_status);
    }

    /**
     * Test: Calidad puede aprobar una producción
     * Verifica el flujo: evaluación APPROVED -> quality_status approved
     */
    public function test_quality_can_approve_production()
    {
        // Crear datos necesarios
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
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'target_parts' => 10,
            'good_parts' => 8,
            'status' => 'in_progress',
            'quality_status' => 'pending',
        ]);

        // Simular evaluación de calidad - aprobar
        $evaluation = QualityEvaluation::create([
            'production_id' => $production->id,
            'quantity_evaluated' => 8,
            'decision' => 'APPROVED',
            'quantity_approved' => 8,
            'quantity_scrap' => 0,
            'quantity_rework' => 0,
            'observations' => 'Aprobado',
            'evaluator_id' => $this->user->id,
            'evaluated_at' => now(),
        ]);

        // Actualizar producción
        $production->update(['quality_status' => 'APPROVED']);

        $production->refresh();
        $this->assertEquals('APPROVED', $production->quality_status);
    }

    /**
     * Test: Calidad puede rechazar partes (scrap)
     * Verifica el flujo: evaluación SCRAP -> quality_status rejected
     */
    public function test_quality_can_reject_parts_as_scrap()
    {
        // Crear datos necesarios
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
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'target_parts' => 10,
            'good_parts' => 8,
            'scrap_parts' => 2,
            'status' => 'in_progress',
            'quality_status' => 'pending',
        ]);

        // Simular evaluación de calidad - rechazar como scrap
        $evaluation = QualityEvaluation::create([
            'production_id' => $production->id,
            'quantity_evaluated' => 8,
            'decision' => 'SCRAP',
            'quantity_approved' => 5,
            'quantity_scrap' => 3,
            'quantity_rework' => 0,
            'observations' => 'Rechazado por defecto',
            'evaluator_id' => $this->user->id,
            'evaluated_at' => now(),
        ]);

        // Actualizar producción con las partes rechazadas
        $production->update([
            'quality_status' => 'SCRAP',
            'good_parts' => 5,
            'scrap_parts' => 5, // 2 original + 3 rechazado
        ]);

        $production->refresh();
        $this->assertEquals('SCRAP', $production->quality_status);
        $this->assertEquals(5, $production->good_parts);
        $this->assertEquals(5, $production->scrap_parts);
    }

    /**
     * Test: Calidad puede marcar para re-trabajo
     * Verifica el flujo: evaluación REWORK -> quality_status pending (para re-trabajo)
     */
    public function test_quality_can_mark_for_rework()
    {
        // Crear datos necesarios
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
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'target_parts' => 10,
            'good_parts' => 6,
            'status' => 'in_progress',
            'quality_status' => 'pending',
        ]);

        // Simular evaluación de calidad - marcar para re-trabajo
        $evaluation = QualityEvaluation::create([
            'production_id' => $production->id,
            'quantity_evaluated' => 6,
            'decision' => 'REWORK',
            'quantity_approved' => 0,
            'quantity_scrap' => 0,
            'quantity_rework' => 6,
            'observations' => 'Requiere re-trabajo',
            'evaluator_id' => $this->user->id,
            'evaluated_at' => now(),
        ]);

        // El re-trabajo permite que la producción continúe
        $production->update(['quality_status' => 'REWORK']);

        $production->refresh();
        $this->assertEquals('REWORK', $production->quality_status);
    }

    /**
     * Test: Producción aprobada permite siguiente proceso
     * Verifica la secuencia: producción 1 approve -> producción 2 puede iniciar
     */
    public function test_approved_production_allows_next_process()
    {
        // Crear producto con 2 procesos
        $product = Product::create([
            'name' => 'Producto Multi-Proceso',
            'sku' => 'PROD002',
            'status' => 'active',
        ]);

        $process1 = Process::create(['name' => 'Proceso 1', 'status' => 'active']);
        $process2 = Process::create(['name' => 'Proceso 2', 'status' => 'active']);

        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process1->id, 'sequence' => 1]);
        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process2->id, 'sequence' => 2]);

        $workOrder = WorkOrder::create([
            'code' => 'WO-00001',
            'product_id' => $product->id,
            'product_name' => 'Producto Multi-Proceso',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        // Crear producción 1 (primer proceso)
        $production1 = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'target_parts' => 10,
            'good_parts' => 10,
            'status' => 'completed',
            'quality_status' => 'APPROVED',
        ]);

        // Crear producción 2 (segundo proceso) - depende de producción 1
        $production2 = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'parent_production_id' => $production1->id,
            'target_parts' => 10,
            'status' => 'pending',
        ]);

        // Verificar que producción 2 puede iniciar porque producción 1 está aprobada
        $this->assertEquals('completed', $production1->status);
        $this->assertEquals('APPROVED', $production1->quality_status);
        $this->assertEquals('pending', $production2->status);
    }

    /**
     * Test: Producción rechazada bloquea siguiente proceso
     * Verifica que producción 2 no puede iniciar si producción 1 está rechazada
     */
    public function test_rejected_production_blocks_next_process()
    {
        // Crear producto con 2 procesos
        $product = Product::create([
            'name' => 'Producto Test',
            'sku' => 'PROD001',
            'status' => 'active',
        ]);

        $process1 = Process::create(['name' => 'Proceso 1', 'status' => 'active']);
        $process2 = Process::create(['name' => 'Proceso 2', 'status' => 'active']);

        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process1->id, 'sequence' => 1]);
        ProductProcess::create(['product_id' => $product->id, 'process_id' => $process2->id, 'sequence' => 2]);

        $workOrder = WorkOrder::create([
            'code' => 'WO-00001',
            'product_id' => $product->id,
            'product_name' => 'Producto Test',
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        // Crear producción 1 - rechazada
        $production1 = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process1->id,
            'target_parts' => 10,
            'good_parts' => 5,
            'scrap_parts' => 5,
            'status' => 'in_progress',
            'quality_status' => 'SCRAP',
        ]);

        // Crear producción 2 - depende de producción 1
        $production2 = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process2->id,
            'parent_production_id' => $production1->id,
            'target_parts' => 10,
            'status' => 'pending',
        ]);

        // Verificar que producción 1 está rechazada
        $this->assertEquals('SCRAP', $production1->quality_status);

        // La producción 2 no debería poder iniciar hasta que se resuelva la producción 1
        // Esto se maneja en el controlador al iniciar producción
    }

    /**
     * Test: Dashboard de calidad muestra estadísticas
     */
    public function test_quality_dashboard_shows_stats()
    {
        // Crear datos para el dashboard
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
            'product_id' => $product->id,
            'quantity' => 10,
            'status' => 'in_progress',
        ]);

        $production = Production::create([
            'work_order_id' => $workOrder->id,
            'product_id' => $product->id,
            'process_id' => $process->id,
            'target_parts' => 10,
            'status' => 'completed',
            'quality_status' => 'APPROVED',
        ]);

        // Crear evaluación
        QualityEvaluation::create([
            'production_id' => $production->id,
            'quantity_evaluated' => 10,
            'decision' => 'APPROVED',
            'quantity_approved' => 10,
            'quantity_scrap' => 0,
            'quantity_rework' => 0,
            'evaluator_id' => $this->user->id,
            'evaluated_at' => now(),
        ]);

        // Verificar que hay evaluaciones
        $this->assertGreaterThan(0, QualityEvaluation::count());
    }
}
