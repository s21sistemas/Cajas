<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Disability extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'employee_name',
        'department',
        'type',
        'start_date',
        'end_date',
        'days',
        'folio',
        'status',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'days' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
