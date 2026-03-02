<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Movement;
use App\Models\BankAccount;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MovementController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('movements.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('movements.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Movement::with('bankAccount')->orderByDesc('date')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'type' => 'required|in:income,expense,transfer',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'amount' => 'required|numeric',
            'balance' => 'required|numeric',
            'status' => 'sometimes|in:completed,pending,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['status'] = $data['status'] ?? 'pending';

        // Generar referencia automática si no se proporciona
        if (empty($data['reference'])) {
            $data['reference'] = $this->generateReference($data['type']);
        }

        $item = Movement::create($data)->load('bankAccount');

        // Si el movimiento está completado, actualizar el saldo de la cuenta
        if ($item->status === 'completed') {
            $this->updateAccountBalance($item);
        }

        return response()->json($item, 201);
    }

    public function show(Movement $movement)
    {
        return response()->json($movement->load('bankAccount'));
    }

    public function update(Request $request, Movement $movement)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'sometimes|date',
            'type' => 'sometimes|in:income,expense,transfer',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'amount' => 'sometimes|numeric',
            'balance' => 'sometimes|numeric',
            'status' => 'sometimes|in:completed,pending,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Generar referencia automática si no se proporciona
        if (empty($movement->reference)) {
            $movement->reference = $this->generateReference($movement->type);
        }

        $oldStatus = $movement->status;
        $oldAmount = $movement->amount;
        $oldType = $movement->type;
        $oldBankAccountId = $movement->bank_account_id;

        $movement->update($validator->validated());

        // Si el movimiento cambió a completado, actualizar el saldo
        if ($movement->status === 'completed' && $oldStatus !== 'completed') {
            $this->updateAccountBalance($movement);
        }
        // Si se estuvo completado y ahora no lo está, revertir el saldo
        elseif ($movement->status !== 'completed' && $oldStatus === 'completed') {
            $this->revertAccountBalance($movement, $oldAmount, $oldType, $oldBankAccountId);
        }
        // Si seguía completado pero cambió el monto o tipo, ajustar
        elseif ($movement->status === 'completed') {
            // Revertir el viejo y aplicar el nuevo
            $this->revertAccountBalance($movement, $oldAmount, $oldType, $oldBankAccountId);
            $this->updateAccountBalance($movement);
        }

        return response()->json($movement->load('bankAccount'));
    }

    /**
     * Actualiza el saldo de la cuenta bancaria según el movimiento
     */
    private function updateAccountBalance(Movement $movement): void
    {
        $account = BankAccount::find($movement->bank_account_id);
        if (!$account) return;

        // Calcular el nuevo saldo
        if ($movement->type === 'income') {
            $account->balance += $movement->amount;
        } elseif ($movement->type === 'expense') {
            $account->balance -= $movement->amount;
        }
        // Transfer no afecta el saldo total

        $account->save();
    }

    /**
     * Revierte el saldo de la cuenta bancaria (para cuando se cancela un movimiento)
     */
    private function revertAccountBalance(Movement $movement, float $amount, string $type, int $bankAccountId): void
    {
        $account = BankAccount::find($bankAccountId);
        if (!$account) return;

        // Revertir la operación
        if ($type === 'income') {
            $account->balance -= $amount;
        } elseif ($type === 'expense') {
            $account->balance += $amount;
        }

        $account->save();
    }

    /**
     * Genera una referencia automática para el movimiento
     */
    private function generateReference(string $type): string
    {
        $prefix = match($type) {
            'income' => 'ING',
            'expense' => 'EGR',
            'transfer' => 'TRF',
            default => 'MOV',
        };

        $lastMovement = Movement::orderByDesc('id')->first();
        $nextNumber = $lastMovement ? $lastMovement->id + 1 : 1;
        
        return $prefix . '-' . date('Ymd') . '-' . str_pad((string)$nextNumber, 5, '0', STR_PAD_LEFT);
    }

    public function destroy(Movement $movement)
    {
        $movement->delete();
        return response()->json(null, 204);
    }
}
