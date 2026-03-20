<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });

// Ruta de login para redirigir errores de autenticación (API)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
});
