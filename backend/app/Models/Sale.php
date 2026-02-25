<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice',
        'client_id',
        'client_name',
        'quote_id',
        'quote_ref',
        'items',
        'subtotal',
        'tax',
        'total',
        'paid',
        'status',
        'payment_method',
        'due_date',
    ];

    protected $casts = [
        'items' => 'integer',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'paid' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function quote()
    {
        return $this->belongsTo(Quote::class);
    }
}
