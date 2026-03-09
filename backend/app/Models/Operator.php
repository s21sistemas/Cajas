<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Operator extends Authenticatable
{
    use HasFactory, HasApiTokens;
    protected $fillable = [
        'employee_code',
        'name',
        'shift',
        'specialty',
        'active',
        'phone',
        'email',
        'hire_date',
    ];

    protected $casts = [
        'active' => 'boolean',
        'hire_date' => 'date',
    ];

    public function productions()
    {
        return $this->hasMany(Production::class);
    }
}
