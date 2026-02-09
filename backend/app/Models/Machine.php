<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Machine extends Model
{
    protected $fillable = [
        'code',
        'name',
        'type',
        'axes',
        'status',
        'notes',
    ];

    protected $casts = [
        'axes' => 'integer',
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
}
