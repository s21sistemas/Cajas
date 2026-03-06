<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AccountStatement;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AccountStatementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('accountstatements.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('accountstatements.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 100);
        
        $query = AccountStatement::with(['client', 'sale', 'payments']);
        
        // Filtros
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                  ->orWhere('concept', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->integer('client_id'));
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->input('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->input('date_to'));
        }
        
        $items = $query->orderByDesc('date')->paginate($perPage);
        
        // Agregar invoice_number desde la relación sale
        $items->getCollection()->transform(function ($item) {
            $item->code = $item->sale ? $item->sale->code : null;
            return $item;
        });
        
        return response()->json($items);
    }

    /**
     * Obtener estadísticas de cuentas por cobrar
     */
    public function stats(Request $request)
    {
        $clientId = $request->integer('client_id');
        
        $query = AccountStatement::query();
        
        // Filtrar por cliente si se especifica
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        $statements = $query->get();
        
        $totalInvoices = $statements->count();
        $totalReceivable = $statements->sum('balance');
        $totalPaid = $statements->sum('paid');
        $totalOverdue = $statements->where('status', 'overdue')->sum('balance');
        $totalPending = $statements->where('status', 'pending')->sum('balance');
        $totalPartial = $statements->where('status', 'partial')->sum('balance');
        
        // Estadísticas por cliente
        $byClient = $statements->groupBy('client_id')->map(function ($clientStatements) {
            return [
                'client_id' => $clientStatements->first()->client_id,
                'client_name' => $clientStatements->first()->client_name,
                'total_invoices' => $clientStatements->count(),
                'total_receivable' => $clientStatements->sum('balance'),
                'total_paid' => $clientStatements->sum('paid'),
                'overdue' => $clientStatements->where('status', 'overdue')->sum('balance'),
            ];
        })->values();
        
        return response()->json([
            'total_invoices' => $totalInvoices,
            'total_receivable' => $totalReceivable,
            'total_paid' => $totalPaid,
            'total_overdue' => $totalOverdue,
            'total_pending' => $totalPending,
            'total_partial' => $totalPartial,
            'by_client' => $byClient,
        ]);
    }
}
