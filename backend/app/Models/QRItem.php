<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QRItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'code',
        'name',
        'generated',
    ];

    protected $casts = [
        'generated' => 'datetime',
    ];
}
