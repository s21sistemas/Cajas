<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccountStatement extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'client_id',
        'client_name',
        'date',
        'due_date',
        'amount',
        'paid',
        'balance',
        'status',
        'concept',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
