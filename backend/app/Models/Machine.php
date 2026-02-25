<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Machine extends Model
{
    use HasFactory;
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
