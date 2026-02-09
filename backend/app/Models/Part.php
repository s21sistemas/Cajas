<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'material',
        'drawing_url',
        'status',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_parts')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function processes()
    {
        return $this->hasMany(Process::class);
    }
}
