<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PermissionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('permissions.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('permissions.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('permissions.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('permissions.delete'),
                only: ['destroy']
            ),
        ];
    }

    public function index()
    {
        return response()->json(
            Permission::select('id', 'name')->get()
        );
    }
}
