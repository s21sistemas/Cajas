<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Process extends Model
{
    protected $fillable = [
        'part_id',
        'machine_id',
        'process_type',
        'description',
        'sequence',
        'estimated_time_min',
        'status',
        'order_index',
    ];

    protected $casts = [
        'sequence' => 'integer',
        'estimated_time_min' => 'decimal:2',
    ];

    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }

    public function cncPrograms()
    {
        return $this->hasMany(CncProgram::class);
    }

    public function productions()
    {
        return $this->hasMany(Production::class);
    }

    public function workOrderProcesses()
    {
        return $this->hasMany(WorkOrderProcess::class);
    }
}
