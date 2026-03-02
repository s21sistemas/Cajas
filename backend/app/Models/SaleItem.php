<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'product_id',
        'unit',
        'part_number',
        'description',
        'quantity',
        'unit_price',
        'discount_percentage',
        'discount_amount',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Calcular el subtotal del item
     */
    public function calculateSubtotal(): float
    {
        $subtotal = $this->quantity * $this->unit_price;
        
        // Aplicar descuento por porcentaje o monto
        if ($this->discount_percentage > 0) {
            $subtotal -= $subtotal * ($this->discount_percentage / 100);
        }
        
        if ($this->discount_amount > 0) {
            $subtotal -= $this->discount_amount;
        }
        
        return max(0, $subtotal);
    }

    /**
     * Guardar y recalcular subtotal
     */
    public function save(array $options = [])
    {
        $this->subtotal = $this->calculateSubtotal();
        parent::save($options);
    }
}
