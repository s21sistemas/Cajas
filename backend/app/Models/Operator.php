<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operator extends Model
{
    protected $fillable = [
        'employee_code',
        'name',
        'shift',
        'specialty',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function productions()
    {
        return $this->hasMany(Production::class);
    }
}
