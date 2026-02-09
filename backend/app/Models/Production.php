<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    protected $fillable = [
        'process_id',
        'machine_id',
        'operator_id',
        'start_time',
        'end_time',
        'good_parts',
        'scrap_parts',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'good_parts' => 'integer',
        'scrap_parts' => 'integer',
    ];

    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }

    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }
}
