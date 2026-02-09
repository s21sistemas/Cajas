<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = [
        'vehicle_id',
        'driver',
        'origin_address',
        'status',
        'started_at',
        'completed_at',
    ];
    
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
