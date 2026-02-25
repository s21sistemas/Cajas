<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
        'warehouse',
        'quantity',
        'min_stock',
        'max_stock',
        'unit_cost',
        'unit',
        'location',
        'last_movement',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'min_stock' => 'decimal:2',
        'max_stock' => 'decimal:2',
        'unit_cost' => 'decimal:2',
        'last_movement' => 'datetime',
    ];
}
