<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeeAccount extends Model
{
    use HasFactory;

    // Por ahora solo timestamps; este modelo está listo para extenderse.
    protected $guarded = [];
}
