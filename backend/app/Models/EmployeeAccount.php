<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'employee_name',
        'department',
        'base_salary',
        'loans',
        'discounts',
        'overtime',
        'guards',
        'net_balance',
    ];

    protected $casts = [
        'base_salary' => 'decimal:2',
        'loans' => 'decimal:2',
        'discounts' => 'decimal:2',
        'overtime' => 'decimal:2',
        'guards' => 'decimal:2',
        'net_balance' => 'decimal:2',
    ];

    /**
     * Relación con el empleado
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Calcular los valores de la cuenta basándose en los registros relacionados
     */
    public static function calculateForEmployee(Employee $employee): array
    {
        $baseSalary = $employee->salary ?? 0;
        
        // Calcular préstamos activos (balance pendiente)
        $loans = $employee->loans()
            ->where('status', 'active')
            ->sum('balance') ?? 0;
        
        // Calcular descuentos activos
        $discounts = $employee->discounts()
            ->where('status', 'active')
            ->sum('amount') ?? 0;
        
        // Calcular tiempo extra (horas * tarifa)
        $overtime = $employee->overtimes()
            ->where('status', 'approved')
            ->sum('total_amount') ?? 0;
        
        // Calcular pagos de guardias
        $guards = $employee->guardPayments()
            ->sum('amount') ?? 0;
        
        // Calcular balance neto
        // Fórmula: Salario base + horas extra + guardias - préstamos - descuentos
        $netBalance = $baseSalary + $overtime + $guards - $loans - $discounts;
        
        return [
            'employee_name' => $employee->name,
            'department' => $employee->department,
            'base_salary' => $baseSalary,
            'loans' => $loans,
            'discounts' => $discounts,
            'overtime' => $overtime,
            'guards' => $guards,
            'net_balance' => $netBalance,
        ];
    }
}
