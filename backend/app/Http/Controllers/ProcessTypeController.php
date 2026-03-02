<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProcessType;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProcessTypeController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('process-types.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('process-types.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('process-types.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('process-types.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(ProcessType::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:process_types,name',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $item = ProcessType::create($validator->validated());
        return response()->json($item, 201);
    }

    public function show(ProcessType $processType)
    {
        return response()->json($processType);
    }

    public function update(Request $request, ProcessType $processType)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:process_types,name,' . $processType->id,
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $processType->update($validator->validated());
        return response()->json($processType);
    }

    public function destroy(ProcessType $processType)
    {
        $processType->delete();
        return response()->json(null, 204);
    }
}
