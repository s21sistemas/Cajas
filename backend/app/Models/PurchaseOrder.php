<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'supplier_id',
        'supplier_name',
        'items',
        'total',
        'status',
        'priority',
        'requested_by',
        'approved_by',
        'expected_date',
    ];

    protected $casts = [
        'items' => 'integer',
        'total' => 'decimal:2',
        'expected_date' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}
