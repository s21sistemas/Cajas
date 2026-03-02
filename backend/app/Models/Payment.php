<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'code',
        'sale_id',
        'bank_account_id',
        'amount',
        'payment_method',
        'reference',
        'notes',
        'payment_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    public function sale()
    {
        return $this->hasOneThrough(
            Sale::class,
            AccountStatement::class,
            'id',                   // FK en account_statements
            'id',                   // FK en sales
            'account_statement_id', // FK en payments
            'sale_id'               // FK en account_statements
        );
    }

    public function accountStatement()
    {
        return $this->belongsTo(AccountStatement::class);
    }

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(BankAccount::class);
    }

    public function movement()
    {
        return $this->morphOne(Movement::class, 'movementable');
    }
}
