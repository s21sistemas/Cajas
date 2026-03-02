<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class MaintenanceReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $machineName;
    public $maintenanceType;
    public $dueDate;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $machineName, string $maintenanceType, string $dueDate)
    {
        $this->machineName = $machineName;
        $this->maintenanceType = $maintenanceType;
        $this->dueDate = $dueDate;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject('Recordatorio: Mantenimiento Programado')
            ->line('La máquina ' . $this->machineName . ' requiere mantenimiento.')
            ->line('Tipo: ' . $this->maintenanceType)
            ->line('Fecha programada: ' . $this->dueDate)
            ->action('Ver Órdenes de Mantenimiento', url('/mantenimiento'))
            ->line('Gracias por usar nuestra aplicación!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'maintenance_reminder',
            'title' => 'Recordatorio: Mantenimiento',
            'message' => 'La máquina ' . $this->machineName . ' requiere mantenimiento.',
            'machine_name' => $this->machineName,
            'maintenance_type' => $this->maintenanceType,
            'due_date' => $this->dueDate,
            'url' => '/mantenimiento',
        ];
    }
}
