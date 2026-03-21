<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Loan;
use App\Models\Employee;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class LoanController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('loans.view'),
                only: ['index', 'show']
            ),
            new Middleware(
                PermissionMiddleware::using('loans.create'),
                only: ['store']
            ),
            new Middleware(
                PermissionMiddleware::using('loans.edit'),
                only: ['update']
            ),
            new Middleware(
                PermissionMiddleware::using('loans.delete'),
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
        $query = Loan::with(['employee', 'loanType']);

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('employee_id') && $request->employee_id) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhereHas('employee', function ($eq) use ($search) {
                      $eq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->orderByDesc('created_at')->paginate($perPage));
    }

    public function selectList(){

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'loan_type_id' => 'nullable|exists:loan_types,id',
            'type' => 'required',
            'amount' => 'required|numeric|min:0',
            'installments' => 'required|integer|min:1',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|in:pending,active,completed,cancelled',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Generate unique code
        $data['code'] = 'LOAN-' . str_pad(Loan::max('id') + 1, 5, '0', STR_PAD_LEFT);

        // Calculate installment amount
        $data['installment_amount'] = $data['amount'] / $data['installments'];
        $data['balance'] = $data['amount'];
        $data['paid'] = 0;
        $data['paid_installments'] = 0;

        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        $loan = Loan::create($data)->load(['employee', 'loanType']);

        return response()->json($loan, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Loan $loan)
    {
        return response()->json($loan->load(['employee', 'loanType', 'payments']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Loan $loan)
    {
        $validator = Validator::make($request->all(), [
            'loan_type_id' => 'nullable|exists:loan_types,id',
            'type' => 'sometimes',
            'amount' => 'sometimes|numeric|min:0',
            'installments' => 'sometimes|integer|min:1',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'status' => 'sometimes|in:pending,active,completed,cancelled',
            'reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Recalculate if amount or installments changed
        if (isset($data['amount']) || isset($data['installments'])) {
            $amount = $data['amount'] ?? $loan->amount;
            $installments = $data['installments'] ?? $loan->installments;
            $data['installment_amount'] = $amount / $installments;
            $data['balance'] = $amount - $loan->paid;
        }

        $loan->update($data);

        return response()->json($loan->load(['employee', 'loanType']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Loan $loan)
    {
        // Delete associated payments first
        $loan->payments()->delete();
        $loan->delete();

        return response()->json(null, 204);
    }

    /**
     * Get loan statistics.
     */
    public function stats()
    {
        $loans = Loan::with('employee')->get();

        return response()->json([
            'total' => $loans->count(),
            'pending' => $loans->where('status', 'pending')->count(),
            'active' => $loans->where('status', 'active')->count(),
            'completed' => $loans->where('status', 'completed')->count(),
            'totalAmount' => $loans->sum('amount'),
            'totalPaid' => $loans->sum('paid'),
            'totalBalance' => $loans->sum('balance'),
        ]);
    }

    /**
     * Activate a loan.
     */
    public function activate(Request $request, Loan $loan)
    {
        $loan->update(['status' => 'active']);
        return response()->json($loan->load(['employee', 'loanType']));
    }

    /**
     * Cancel a loan.
     */
    public function cancel(Request $request, Loan $loan)
    {
        $loan->update(['status' => 'cancelled']);
        return response()->json($loan->load(['employee', 'loanType']));
    }
}
