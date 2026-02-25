<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Process extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'code',
        'name',
        'process_type',
        'description',
        'requires_machine',
        'estimated_time_min',
        'status',
    ];

    protected $casts = [
        'requires_machine' => 'boolean',
        'estimated_time_min' => 'decimal:2',
    ];

    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    public function workOrderProcesses()
    {
        return $this->hasMany(WorkOrderProcess::class);
    }
}
