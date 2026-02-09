<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MaintenanceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'machine_id',
        'machine_name',
        'type',
        'priority',
        'status',
        'description',
        'scheduled_date',
        'start_date',
        'end_date',
        'technician',
        'estimated_hours',
        'actual_hours',
        'estimated_cost',
        'actual_cost',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}
