<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoanType extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'max_amount',
        'max_term_months',
        'interest_rate',
        'requirements',
        'status',
    ];

    protected $casts = [
        'max_amount' => 'decimal:2',
        'max_term_months' => 'integer',
        'interest_rate' => 'decimal:2',
    ];
}
