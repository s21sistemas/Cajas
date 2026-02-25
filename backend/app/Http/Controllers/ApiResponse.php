<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Respuesta exitosa estándar
     */
    public static function success(mixed $data = null, string $message = 'Operación exitosa', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'errors' => null,
        ], $statusCode);
    }

    /**
     * Respuesta de error
     */
    public static function error(string $message = 'Error occurred', mixed $errors = null, int $statusCode = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data' => null,
            'message' => $message,
            'errors' => $errors,
        ], $statusCode);
    }

    /**
     * Respuesta de validación fallida
     */
    public static function validationError(mixed $errors, string $message = 'Error de validación'): JsonResponse
    {
        return self::error($message, $errors, 422);
    }

    /**
     * Respuesta de no encontrado
     */
    public static function notFound(string $message = 'Recurso no encontrado'): JsonResponse
    {
        return self::error($message, null, 404);
    }

    /**
     * Respuesta de no autorizado
     */
    public static function unauthorized(string $message = 'No autorizado'): JsonResponse
    {
        return self::error($message, null, 401);
    }

    /**
     * Respuesta de prohibido
     */
    public static function forbidden(string $message = 'Acceso prohibido'): JsonResponse
    {
        return self::error($message, null, 403);
    }

    /**
     * Respuesta de recurso creado
     */
    public static function created(mixed $data = null, string $message = 'Recurso creado correctamente'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    /**
     * Respuesta de eliminado
     */
    public static function deleted(string $message = 'Recurso eliminado correctamente'): JsonResponse
    {
        return self::success(null, $message, 200);
    }

    /**
     * Respuesta paginada
     * IMPORTANTE: Las respuestas paginadas NO deben envolverse en success
     * Se retorna el paginador directamente según las reglas del proyecto
     */
    public static function paginated(mixed $data, string $message = 'Operación exitosa'): JsonResponse
    {
        // Retornar el paginador directamente sin envoltura
        return response()->json($data, 200);
    }
}
