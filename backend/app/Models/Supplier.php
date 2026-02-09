<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'rfc',
        'email',
        'phone',
        'address',
        'city',
        'contact',
        'category',
        'lead_time',
        'rating',
        'balance',
        'status',
    ];

    protected $casts = [
        'lead_time' => 'integer',
        'rating' => 'integer',
        'balance' => 'decimal:2',
    ];

    public function statements()
    {
        return $this->hasMany(SupplierStatement::class);
    }

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}
