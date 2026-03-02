<?php

namespace App\Services;

use App\Models\Setting;
use App\Notifications\LowStockNotification;
use App\Notifications\MaintenanceReminderNotification;
use App\Notifications\ProductionAlertNotification;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    /**
     * Verifica si un tipo de notificación está habilitado en la configuración
     */
    public static function isEnabled(string $settingKey): bool
    {
        $setting = Setting::where('module', 'notifications')
            ->where('key', $settingKey)
            ->first();

        if (!$setting) {
            return false;
        }

        $value = json_decode($setting->value, true);
        return $value === true || $value === 'true' || $value === 1;
    }

    /**
     * Envía notificación de stock bajo si está habilitada
     */
    public static function sendLowStockNotification($notifiable, string $productName, float $currentStock, float $minStock): void
    {
        if (!self::isEnabled('lowStockAlerts')) {
            return;
        }

        Notification::send($notifiable, new LowStockNotification($productName, $currentStock, $minStock));
    }

    /**
     * Envía recordatorio de mantenimiento si está habilitado
     */
    public static function sendMaintenanceReminder($notifiable, string $machineName, string $maintenanceType, string $dueDate): void
    {
        if (!self::isEnabled('maintenanceReminders')) {
            return;
        }

        Notification::send($notifiable, new MaintenanceReminderNotification($machineName, $maintenanceType, $dueDate));
    }

    /**
     * Envía alerta de producción si está habilitada
     */
    public static function sendProductionAlert($notifiable, string $orderNumber, string $alertType, string $message): void
    {
        if (!self::isEnabled('productionAlerts')) {
            return;
        }

        Notification::send($notifiable, new ProductionAlertNotification($orderNumber, $alertType, $message));
    }

    /**
     * Envía notificación por email si está habilitado globalmente
     */
    public static function sendEmailNotification($notifiable, $notification): void
    {
        if (!self::isEnabled('emailAlerts')) {
            // Si los emails están deshabilitados, solo guardar en DB
            $notifiable->notify($notification);
            return;
        }

        Notification::send($notifiable, $notification);
    }
}
