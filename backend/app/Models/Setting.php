<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = [
        'module',
        'key',
        'value',
    ];

    /**
     * El campo 'value' puede ser escalar o estructura.
     * Lo transformamos automáticamente a array/u objeto si es JSON.
     */
    protected $casts = [
        'value' => 'json',
    ];
}
