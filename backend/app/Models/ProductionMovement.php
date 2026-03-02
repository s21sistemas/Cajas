<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductionMovement extends Model
{
    use HasFactory;

    // Tipos de movimiento
    const TYPE_PRODUCTION = 'PRODUCTION';
    const TYPE_SCRAP = 'SCRAP';
    const TYPE_REWORK_INPUT = 'REWORK_INPUT';
    const TYPE_REWORK_OUTPUT = 'REWORK_OUTPUT';
    const TYPE_QUALITY_APPROVED = 'QUALITY_APPROVED';
    const TYPE_QUALITY_SCRAP = 'QUALITY_SCRAP';
    const TYPE_QUALITY_REWORK = 'QUALITY_REWORK';
    const TYPE_PROCESS_RELEASED = 'PROCESS_RELEASED';
    const TYPE_PROCESS_COMPLETED = 'PROCESS_COMPLETED';

    protected $fillable = [
        'work_order_id',
        'production_id',
        'quality_evaluation_id',
        'movement_type',
        'quantity',
        'quantity_before',
        'quantity_after',
        'source_process_id',
        'destination_process_id',
        'user_id',
        'description',
        'metadata',
        'movement_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'source_process_id' => 'integer',
        'destination_process_id' => 'integer',
        'metadata' => 'array',
        'movement_date' => 'datetime',
    ];

    /**
     * Relación con la orden de trabajo
     */
    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Relación con el proceso
     */
    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    /**
     * Relación con la producción
     */
    public function production()
    {
        return $this->belongsTo(Production::class);
    }

    /**
     * Relación con la evaluación de calidad
     */
    public function qualityEvaluation()
    {
        return $this->belongsTo(QualityEvaluation::class);
    }

    /**
     * Proceso origen
     */
    public function sourceProcess()
    {
        return $this->belongsTo(Process::class, 'source_process_id');
    }

    /**
     * Proceso destino
     */
    public function destinationProcess()
    {
        return $this->belongsTo(Process::class, 'destination_process_id');
    }

    /**
     * Usuario que realizó el movimiento
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Registrar un movimiento de producción
     */
    public static function recordProduction(
        Production $production,
        int $quantity
    ): self {
        return self::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => self::TYPE_PRODUCTION,
            'quantity' => $quantity,
            'description' => "Producción registrada: {$quantity} unidades",
        ]);
    }

    /**
     * Registrar un movimiento de scrap
     */
    public static function recordScrap(
        Production $production,
        int $quantity
    ): self {
        return self::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => self::TYPE_SCRAP,
            'quantity' => $quantity,
            'description' => "Scrap registrado: {$quantity} unidades",
        ]);
    }

    /**
     * Registrar liberación de proceso
     */
    public static function recordProcessReleased(
        Production $production,
        int $availableQuantity
    ): self {
        return self::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => self::TYPE_PROCESS_RELEASED,
            'quantity' => $availableQuantity,
            'description' => "Proceso liberado con {$availableQuantity} unidades disponibles",
        ]);
    }

    /**
     * Registrar completado de proceso
     */
    public static function recordProcessCompleted(Production $production): self {
        return self::create([
            'work_order_id' => $production->work_order_id,
            'production_id' => $production->id,
            'movement_type' => self::TYPE_PROCESS_COMPLETED,
            'quantity' => $production->good_parts,
            'description' => "Proceso completado: {$production->good_parts} unidades producidas",
        ]);
    }

    /**
     * Obtener historial de movimientos de una orden de trabajo
     */
    public static function getHistoryForWorkOrder(int $workOrderId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('work_order_id', $workOrderId)
            ->orderBy('movement_date', 'desc')
            ->get();
    }

    /**
     * Obtener historial de movimientos de un proceso
     */
    public static function getHistoryForProcess(int $processId): \Illuminate\Database\Eloquent\Collection
    {
        // Buscar producciones con ese proceso y obtener sus movimientos
        $productions = Production::where('process_id', $processId)->get();
        $productionIds = $productions->pluck('id');
        
        return self::whereIn('production_id', $productionIds)
            ->orderBy('movement_date', 'desc')
            ->get();
    }

    /**
     * Scope para movimientos de producción
     */
    public function scopeProduction($query)
    {
        return $query->where('movement_type', self::TYPE_PRODUCTION);
    }

    /**
     * Scope para movimientos de scrap
     */
    public function scopeScrap($query)
    {
        return $query->where('movement_type', self::TYPE_SCRAP);
    }

    /**
     * Scope para movimientos de reproceso
     */
    public function scopeRework($query)
    {
        return $query->whereIn('movement_type', [
            self::TYPE_REWORK_INPUT,
            self::TYPE_REWORK_OUTPUT,
            self::TYPE_QUALITY_REWORK,
        ]);
    }

    /**
     * Scope para movimientos de calidad
     */
    public function scopeQuality($query)
    {
        return $query->whereIn('movement_type', [
            self::TYPE_QUALITY_APPROVED,
            self::TYPE_QUALITY_SCRAP,
            self::TYPE_QUALITY_REWORK,
        ]);
    }

    /**
     * Obtener el tipo de movimiento en texto legible
     */
    public function getTypeLabel(): string
    {
        return match($this->movement_type) {
            self::TYPE_PRODUCTION => 'Producción',
            self::TYPE_SCRAP => 'Scrap',
            self::TYPE_REWORK_INPUT => 'Entrada Reproceso',
            self::TYPE_REWORK_OUTPUT => 'Salida Reproceso',
            self::TYPE_QUALITY_APPROVED => 'Aprobado Calidad',
            self::TYPE_QUALITY_SCRAP => 'Scrap Calidad',
            self::TYPE_QUALITY_REWORK => 'Reproceso Calidad',
            self::TYPE_PROCESS_RELEASED => 'Proceso Liberado',
            self::TYPE_PROCESS_COMPLETED => 'Proceso Completado',
            default => $this->movement_type,
        };
    }
}
