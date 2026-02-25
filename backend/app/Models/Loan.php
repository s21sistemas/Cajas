<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'loan_type_id',
        'code',
        'type',
        'amount',
        'paid',
        'balance',
        'installments',
        'paid_installments',
        'installment_amount',
        'start_date',
        'end_date',
        'status',
        'reason',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'balance' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected $attributes = [
        'status' => 'pending',
        'paid' => 0,
        'paid_installments' => 0,
    ];

    /**
     * Get the employee that owns the loan.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the loan type.
     */
    public function loanType(): BelongsTo
    {
        return $this->belongsTo(LoanType::class);
    }

    /**
     * Get the payments for the loan.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(LoanPayment::class);
    }

    /**
     * Calculate and update balance.
     */
    public function updateBalance(): void
    {
        $this->balance = $this->amount - $this->paid;
        if ($this->balance <= 0) {
            $this->status = 'completed';
            $this->balance = 0;
        }
        $this->save();
    }

    /**
     * Record a payment.
     */
    public function recordPayment(float $amount): LoanPayment
    {
        $this->paid += $amount;
        $this->paid_installments += 1;
        $this->updateBalance();

        return $this->payments()->create([
            'amount' => $amount,
            'date' => now()->toDateString(),
            'status' => 'applied',
        ]);
    }
}
