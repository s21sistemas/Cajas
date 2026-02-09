<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GasolineReceipt extends Model
{
    protected $fillable = [
        'vehicle_id',
        'mileage',
        'liters',
        'cost_per_liter',
        'total_cost',
        'notes',
    ];

    protected $casts = [
        'mileage' => 'decimal:2',
        'liters' => 'decimal:2',
        'cost_per_liter' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
