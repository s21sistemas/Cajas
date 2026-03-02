<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkOrder extends Model
{
    use HasFactory;

    // Constantes de estados de producción
    const PRODUCTION_STATUS_PENDING = 'pending';
    const PRODUCTION_STATUS_IN_PRODUCTION = 'in_production';
    const PRODUCTION_STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'code',
        'product_id',
        'client_id',
        'supplier_id',
        'sale_id',
        'product_name',
        'supplier_name',
        'quantity',
        'completed',
        'status',
        'priority',
        'machine',
        'operator',
        'start_date',
        'due_date',
        'expected_date',
        'progress',
        'estimated_time',
        'actual_time',
        'cancellation_reason',
        // Campos de precios
        'unit_price',
        'subtotal',
        'iva',
        'total',
        // Campos de pago
        'payment_type',
        'credit_days',
        // Campos MES
        'total_produced',
        'total_scrap',
        'total_rework',
        'yield',
        'scrap_rate',
        'efficiency',
        'production_status',
        'production_started_at',
        'production_completed_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'completed' => 'integer',
        'start_date' => 'date',
        'due_date' => 'date',
        'expected_date' => 'date',
        'progress' => 'integer',
        'estimated_time' => 'decimal:2',
        'actual_time' => 'decimal:2',
        // Campos de precios
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
        // Campos de pago
        'credit_days' => 'integer',
        // Campos MES
        'total_produced' => 'integer',
        'total_scrap' => 'integer',
        'total_rework' => 'integer',
        'yield' => 'decimal:2',
        'scrap_rate' => 'decimal:2',
        'efficiency' => 'decimal:2',
        'production_started_at' => 'datetime',
        'production_completed_at' => 'datetime',
    ];

    /**
     * Relación con Producto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relación con Cliente
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Relación con Proveedor
     */
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Relación con Venta
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relación con Producciones
     */
    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    /**
     * Procesos de la orden de trabajo
     */
    public function process()
    {
        return $this->hasMany(Process::class)->orderBy('id');
    }

    /**
     * Movimientos de trazabilidad
     */
    public function movements()
    {
        return $this->hasMany(ProductionMovement::class);
    }

    /**
     * Obtener el total de piezas buenas de todas las producciones relacionadas
     */
    public function getTotalGoodParts(): int
    {
        return $this->productions()
            ->where('status', '!=', 'cancelled')
            ->sum('good_parts');
    }

    /**
     * Calcular subtotal, iva y total automáticamente
     */
    public function calculateTotals(float $ivaRate = 0.16): void
    {
        $this->subtotal = $this->quantity * $this->unit_price;
        $this->iva = $this->subtotal * $ivaRate;
        $this->total = $this->subtotal + $this->iva;
    }

    /**
     * Obtener el estado del pipeline de producción
     */
    public function getPipelineStatus(): array
    {
        $productions = $this->productions()->with(['process', 'parentProcess'])->get();
        
        $totalProcesses = $productions->count();
        $pending = $productions->where('status', 'pending')->count();
        $inProgress = $productions->where('status', 'in_progress')->count();
        $paused = $productions->where('status', 'paused')->count();
        $completed = $productions->where('status', 'completed')->count();
        
        // Usar good_parts y scrap_parts (no quantity_produced/quantity_scrap)
        $totalProduced = $productions->sum('good_parts');
        $totalScrap = $productions->sum('scrap_parts');
        
        $yield = $totalProduced + $totalScrap > 0 
            ? round(($totalProduced / ($totalProduced + $totalScrap)) * 100, 2) 
            : 0;
        $scrapRate = $totalProduced + $totalScrap > 0 
            ? round(($totalScrap / ($totalProduced + $totalScrap)) * 100, 2) 
            : 0;
        
        // Transformar producciones para el frontend
        $processes = $productions->map(function ($prod) {
            return [
                'id' => $prod->id,
                'name' => $prod->process?->name ?? 'Proceso',
                'sequence' => $prod->process?->id ?? 1,
                'status' => $prod->status,
                'quality_status' => $prod->quality_status,
                'target_parts' => $prod->target_parts,
                'good_parts' => $prod->good_parts,
                'scrap_parts' => $prod->scrap_parts,
                'start_time' => $prod->start_time,
                'end_time' => $prod->end_time,
            ];
        });
        
        return [
            'pipeline_status' => [
                'total_processes' => $totalProcesses,
                'pending' => $pending,
                'ready' => $inProgress,
                'running' => $inProgress,
                'paused' => $paused,
                'completed' => $completed,
                'total_produced' => $totalProduced,
                'total_scrap' => $totalScrap,
                'yield' => $yield,
                'scrap_rate' => $scrapRate,
                'efficiency' => $totalProcesses > 0 ? round(($completed / $totalProcesses) * 100, 2) : 0,
            ],
            'processes' => $processes,
        ];
    }

    /**
     * Verificar y completar la orden de trabajo si todos los procesos están completados
     */
    public function checkAndComplete(): void
    {
        $productions = $this->productions()->get();
        
        if ($productions->isEmpty()) {
            return;
        }
        
        // Verificar si todas las producciones están completadas
        $allCompleted = $productions->every(function ($production) {
            return $production->status === 'completed';
        });
        
        if ($allCompleted && $this->status !== 'completed') {
            $this->update([
                'status' => 'completed',
                'progress' => 100,
                'completed' => $this->quantity,
                'production_status' => self::PRODUCTION_STATUS_COMPLETED,
                'production_completed_at' => now(),
            ]);
        }
    }

    /**
     * Sincronizar progreso desde las producciones
     */
    public function syncProgressFromProductions(): void
    {
        $totalGoodParts = $this->productions()
            ->where('status', '!=', 'cancelled')
            ->sum('good_parts');
        
        $progress = $this->quantity > 0 
            ? round(($totalGoodParts / $this->quantity) * 100, 2) 
            : 0;
        
        $this->update([
            'completed' => $totalGoodParts,
            'progress' => min($progress, 100),
        ]);
    }
}
