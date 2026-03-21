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
        $production = $this->production;
        
        if (!$production) {
            return ['success' => false, 'message' => 'Producción no encontrada'];
        }

        $workOrder = $production->workOrder;

        switch ($this->decision) {
            case self::DECISION_APPROVED:
                // Mantener quantities as approved, actualizar estado de calidad
                $production->update([
                    'quality_status' => 'APPROVED',
                ]);
                
                // Registrar movimiento de trazabilidad
                $this->createMovement('QUALITY_APPROVED', $this->quantity_approved);
                
                return [
                    'success' => true,
                    'message' => 'Proceso aprobado y siguiente proceso liberado',
                ];

            case self::DECISION_SCRAP:
                // Actualizar las partes buenas y scrap en la producción
                $newGoodParts = max(0, $production->good_parts - $this->quantity_scrap);
                $newScrapParts = $production->scrap_parts + $this->quantity_scrap;
                
                $production->update([
                    'status' => 'pending',
                    'quality_status' => 'SCRAP',
                    'good_parts' => $newGoodParts,
                    'scrap_parts' => $newScrapParts,
                ]);
                
                // Registrar movimiento de trazabilidad
                $this->createMovement('QUALITY_SCRAP', $this->quantity_scrap);
                
                return [
                    'success' => true,
                    'message' => 'Scrap registrado',
                ];

            case self::DECISION_REWORK:
                // Actualizar las partes para rework en la producción
                $production->update([
                    'quality_status' => 'REWORK',
                ]);
                
                // Buscar proceso anterior o proceso de reproceso
                // Por ahora, registramos el rework sin buscar proceso objetivo
                
                // Registrar movimiento de retorno
                $this->createMovement('QUALITY_REWORK', $this->quantity_rework);
                
                
                return [
                    'success' => true,
                    'message' => 'Reproceso registrado',
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
            'work_order_id' => $this->production?->work_order_id,
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
