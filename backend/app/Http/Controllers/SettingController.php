<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Validator;
use \Spatie\Permission\Middleware\PermissionMiddleware;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SettingController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(
                PermissionMiddleware::using('settings.view'),
                only: ['index', 'show']
            ),

            new Middleware(
                PermissionMiddleware::using('settings.create'),
                only: ['store']
            ),

            new Middleware(
                PermissionMiddleware::using('settings.edit'),
                only: ['update']
            ),

            new Middleware(
                PermissionMiddleware::using('settings.delete'),
                only: ['destroy']
            ),
        ];
    }

    /**
     * Devuelve todos los settings agrupados por módulo.
     * 
     * GET /api/settings
     */
    public function index(Request $request)
    {
        $modules = [
            'company',
            'production',
            'notifications',
            'system'
        ];

        // Obtiene todos los settings de los módulos relevantes usando el modelo
        $settings = Setting::whereIn('module', $modules)->get();

        // Agrupa los settings por módulo y convierte a formato opción-valor
        $result = [];
        foreach ($modules as $module) {
            $group = $settings->where('module', $module);
            $data = [];
            foreach ($group as $setting) {
                // value puede ser JSON o string escalar. Intenta decodificar como JSON,
                // si falla devuelve el string original
                if (is_string($setting->value)) {
                    $decoded = json_decode($setting->value, true);
                    $data[$setting->key] = ($decoded !== null || json_last_error() === JSON_ERROR_NONE) 
                        ? $decoded 
                        : $setting->value;
                } else {
                    $data[$setting->key] = $setting->value;
                }
            }
            $result[$module] = $data;
        }

        return response()->json($result);
    }

    /**
     * Devuelve los settings de un módulo específico.
     * GET /api/settings/{module}
     */
    public function show($module)
    {
        $settings = Setting::where('module', $module)->get();

        if ($settings->isEmpty()) {
            return response()->json([
                'message' => 'Módulo no encontrado o sin configuraciones.'
            ], 404);
        }

        $data = [];
        foreach ($settings as $setting) {
            // value puede ser JSON o string escalar. Intenta decodificar como JSON,
            // si falla devuelve el string original
            if (is_string($setting->value)) {
                $decoded = json_decode($setting->value, true);
                $data[$setting->key] = ($decoded !== null || json_last_error() === JSON_ERROR_NONE) 
                    ? $decoded 
                    : $setting->value;
            } else {
                $data[$setting->key] = $setting->value;
            }
        }

        return response()->json([
            'module' => $module,
            'settings' => $data
        ]);
    }

    /**
     * Actualiza o crea un setting (key->value) de determinado módulo.
     * PUT /api/settings/{module}/{key}
     * Body: { "value": [any JSON] }
     */
    public function update(Request $request, $module, $key)
    {
        $validator = Validator::make($request->all(), [
            'value' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'La clave value es requerida.',
                'errors' => $validator->errors()
            ], 422);
        }

        $value = $request->input('value');

        // Almacena el valor como JSON (si es array u objeto) o cadena escalar
        $payload = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE);

        $setting = Setting::where('module', $module)->where('key', $key)->first();

        if ($setting) {
            $setting->value = $payload;
            $setting->save();
        } else {
            $setting = Setting::create([
                'module' => $module,
                'key' => $key,
                'value' => $payload,
            ]);
        }

        $decoded = json_decode($payload, true);
        $value = json_last_error() === JSON_ERROR_NONE ? $decoded : $payload;

        return response()->json([
            'message' => 'Setting guardado correctamente.',
            'module' => $module,
            'key' => $key,
            'value' => $value
        ]);
    }

    /**
     * Elimina un setting específico por módulo y key.
     * DELETE /api/settings/{module}/{key}
     */
    public function destroy($module, $key)
    {
        $setting = Setting::where('module', $module)->where('key', $key)->first();

        if ($setting) {
            $setting->delete();
            return response()->json([
                'message' => 'Setting eliminado correctamente.',
                'module' => $module,
                'key' => $key
            ]);
        } else {
            return response()->json([
                'message' => 'Setting no encontrado.',
                'module' => $module,
                'key' => $key
            ], 404);
        }
    }
}
