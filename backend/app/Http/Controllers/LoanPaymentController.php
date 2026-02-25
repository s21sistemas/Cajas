<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LoanPayment;
use App\Models\Loan;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class LoanPaymentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('loanpayments.view'),
                only: ['index', 'show']
            ),
            new Middleware(
                PermissionMiddleware::using('loanpayments.create'),
                only: ['store']
            ),
            new Middleware(
                PermissionMiddleware::using('loanpayments.edit'),
                only: ['update']
            ),
            new Middleware(
                PermissionMiddleware::using('loanpayments.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $query = LoanPayment::with(['loan', 'employee']);

        if ($request->has('loan_id') && $request->loan_id) {
            $query->where('loan_id', $request->loan_id);
        }

        if ($request->has('employee_id') && $request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderByDesc('date')->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'loan_id' => 'required|exists:loans,id',
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:payroll,cash,transfer,other',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,applied,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $loan = Loan::findOrFail($data['loan_id']);

        // Verify employee matches loan
        if ($request->has('employee_id') && $request->employee_id != $loan->employee_id) {
            $data['employee_id'] = $request->employee_id;
        } else {
            $data['employee_id'] = $loan->employee_id;
        }

        if (!isset($data['status'])) {
            $data['status'] = 'applied';
        }

        $payment = LoanPayment::create($data);

        // Update loan balance
        if ($data['status'] === 'applied') {
            $loan->recordPayment($data['amount']);
        }

        return response()->json($payment->load(['loan', 'employee']), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(LoanPayment $loanPayment)
    {
        return response()->json($loanPayment->load(['loan', 'employee']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LoanPayment $loanPayment)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|in:payroll,cash,transfer,other',
            'reference' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,applied,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // If amount changed, need to adjust loan balance
        if (isset($data['amount']) && $data['amount'] != $loanPayment->amount) {
            $loan = $loanPayment->loan;
            $oldAmount = $loanPayment->amount;
            $newAmount = $data['amount'];

            if ($loanPayment->status === 'applied') {
                $loan->paid = $loan->paid - $oldAmount + $newAmount;
                $loan->updateBalance();
            }
        }

        $loanPayment->update($data);

        return response()->json($loanPayment->load(['loan', 'employee']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LoanPayment $loanPayment)
    {
        // If payment was applied, reverse the loan balance
        if ($loanPayment->status === 'applied') {
            $loan = $loanPayment->loan;
            $loan->paid -= $loanPayment->amount;
            $loan->paid_installments -= 1;
            $loan->updateBalance();
        }

        $loanPayment->delete();

        return response()->json(null, 204);
    }

    /**
     * Cancel a payment.
     */
    public function cancel(Request $request, LoanPayment $loanPayment)
    {
        if ($loanPayment->status === 'applied') {
            $loan = $loanPayment->loan;
            $loan->paid -= $loanPayment->amount;
            $loan->paid_installments -= 1;
            $loan->updateBalance();
        }

        $loanPayment->update(['status' => 'cancelled']);

        return response()->json($loanPayment->load(['loan', 'employee']));
    }
}
