<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Production extends Model
{
    use HasFactory;

    // Estados de calidad
    const QUALITY_STATUS_PENDING = 'PENDING';
    const QUALITY_STATUS_APPROVED = 'APPROVED';
    const QUALITY_STATUS_SCRAP = 'SCRAP';
    const QUALITY_STATUS_REWORK = 'REWORK';

    protected $fillable = [
        'code',
        'work_order_id',
        'product_process_id',
        'process_id',
        'machine_id',
        'operator_id',
        'start_time',
        'end_time',
        'good_parts',
        'scrap_parts',
        'notes',
        'target_parts',
        'status',
        'pause_reason',
        // Campos MES adicionales
        'quantity_produced',
        'quantity_scrap',
        'rework_quantity',
        'quality_status',
        'fecha_inicio',
        'fecha_fin',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'good_parts' => 'integer',
        'scrap_parts' => 'integer',
        'target_parts' => 'integer',
        // Campos MES
        'quantity_produced' => 'integer',
        'quantity_scrap' => 'integer',
        'rework_quantity' => 'integer',
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
    ];

    /**
     * Relación con el proceso maestro
     */
    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    /**
     * Relación con la máquina
     */
    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }

    /**
     * Relación con el operador
     */
    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }

    /**
     * Relación con WorkOrder (Órden de Trabajo)
     */
    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Relación con WorkOrderProcess
     */
    public function workOrderProcess()
    {
        return $this->belongsTo(WorkOrderProcess::class, 'work_order_process_id');
    }

    /**
     * Relación con ProductProcess (receta del producto)
     */
    public function productProcess()
    {
        return $this->belongsTo(ProductProcess::class, 'product_process_id');
    }

    /**
     * Evaluaciones de calidad asociadas
     */
    public function qualityEvaluations()
    {
        return $this->hasMany(QualityEvaluation::class);
    }

    /**
     * Movimientos de trazabilidad
     */
    public function movements()
    {
        return $this->hasMany(ProductionMovement::class);
    }

    /**
     * Boot method para inicialización
     */
    protected static function boot()
    {
        parent::boot();

        // Generar código automático si no existe
        static::creating(function ($production) {
            if (empty($production->code)) {
                $production->code = 'PRD-' . date('Ymd') . '-' . str_pad(static::count() + 1, 6, '0', STR_PAD_LEFT);
            }
            
            // Inicializar fechas si no existen
            if (empty($production->fecha_inicio)) {
                $production->fecha_inicio = $production->start_time ?? now();
            }
        });
    }

    /**
     * Registrar producción y actualizar acumulados del proceso
     */
    public function registerInProcess(): bool
    {
        $process = $this->workOrderProcess;
        
        if (!$process) {
            return false;
        }

        // Usar quantity_produced o good_parts
        $quantityProduced = $this->quantity_produced ?? $this->good_parts ?? 0;
        $quantityScrap = $this->quantity_scrap ?? $this->scrap_parts ?? 0;

        // Registrar en el proceso
        $process->registerProduction($quantityProduced, $quantityScrap);

        // Registrar movimiento de trazabilidad
        ProductionMovement::recordProduction($process, $quantityProduced, $this);
        
        if ($quantityScrap > 0) {
            ProductionMovement::recordScrap($process, $quantityScrap, $this);
        }

        // Actualizar acumulados en la orden
        $workOrder = $process->workOrder;
        if ($workOrder) {
            $workOrder->addProduction($quantityProduced);
            if ($quantityScrap > 0) {
                $workOrder->addScrap($quantityScrap);
            }
        }

        // Sincronizar con modelo legacy
        $this->good_parts = $quantityProduced;
        $this->scrap_parts = $quantityScrap;
        $this->save();

        return true;
    }

    /**
     * Completar la producción
     */
    public function complete(?int $goodParts = null, ?int $scrapParts = null): void
    {
        $this->good_parts = $goodParts ?? $this->good_parts ?? 0;
        $this->scrap_parts = $scrapParts ?? $this->scrap_parts ?? 0;
        $this->quantity_produced = $this->good_parts;
        $this->quantity_scrap = $this->scrap_parts;
        $this->end_time = now();
        $this->fecha_fin = now();
        $this->status = 'completed';
        
        $this->save();
        
        // Registrar en el proceso
        $this->registerInProcess();
    }

    /**
     * Pausar la producción
     */
    public function pause(string $reason = null): void
    {
        $this->status = 'paused';
        $this->pause_reason = $reason;
        $this->save();
        
        // Pausar el proceso
        $process = $this->workOrderProcess;
        if ($process) {
            $process->pause($reason);
        }
    }

    /**
     * Reanudar la producción
     */
    public function resume(): void
    {
        $this->status = 'in_progress';
        $this->pause_reason = null;
        $this->save();
        
        // Reanudar el proceso
        $process = $this->workOrderProcess;
        if ($process) {
            $process->start();
        }
    }

    /**
     * Obtener la cantidad total (producida + scrap)
     */
    public function getTotalQuantity(): int
    {
        return ($this->quantity_produced ?? $this->good_parts ?? 0) + 
               ($this->quantity_scrap ?? $this->scrap_parts ?? 0);
    }

    /**
     * Obtener las piezas buenas (excluyendo scrap)
     */
    public function getGoodQuantity(): int
    {
        return $this->quantity_produced ?? $this->good_parts ?? 0;
    }

    /**
     * Obtener la última evaluación de calidad
     */
    public function getLatestQualityEvaluation(): ?QualityEvaluation
    {
        return $this->qualityEvaluations()->latest()->first();
    }

    /**
     * Verificar si la producción tiene evaluación de calidad
     */
    public function hasQualityEvaluation(): bool
    {
        return $this->qualityEvaluations()->count() > 0;
    }

    /**
     * Verificar si la producción está aprobada por calidad
     */
    public function isApprovedByQuality(): bool
    {
        return $this->quality_status === self::QUALITY_STATUS_APPROVED;
    }

    /**
     * Scope para producciones pendientes de calidad
     */
    public function scopePendingQuality($query)
    {
        return $query->where('quality_status', self::QUALITY_STATUS_PENDING)
            ->orWhereNull('quality_status');
    }

    /**
     * Scope para producciones completadas
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope para producciones de una orden específica
     */
    public function scopeForWorkOrder($query, int $workOrderId)
    {
        return $query->where('work_order_id', $workOrderId);
    }

    /**
     * Scope para producciones de un proceso específico
     */
    public function scopeForProcess($query, int $processId)
    {
        return $query->where('work_order_process_id', $processId);
    }
}
