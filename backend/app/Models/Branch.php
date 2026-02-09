<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'client_id',
        'client_name',
        'address',
        'city',
        'state',
        'phone',
        'contact',
        'status',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
