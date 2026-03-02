<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MachineMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'production_id',
        'operator_id',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function production(): BelongsTo
    {
        return $this->belongsTo(Production::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(Operator::class);
    }

    /**
     * Calculate the duration of the movement in minutes
     */
    public function getDurationMinutes(): int
    {
        if (!$this->end_time) {
            return now()->diffInMinutes($this->start_time);
        }
        return $this->end_time->diffInMinutes($this->start_time);
    }

    /**
     * Check if the movement is currently active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Scope to get only active movements
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get movements for a specific machine
     */
    public function scopeForMachine($query, int $machineId)
    {
        return $query->where('machine_id', $machineId);
    }

    /**
     * Scope to get movements within a date range
     */
    public function scopeInDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('start_time', [$startDate, $endDate]);
    }
}
