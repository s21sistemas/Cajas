<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductProcess extends Model
{
    use HasFactory;
    
    protected $table = 'product_processes';
    
    protected $fillable = [
        'product_id',
        'process_id',
        'name',
        'sequence',
        'estimated_minutes',
    ];

    protected $casts = [
        'sequence' => 'integer',
        'estimated_minutes' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }
}
