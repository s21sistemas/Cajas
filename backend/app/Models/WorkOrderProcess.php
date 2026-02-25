<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkOrderProcess extends Model
{
    use HasFactory;

    // Estados del proceso según flujo MES
    const STATUS_PENDING = 'PENDING';
    const STATUS_READY = 'READY';
    const STATUS_RUNNING = 'RUNNING';
    const STATUS_PAUSED = 'PAUSED';
    const STATUS_COMPLETED = 'COMPLETED';

    protected $fillable = [
        'work_order_id',
        'process_id',
        'machine_id',
        'employee_id',
        'status',
        'mes_status',
        'quantity_done',
        'started_at',
        'finished_at',
        // Campos MES
        'completed_quantity',
        'scrap_quantity',
        'available_quantity',
        'rework_quantity',
        'planned_quantity',
        'previous_process_id',
        'is_rework_process',
        'ready_at',
        'completed_at',
        'paused_at',
        'notes',
    ];

    protected $casts = [
        'quantity_done' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        // Campos MES
        'completed_quantity' => 'integer',
        'scrap_quantity' => 'integer',
        'available_quantity' => 'integer',
        'rework_quantity' => 'integer',
        'planned_quantity' => 'integer',
        'is_rework_process' => 'boolean',
        'ready_at' => 'datetime',
        'completed_at' => 'datetime',
        'paused_at' => 'datetime',
    ];

    /**
     * Relación con la orden de trabajo
     */
    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

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
     * Relación con el empleado
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Proceso anterior en la secuencia (para reprocesos)
     */
    public function previousProcess()
    {
        return $this->belongsTo(WorkOrderProcess::class, 'previous_process_id');
    }

    /**
     * Siguiente proceso en la secuencia
     */
    public function nextProcess()
    {
        return $this->hasOne(WorkOrderProcess::class, 'previous_process_id', 'id');
    }

    /**
     * Producciones asociadas a este proceso
     */
    public function productions()
    {
        return $this->hasMany(Production::class, 'work_order_process_id');
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
     * Verifica si el proceso está disponible para iniciar
     */
    public function isReadyToStart(): bool
    {
        return $this->mes_status === self::STATUS_READY && $this->available_quantity > 0;
    }

    /**
     * Iniciar el proceso
     */
    public function start(int $operatorId = null): bool
    {
        if (!in_array($this->mes_status, [self::STATUS_READY, self::STATUS_PAUSED])) {
            return false;
        }

        $this->update([
            'mes_status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);

        return true;
    }

    /**
     * Pausar el proceso
     */
    public function pause(string $reason = null): bool
    {
        if ($this->mes_status !== self::STATUS_RUNNING) {
            return false;
        }

        $this->update([
            'mes_status' => self::STATUS_PAUSED,
            'paused_at' => now(),
            'notes' => $reason ? ($this->notes . "\nPausa: " . $reason) : $this->notes,
        ]);

        return true;
    }

    /**
     * Completar el proceso y liberar el siguiente
     */
    public function complete(): bool
    {
        if ($this->mes_status !== self::STATUS_RUNNING) {
            return false;
        }

        $this->update([
            'mes_status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'finished_at' => now(),
        ]);

        // Liberar siguiente proceso en la secuencia
        $this->releaseNextProcess();

        return true;
    }

    /**
     * Liberar el siguiente proceso en la secuencia
     */
    public function releaseNextProcess(): ?self
    {
        // Buscar el siguiente proceso por sequence/order_index
        $nextProcess = WorkOrderProcess::where('work_order_id', $this->work_order_id)
            ->where('id', '>', $this->id)
            ->orderBy('id')
            ->first();

        if ($nextProcess && $nextProcess->mes_status === self::STATUS_PENDING) {
            // Calcular cantidad disponible para el siguiente proceso
            $available = $this->completed_quantity - $this->scrap_quantity;
            
            $nextProcess->update([
                'mes_status' => self::STATUS_READY,
                'ready_at' => now(),
                'available_quantity' => $available,
            ]);

            // Registrar movimiento de trazabilidad
            ProductionMovement::recordProcessReleased($nextProcess, $available);

            return $nextProcess;
        }

        return null;
    }

    /**
     * Registrar producción y actualizar acumulados
     */
    public function registerProduction(int $quantityProduced, int $quantityScrap = 0): void
    {
        $this->increment('completed_quantity', $quantityProduced);
        $this->increment('scrap_quantity', $quantityScrap);
        
        // Recalcular available_quantity
        $this->available_quantity = $this->completed_quantity - $this->scrap_quantity;
        $this->save();

        // Verificar si se completó la cantidad planeada
        if ($this->completed_quantity >= $this->planned_quantity && $this->planned_quantity > 0) {
            $this->complete();
        }
    }

    /**
     * Registrar reproceso
     */
    public function registerRework(int $quantity): void
    {
        $this->increment('rework_quantity', $quantity);
        
        // Agregar cantidad disponible del reproceso
        $this->available_quantity += $quantity;
        $this->save();
    }

    /**
     * Iniciar reproceso - crear registro de retorno
     */
    public function initiateRework(int $quantity, ?int $sourceProcessId = null): void
    {
        // Registrar como reproceso entrante
        $this->registerRework($quantity);

        // Registrar movimiento de trazabilidad
        ProductionMovement::create([
            'work_order_id' => $this->work_order_id,
            'work_order_process_id' => $this->id,
            'movement_type' => 'REWORK_INPUT',
            'quantity' => $quantity,
            'source_process_id' => $sourceProcessId,
            'description' => "Entrada de reproceso: {$quantity} unidades",
        ]);
    }

    /**
     * Obtener el siguiente proceso en la secuencia
     */
    public function getNextInSequence(): ?self
    {
        return WorkOrderProcess::where('work_order_id', $this->work_order_id)
            ->where('id', '>', $this->id)
            ->orderBy('id')
            ->first();
    }

    /**
     * Obtener el proceso anterior en la secuencia
     */
    public function getPreviousInSequence(): ?self
    {
        return WorkOrderProcess::where('work_order_id', $this->work_order_id)
            ->where('id', '<', $this->id)
            ->orderByDesc('id')
            ->first();
    }

    /**
     * Calcular métricas del proceso
     */
    public function getMetrics(): array
    {
        $produced = $this->completed_quantity;
        $scrap = $this->scrap_quantity;
        $planned = $this->planned_quantity;

        return [
            'yield' => $produced > 0 ? round(($produced - $scrap) / $produced * 100, 2) : 0,
            'scrap_rate' => $produced > 0 ? round($scrap / $produced * 100, 2) : 0,
            'efficiency' => $planned > 0 ? round($produced / $planned * 100, 2) : 0,
            'produced' => $produced,
            'scrap' => $scrap,
            'good_parts' => $produced - $scrap,
            'planned' => $planned,
            'available' => $this->available_quantity,
            'rework' => $this->rework_quantity,
        ];
    }

    /**
     * Scope para procesos pendientes
     */
    public function scopePending($query)
    {
        return $query->where('mes_status', self::STATUS_PENDING);
    }

    /**
     * Scope para procesos listos
     */
    public function scopeReady($query)
    {
        return $query->where('mes_status', self::STATUS_READY);
    }

    /**
     * Scope para procesos en ejecución
     */
    public function scopeRunning($query)
    {
        return $query->where('mes_status', self::STATUS_RUNNING);
    }

    /**
     * Scope para procesos completados
     */
    public function scopeCompleted($query)
    {
        return $query->where('mes_status', self::STATUS_COMPLETED);
    }
}
