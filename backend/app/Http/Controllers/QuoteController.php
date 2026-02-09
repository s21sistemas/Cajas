<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Quote;
use App\Models\Client;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class QuoteController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('quotes.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('quotes.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 15);
        $items = Quote::with('client')->orderByDesc('created_at')->paginate($perPage);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:255|unique:quotes,code',
            'client_id' => 'required|exists:clients,id',
            'title' => 'required|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,sent,approved,rejected,expired',
            'valid_until' => 'required|date',
            'created_by' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $client = Client::findOrFail($data['client_id']);
        $data['client_name'] = $client->name;
        $data['items'] = $data['items'] ?? 0;
        $data['subtotal'] = $data['subtotal'] ?? 0;
        $data['tax'] = $data['tax'] ?? 0;
        $data['total'] = $data['total'] ?? 0;
        $data['status'] = $data['status'] ?? 'draft';

        $item = Quote::create($data)->load('client');
        return response()->json($item, 201);
    }

    public function show(Quote $quote)
    {
        return response()->json($quote->load('client'));
    }

    public function update(Request $request, Quote $quote)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'items' => 'sometimes|integer|min:0',
            'subtotal' => 'sometimes|numeric|min:0',
            'tax' => 'sometimes|numeric|min:0',
            'total' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:draft,sent,approved,rejected,expired',
            'valid_until' => 'sometimes|date',
            'created_by' => 'sometimes|required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $quote->update($validator->validated());
        return response()->json($quote->load('client'));
    }

    public function destroy(Quote $quote)
    {
        $quote->delete();
        return response()->json(null, 204);
    }
}
