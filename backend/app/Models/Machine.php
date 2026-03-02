<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Machine extends Model
{
    use HasFactory;

    // Status constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_IN_USE = 'in_use';
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
        'created_at',
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
}
