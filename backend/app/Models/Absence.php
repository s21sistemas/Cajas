<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Absence extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'employee_name',
        'department',
        'date',
        'type',
        'reason',
        'status',
        'deduction',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
