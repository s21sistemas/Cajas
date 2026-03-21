<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Machine extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_IN_USE = 'running';
    const STATUS_MAINTENANCE = 'maintenance';
    const STATUS_BREAKDOWN = 'breakdown';

    protected $fillable = [
        'code',
        'name',
        'type',
        'axes',
        'brand',
        'model',
        'location',
        'status',
        'notes',
    ];

    protected $casts = [
        'axes' => 'integer',
    ];

    protected $hidden = [
        // 'created_at',
        'updated_at',
    ];

    public function processes()
    {
        return $this->hasMany(Process::class);
    }

    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    public function maintenanceOrders()
    {
        return $this->hasMany(MaintenanceOrder::class);
    }

    public function machineMovements()
    {
        return $this->hasMany(MachineMovement::class);
    }

    // Alias para compatibilidad
    public function movements()
    {
        return $this->hasMany(MachineMovement::class);
    }

    /**
     * Calcular utilización de la máquina en la semana actual
     * Retorna array con utilization y tiempo activo en horas
     */
    public function getCurrentWeekUtilization(): array
    {
        // Obtener inicio de la semana (lunes)
        $startOfWeek = now()->startOfWeek();
        $endOfWeek = now()->endOfWeek();
        
        // Tiempo total de la semana desde el lunes hasta ahora
        $totalHours = now()->diffInHours($startOfWeek);
        
        // Si es domingo o temprano en la semana, usamos la semana completa
        if ($totalHours < 1) {
            $totalHours = now()->diffInHours($startOfWeek->copy()->addWeek());
        }
        
        // Obtener movimientos de la semana
        $movements = $this->machineMovements()
            ->where('start_time', '>=', $startOfWeek)
            ->where(function($query) use ($endOfWeek) {
                $query->where('end_time', '<=', $endOfWeek)
                    ->orWhereNull('end_time');
            })
            ->get();
        
        $activeMinutes = 0;
        
        foreach ($movements as $movement) {
            $start = $movement->start_time;
            $end = $movement->end_time ?? now();
            
            if ($start && $end) {
                $activeMinutes += $start->diffInMinutes($end);
            }
        }
        
        $activeHours = $activeMinutes / 60;
        
        // Calcular utilización
        $utilization = $totalHours > 0 ? round(($activeHours / $totalHours) * 100, 1) : 0;
        
        return [
            'utilization' => min($utilization, 100), // Máximo 100%
            'activeHours' => round($activeHours, 1),
            'totalHours' => round($totalHours, 1),
            'startOfWeek' => $startOfWeek->format('Y-m-d'),
            'endOfWeek' => $endOfWeek->format('Y-m-d'),
        ];
    }
}
