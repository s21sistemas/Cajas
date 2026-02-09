<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderProcess extends Model
{
    protected $fillable = [
        'work_order_id',
        'process_id',
        'machine_id',
        'employee_id',
        'status',
        'quantity_done',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'quantity_done' => 'integer',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class);
    }

    public function process()
    {
        return $this->belongsTo(Process::class);
    }

    public function machine()
    {
        return $this->belongsTo(Machine::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
