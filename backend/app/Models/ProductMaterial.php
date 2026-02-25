<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoMaterial extends Model
{
    protected $table = 'product_materials';

    protected $fillable = [
        'product_id',
        'material_id',
        'quantity',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
