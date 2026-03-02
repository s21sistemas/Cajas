<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ProductionAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $orderNumber;
    public $alertType;
    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $orderNumber, string $alertType, string $message)
    {
        $this->orderNumber = $orderNumber;
        $this->alertType = $alertType;
        $this->message = $message;
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
        $subject = match($this->alertType) {
            'delayed' => 'Alerta: Orden Retrasada',
            'quality_issue' => 'Alerta: Problema de Calidad',
            'completed' => 'Notificación: Orden Completada',
            default => 'Alerta de Producción'
        };

        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject($subject)
            ->line('Orden de trabajo: ' . $this->orderNumber)
            ->line($this->message)
            ->action('Ver Producción', url('/produccion'))
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
            'type' => 'production_alert',
            'title' => match($this->alertType) {
                'delayed' => 'Orden Retrasada',
                'quality_issue' => 'Problema de Calidad',
                'completed' => 'Orden Completada',
                default => 'Alerta de Producción'
            },
            'message' => $this->message,
            'order_number' => $this->orderNumber,
            'alert_type' => $this->alertType,
            'url' => '/produccion',
        ];
    }
}
