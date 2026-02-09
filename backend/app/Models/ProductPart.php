<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductPart extends Model
{
    protected $table = 'product_parts';

    protected $fillable = [
        'product_id',
        'part_id',
        'quantity',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function part()
    {
        return $this->belongsTo(Part::class);
    }
}
