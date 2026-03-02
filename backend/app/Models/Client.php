<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'name',
        'rfc',
        'email',
        'phone',
        'contacto',
        'whatsapp',
        'address',
        'city',
        'state',
        'credit_limit',
        'balance',
        'status',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    public function quotes()
    {
        return $this->hasMany(Quote::class);
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function accountStatements()
    {
        return $this->hasMany(AccountStatement::class);
    }
}
