<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WorkOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'client_name',
        'quantity',
        'completed',
        'status',
        'priority',
        'machine',
        'operator',
        'start_date',
        'due_date',
        'progress',
        'estimated_time',
        'actual_time',
        'cancellation_reason',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'completed' => 'integer',
        'start_date' => 'date',
        'due_date' => 'date',
        'progress' => 'integer',
        'estimated_time' => 'decimal:2',
        'actual_time' => 'decimal:2',
    ];
}
