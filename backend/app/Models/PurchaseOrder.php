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
        'material_id',
        'material_name',
        'quantity',
        'unit_price',
        'items',
        'subtotal',
        'iva_percentage',
        'iva',
        'total',
        'status',
        'priority',
        'payment_type',
        'credit_days',
        'requested_by',
        'approved_by',
        'expected_date',
        'due_date',
    ];

    protected $casts = [
        'items' => 'integer',
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'iva_percentage' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
        'expected_date' => 'date',
        'due_date' => 'date',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function supplierStatement()
    {
        return $this->hasOne(SupplierStatement::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
