<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientAuthController extends Controller
{
    /**
     * Login de cliente usando email y contraseña
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $client = Client::where('email', $data['email'])->first();

        if (!$client) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        if (!$client->password || !Hash::check($data['password'], $client->password)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        // Generar token de sesión simple (no es un token de API real, es solo para identificar al cliente)
        $sessionToken = Str::random(60);
        $client->approval_token = hash('sha256', $sessionToken);
        $client->approval_token_expires_at = now()->addHours(24);
        $client->save();

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'code' => $client->code,
            ],
            'session_token' => $sessionToken,
            'expires_at' => $client->approval_token_expires_at,
        ]);
    }

    /**
     * Establecer contraseña por primera vez (cuando el cliente recibe el link)
     */
    public function setPassword(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $token = hash('sha256', $data['token']);
        
        $client = Client::where('approval_token', $token)->first();

        if (!$client) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        if ($client->approval_token_expires_at && $client->approval_token_expires_at->isPast()) {
            return response()->json(['error' => 'El token ha expirado'], 401);
        }

        $client->password = Hash::make($request->password);
        $client->password_set_at = now();
        $client->approval_token = null;
        $client->approval_token_expires_at = null;
        $client->save();

        // Generar nueva sesión
        $sessionToken = Str::random(60);
        $client->approval_token = hash('sha256', $sessionToken);
        $client->approval_token_expires_at = now()->addHours(24);
        $client->save();

        return response()->json([
            'message' => 'Contraseña establecida correctamente',
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
            'session_token' => $sessionToken,
        ]);
    }

    /**
     * Generar link de aprobación para una venta o cotización
     */
    public function generateApprovalLink(Request $request)
    {
        $data = $request->validate([
            'sale_id' => 'nullable|exists:sales,id',
            'quote_id' => 'nullable|exists:quotes,id',
            'client_id' => 'required|exists:clients,id',
        ]);

        $client = Client::find($data['client_id']);

        if (!$client->email) {
            return response()->json(['error' => 'El cliente no tiene email registrado'], 422);
        }

        // Generar token de aprobación
        $approvalToken = Str::random(64);
        
        $client->approval_token = hash('sha256', $approvalToken);
        $client->approval_token_expires_at = now()->addDays(7);
        $client->save();

        // Generar URL de aprobación
        $approvalUrl = config('app.frontend_url', 'http://localhost:3000') . '/auth/client-approval?token=' . $approvalToken;

        return response()->json([
            'approval_url' => $approvalUrl,
            'expires_at' => $client->approval_token_expires_at,
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
        ]);
    }

    /**
     * Obtener información de aprobación desde el token
     */
    public function getApprovalInfo(Request $request)
    {
        $token = $request->query('token');

        if (!$token) {
            return response()->json(['error' => 'Token requerido'], 400);
        }

        $tokenHash = hash('sha256', $token);
        $client = Client::where('approval_token', $tokenHash)->first();

        if (!$client) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        if ($client->approval_token_expires_at && $client->approval_token_expires_at->isPast()) {
            return response()->json(['error' => 'El token ha expirado'], 401);
        }

        // Obtener ventas o cotizaciones pendientes de aprobación
        $sales = \App\Models\Sale::where('client_id', $client->id)
            ->whereNull('approved_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'type' => 'sale',
                    'code' => $sale->code,
                    'total' => $sale->total,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at,
                ];
            });

        $quotes = \App\Models\Quote::where('client_id', $client->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'type' => 'quote',
                    'code' => $quote->code,
                    'total' => $quote->total,
                    'status' => $quote->status,
                    'created_at' => $quote->created_at,
                ];
            });

        return response()->json([
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
            'has_password' => !empty($client->password),
            'pending_approvals' => [
                'sales' => $sales,
                'quotes' => $quotes,
            ],
        ]);
    }

    /**
     * Aprobar una venta o cotización y subir documento
     */
    public function approveDocument(Request $request)
    {
        $data = $request->validate([
            'token' => 'required|string',
            'type' => 'required|in:sale,quote',
            'id' => 'required|integer',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'notes' => 'nullable|string',
        ]);

        $tokenHash = hash('sha256', $data['token']);
        $client = Client::where('approval_token', $tokenHash)->first();

        if (!$client) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        if ($client->approval_token_expires_at && $client->approval_token_expires_at->isPast()) {
            return response()->json(['error' => 'El token ha expirado'], 401);
        }

        // Guardar documento
        $path = $request->file('document')->store('approval_documents', 'public');

        // Actualizar la venta o cotización
        if ($data['type'] === 'sale') {
            $sale = \App\Models\Sale::find($data['id']);
            if (!$sale || $sale->client_id != $client->id) {
                return response()->json(['error' => 'Venta no encontrada'], 404);
            }
            $sale->approved_at = now();
            $sale->approval_document_path = $path;
            $sale->approval_notes = $data['notes'] ?? null;
            $sale->save();
        } else {
            $quote = \App\Models\Quote::find($data['id']);
            if (!$quote || $quote->client_id != $client->id) {
                return response()->json(['error' => 'Cotización no encontrada'], 404);
            }
            $quote->approved_at = now();
            $quote->approval_document_path = $path;
            $quote->approval_notes = $data['notes'] ?? null;
            $quote->save();
        }

        return response()->json([
            'message' => 'Documento subido y aprobación registrada',
            'document_path' => $path,
        ]);
    }

    /**
     * Establecer contraseña directamente (para administradores)
     */
    public function setPasswordDirect(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'password' => 'required|string|min:6',
        ]);

        $client = Client::find($data['client_id']);

        if (!$client) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        $client->password = Hash::make($data['password']);
        $client->password_set_at = now();
        $client->save();

        return response()->json([
            'message' => 'Contraseña establecida correctamente',
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
            ],
        ]);
    }

    /**
     * Cerrar sesión del cliente
     */
    public function logout(Request $request)
    {
        $token = $request->header('Authorization');
        
        if ($token) {
            $token = str_replace('Bearer ', '', $token);
            $client = Client::where('approval_token', hash('sha256', $token))->first();
            
            if ($client) {
                $client->approval_token = null;
                $client->approval_token_expires_at = null;
                $client->save();
            }
        }

        return response()->json(['message' => 'Sesión cerrada']);
    }
}
