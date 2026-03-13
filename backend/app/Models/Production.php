<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Schema;

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
        'product_id',
        'process_id',
        'parent_production_id',
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
        'quality_status',
        'sale_id',
        'client_id',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'good_parts' => 'integer',
        'scrap_parts' => 'integer',
        'target_parts' => 'integer',
    ];

    /**
     * Relación con el proceso maestro
     */
    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    /**
     * Relación con el proceso padre (proceso anterior en la secuencia)
     */
    public function parentProcess()
    {
        return $this->belongsTo(Production::class, 'parent_production_id');
    }

    /**
     * Relación con los procesos hijos (procesos siguientes en la secuencia)
     */
    public function childProductions()
    {
        return $this->hasMany(Production::class, 'parent_production_id');
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
     * Relación con el producto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relación con la venta
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relación con el cliente
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
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
            
            // Inicializar fecha_inicio solo si la columna existe
            if (Schema::hasColumn('productions', 'start_time') && empty($production->start_time)) {
                $production->start_time = $production->start_time ?? now();
            }
        });
    }

    /**
     * Registrar producción y actualizar acumulados del proceso
     */
    public function registerInProcess(): bool
    {
        $production = $this->production;
        
        if (!$production) {
            return false;
        }

        // Usar good_parts
        $quantityProduced = $this->good_parts ?? 0;
        $quantityScrap = $this->scrap_parts ?? 0;

        // Registrar movimiento de trazabilidad
        ProductionMovement::recordProduction($production, $quantityProduced);
        
        if ($quantityScrap > 0) {
            ProductionMovement::recordScrap($production, $quantityScrap);
        }

        // Actualizar acumulados en la orden
        $workOrder = $process->workOrder;
        if ($workOrder) {
            $workOrder->addProduction($quantityProduced);
            if ($quantityScrap > 0) {
                $workOrder->addScrap($quantityScrap);
            }
        }

        return true;
    }

    /**
     * Completar la producción
     */
    public function complete(?int $goodParts = null, ?int $scrapParts = null): void
    {
        $this->good_parts = $goodParts ?? $this->good_parts ?? 0;
        $this->scrap_parts = $scrapParts ?? $this->scrap_parts ?? 0;
        $this->end_time = now();
        $this->status = 'completed';
        
        // Solo guardar campos adicionales si existen
        if (Schema::hasColumn('productions', 'quantity_produced')) {
            $this->quantity_produced = $this->good_parts;
        }
        if (Schema::hasColumn('productions', 'quantity_scrap')) {
            $this->quantity_scrap = $this->scrap_parts;
        }
        if (Schema::hasColumn('productions', 'end_time')) {
            $this->end_time = now();
        }
        
        $this->save();
    }

    /**
     * Pausar la producción
     */
    public function pause(string $reason = null): void
    {
        $this->status = 'paused';
        $this->pause_reason = $reason;
        $this->save();
    }

    /**
     * Reanudar la producción
     */
    public function resume(): void
    {
        $this->status = 'in_progress';
        $this->pause_reason = null;
        $this->save();
    }

    /**
     * Obtener la cantidad total (producida + scrap)
     */
    public function getTotalQuantity(): int
    {
        return ($this->good_parts ?? 0) + ($this->scrap_parts ?? 0);
    }

    /**
     * Obtener las piezas buenas (excluyendo scrap)
     */
    public function getGoodQuantity(): int
    {
        return $this->good_parts ?? 0;
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
        return $query->where('process_id', $processId);
    }
}
