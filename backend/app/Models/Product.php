<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'status',
    ];
    
    public function parts()
    {
        return $this->belongsToMany(Part::class, 'product_parts')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
