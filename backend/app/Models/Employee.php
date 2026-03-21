<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'position',
        'department',
        'email',
        'phone',
        'salary',
        'hire_date',
        'status',
        'avatar',
    ];

    public function absences()
    {
        return $this->hasMany(Absence::class);
    }

    public function overtimes()
    {
        return $this->hasMany(Overtime::class);
    }

    public function guardPayments()
    {
        return $this->hasMany(GuardPayment::class);
    }

    public function discounts()
    {
        return $this->hasMany(Discount::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function disabilities()
    {
        return $this->hasMany(Disability::class);
    }

    public function vacationRequests()
    {
        return $this->hasMany(VacationRequest::class);
    }
}
