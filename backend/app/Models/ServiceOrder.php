<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ServiceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'client_id',
        'client_name',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'assigned_to',
        'estimated_hours',
        'actual_hours',
        'scheduled_date',
        'completed_date',
        'cost',
    ];

    protected $casts = [
        'estimated_hours' => 'decimal:2',
        'actual_hours' => 'decimal:2',
        'scheduled_date' => 'date',
        'completed_date' => 'date',
        'cost' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
