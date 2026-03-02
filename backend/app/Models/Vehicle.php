<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'type_vehicle',
        'brand',
        'model',
        'color',
        'license_plate',
        'status',
        'vehicle_photos',
        'labeled',
        'gps',
        'taxes_paid',
        'insurance_company',
        'insurance_company_phone',
        'insurance_file',
        'policy_number',
        'expiration_date',
    ];

    protected $casts = [
        'expiration_date' => 'date',
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
