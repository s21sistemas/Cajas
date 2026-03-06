<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WarehouseLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'zone',
        'type',
        'capacity',
        'occupancy',
    ];

    protected $casts = [
        'capacity' => 'decimal:2',
        'occupancy' => 'decimal:2',
    ];

    public function location()
    {
        return $this->belongsTo(WarehouseLocation::class, 'warehouse_location_id');
    }
}
