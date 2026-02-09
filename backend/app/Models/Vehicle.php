<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'tipe_vehicle',
        'brand',
        'model',
        'color',
        'license_plate',
        'status',
        'vehicle_photos',
        'labeled',
        'gps',
        'taxes_paid',
        'aseguradora',
        'telefono_aseguradora',
        'archivo_seguro',
        'numero_poliza',
        'fecha_vencimiento',
    ];

    protected $casts = [
        'fecha_vencimiento' => 'date',
    ];

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }

    public function gasolineReceipt()
    {
        return $this->hasOne(GasolineReceipt::class);
    }
}
