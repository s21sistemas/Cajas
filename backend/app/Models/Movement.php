<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Movement extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'type',
        'category',
        'description',
        'reference',
        'bank_account_id',
        'amount',
        'balance',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }

    /**
     * Relación polimórfica para el movimiento (puede pertenecer a un Payment)
     */
    public function movementable()
    {
        return $this->morphTo();
    }

    /**
     * Accessor para formatear la fecha de manera legible
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('d/m/Y');
    }

    /**
     * Accessor para formatear el monto con símbolo de moneda
     */
    public function getFormattedAmountAttribute(): string
    {
        return '
 . number_format($this->amount, 2);
    }

    /**
     * Accessor para formatear el balance con símbolo de moneda
     */
    public function getFormattedBalanceAttribute(): string
    {
        return '
 . number_format($this->balance, 2);
    }
}
