<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'bank',
        'name',
        'description',
        'account_number',
        'clabe',
        'type',
        'currency',
        'balance',
        'available_balance',
        'status',
        'last_movement',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'available_balance' => 'decimal:2',
        'last_movement' => 'datetime',
    ];

    public function movements()
    {
        return $this->hasMany(Movement::class);
    }
}
