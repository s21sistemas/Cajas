<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'code',
        'name',
        'rfc',
        'email',
        'phone',
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

    public function serviceOrders()
    {
        return $this->hasMany(ServiceOrder::class);
    }
}
