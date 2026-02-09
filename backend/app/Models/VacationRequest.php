<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VacationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'employee_name',
        'department',
        'start_date',
        'end_date',
        'days',
        'days_available',
        'type',
        'status',
        'reason',
        'approved_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'days' => 'integer',
        'days_available' => 'integer',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
