<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Process extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'code',
        'name',
        'process_type_id',
        'description',
        'requires_machine',
        'estimated_time_min',
        'status',
    ];

    protected $casts = [
        'requires_machine' => 'boolean',
        'estimated_time_min' => 'decimal:2',
    ];

    public function processType(): BelongsTo
    {
        return $this->belongsTo(ProcessType::class);
    }

    public function productions()
    {
        return $this->hasMany(Production::class);
    }
}
