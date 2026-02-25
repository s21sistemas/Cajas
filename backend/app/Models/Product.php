<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
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
        'status',
    ];
    
    public function materials()
    {
        return $this->belongsToMany(Material::class, 'product_materials')
            ->withPivot('quantity')
            ->withTimestamps();
    }

    public function productProcesses()
    {
        return $this->hasMany(ProductProcess::class)->orderBy('sequence');
    }

    // Alias for backwards compatibility
    public function processes()
    {
        return $this->hasMany(ProductProcess::class)->orderBy('sequence');
    }

    public function parts()
    {
        return $this->belongsToMany(Material::class, 'product_materials')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
