<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CncProgram extends Model
{
    protected $fillable = [
        'process_id',
        'name',
        'gcode_path',
        'version',
        'active',
        'notes',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function process()
    {
        return $this->belongsTo(Process::class);
    }
}
