<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'client_id',
        'client_name',
        'quote_id',
        'quote_ref',
        'items',
        'subtotal',
        'tax',
        'tax_rate',
        'total',
        'status',       
        'due_date',
        'payment_type',
        'credit_days',
    ];

    protected $casts = [
        'items' => 'integer',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'total' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function accountStatement()
    {
        return $this->hasOne(AccountStatement::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function recalculateTotals(float $taxRate = 16): void
    {
        $items = $this->saleItems()->get();
        
        $subtotal = $items->sum('subtotal');
        $totalQuantity = $items->sum('quantity');
        $tax = $subtotal * ($taxRate / 100);
        $total = $subtotal + $tax;
        
        $this->update([
            'items' => $totalQuantity,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'tax_rate' => $taxRate,
            'total' => $total,
        ]);
    }
}
