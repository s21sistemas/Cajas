<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderPedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'client_id',
        'client_name',
        'delivery_address',
        'branch_id',
        'branch_name',
        'supplier_user_id',
        'status',
        'picked_up_at',
        'delivered_at',
        'delivery_photo',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderPedidoItem::class, 'order_pedido_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generar número de orden único
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-';
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? (int) substr($lastOrder->order_number, -4) + 1 : 1;

        return $prefix . $date . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Verificar si la orden puede ser editada
     */
    public function canBeEdited(): bool
    {
        return in_array($this->status, ['pending', 'assigned']);
    }

    /**
     * Verificar si la orden puede ser cancelada
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'assigned', 'picked_up']);
    }

    /**
     * Verificar si la orden puede ser marcada como recogida
     */
    public function canBePickedUp(): bool
    {
        return in_array($this->status, ['assigned']);
    }

    /**
     * Verificar si la orden puede ser marcada como entregada
     */
    public function canBeDelivered(): bool
    {
        return in_array($this->status, ['picked_up', 'in_transit']);
    }
}
