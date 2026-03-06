<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPedidoItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_pedido_id',
        'product_id',
        'product_name',
        'product_code',
        'quantity',
        'unit',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(OrderPedido::class, 'order_pedido_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'product_id');
    }
}
