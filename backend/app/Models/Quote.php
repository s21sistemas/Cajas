<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'client_id',
        'client_name',
        'title',
        'items',
        'subtotal',
        'tax',
        'total',
        'status',
        'valid_until',
        'created_by',
    ];

    protected $casts = [
        'items' => 'integer',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'valid_until' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
