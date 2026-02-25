<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Material extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'price',
        'cost',
        'unit',
        'stock',
        'min_stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'stock' => 'integer',
        'min_stock' => 'integer',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_materials')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function processes()
    {
        return $this->hasMany(Process::class);
    }
}
