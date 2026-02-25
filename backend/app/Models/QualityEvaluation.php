<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QualityEvaluation extends Model
{
    use HasFactory;

    // Decisiones de calidad
    const DECISION_APPROVED = 'APPROVED';
    const DECISION_SCRAP = 'SCRAP';
    const DECISION_REWORK = 'REWORK';

    protected $fillable = [
        'production_id',
        'work_order_process_id',
        'quantity_evaluated',
        'decision',
        'quantity_approved',
        'quantity_scrap',
        'quantity_rework',
        'observations',
        'evaluator_id',
        'evaluated_at',
    ];

    protected $casts = [
        'quantity_evaluated' => 'integer',
        'quantity_approved' => 'integer',
        'quantity_scrap' => 'integer',
        'quantity_rework' => 'integer',
        'evaluated_at' => 'datetime',
    ];

    /**
     * Relación con la producción
     */
    public function production()
    {
        return $this->belongsTo(Production::class);
    }

    /**
     * Relación con el proceso de la orden
     */
    public function workOrderProcess()
    {
        return $this->belongsTo(WorkOrderProcess::class);
    }

    /**
     * Relación con el evaluador
     */
    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Movimientos de trazabilidad asociados
     */
    public function movements()
    {
        return $this->hasMany(ProductionMovement::class, 'quality_evaluation_id');
    }

    /**
     * Aplicar la decisión de calidad al proceso
     * Actualiza los acumulados según la decisión
     */
    public function applyDecision(): array
    {
        $process = $this->workOrderProcess;
        
        if (!$process) {
            return ['success' => false, 'message' => 'Proceso no encontrado'];
        }

        $workOrder = $process->workOrder;

        switch ($this->decision) {
            case self::DECISION_APPROVED:
                // Mantener cantidades actuales, liberar siguiente proceso
                $process->update([
                    'mes_status' => WorkOrderProcess::STATUS_COMPLETED,
                    'completed_at' => now(),
                ]);
                
                // Liberar siguiente proceso
                $nextProcess = $process->releaseNextProcess();
                
                // Registrar movimiento de trazabilidad
                $this->createMovement('QUALITY_APPROVED', $this->quantity_approved);
                
                return [
                    'success' => true,
                    'message' => 'Proceso aprobado y siguiente proceso liberado',
                    'next_process_released' => $nextProcess ? true : false,
                ];

            case self::DECISION_SCRAP:
                // Descontar del available_quantity
                $process->decrement('available_quantity', $this->quantity_scrap);
                $process->increment('scrap_quantity', $this->quantity_scrap);
                
                // Acumular scrap en la orden
                if ($workOrder) {
                    $workOrder->increment('total_scrap', $this->quantity_scrap);
                }
                
                // Registrar movimiento de trazabilidad
                $this->createMovement('QUALITY_SCRAP', $this->quantity_scrap);
                
                return [
                    'success' => true,
                    'message' => 'Scrap registrado',
                ];

            case self::DECISION_REWORK:
                // Registrar rework y regresar al proceso anterior
                $process->increment('rework_quantity', $this->quantity_rework);
                
                // Buscar proceso anterior o proceso de reproceso
                $targetProcess = $this->findReworkTargetProcess($process);
                
                if ($targetProcess) {
                    // Agregar cantidad disponible al proceso objetivo
                    $targetProcess->available_quantity += $this->quantity_rework;
                    $targetProcess->save();
                    
                    // Registrar movimiento de retorno
                    $this->createMovement('QUALITY_REWORK', $this->quantity_rework, $process->id, $targetProcess->id);
                    
                    // Acumular rework en la orden
                    if ($workOrder) {
                        $workOrder->increment('total_rework', $this->quantity_rework);
                    }
                    
                    return [
                        'success' => true,
                        'message' => 'Reproceso registrado y enviado al proceso anterior',
                        'target_process_id' => $targetProcess->id,
                    ];
                }
                
                return [
                    'success' => false,
                    'message' => 'No se encontró proceso objetivo para reproceso',
                ];

            default:
                return ['success' => false, 'message' => 'Decisión de calidad inválida'];
        }
    }

    /**
     * Encontrar el proceso objetivo para reproceso
     */
    protected function findReworkTargetProcess(WorkOrderProcess $currentProcess): ?WorkOrderProcess
    {
        // 1. Buscar proceso definido como reproceso
        $reworkProcess = WorkOrderProcess::where('work_order_id', $currentProcess->work_order_id)
            ->where('is_rework_process', true)
            ->first();

        if ($reworkProcess) {
            return $reworkProcess;
        }

        // 2. Regresar al proceso anterior
        return $currentProcess->getPreviousInSequence();
    }

    /**
     * Crear movimiento de trazabilidad
     */
    protected function createMovement(
        string $type,
        int $quantity,
        ?int $sourceProcessId = null,
        ?int $destinationProcessId = null
    ): ProductionMovement {
        return ProductionMovement::create([
            'work_order_id' => $this->workOrderProcess->work_order_id,
            'work_order_process_id' => $this->work_order_process_id,
            'production_id' => $this->production_id,
            'quality_evaluation_id' => $this->id,
            'movement_type' => $type,
            'quantity' => $quantity,
            'source_process_id' => $sourceProcessId,
            'destination_process_id' => $destinationProcessId,
            'user_id' => $this->evaluator_id,
            'description' => "Evaluación de calidad: {$type} - {$quantity} unidades",
        ]);
    }

    /**
     * Scope para evaluaciones aprobadas
     */
    public function scopeApproved($query)
    {
        return $query->where('decision', self::DECISION_APPROVED);
    }

    /**
     * Scope para evaluaciones de scrap
     */
    public function scopeScrap($query)
    {
        return $query->where('decision', self::DECISION_SCRAP);
    }

    /**
     * Scope para evaluaciones de reproceso
     */
    public function scopeRework($query)
    {
        return $query->where('decision', self::DECISION_REWORK);
    }

    /**
     * Scope para evaluaciones pendientes
     */
    public function scopePending($query)
    {
        return $query->whereNull('decision');
    }
}
