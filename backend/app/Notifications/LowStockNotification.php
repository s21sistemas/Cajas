<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $productName;
    public $currentStock;
    public $minStock;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $productName, float $currentStock, float $minStock)
    {
        $this->productName = $productName;
        $this->currentStock = $currentStock;
        $this->minStock = $minStock;
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
            ->subject('Alerta: Stock Bajo')
            ->line('El producto ' . $this->productName . ' tiene stock bajo.')
            ->line('Stock actual: ' . $this->currentStock)
            ->line('Stock mínimo: ' . $this->minStock)
            ->action('Ver Inventario', url('/almacen/materiales'))
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
            'type' => 'low_stock',
            'title' => 'Alerta: Stock Bajo',
            'message' => 'El producto ' . $this->productName . ' tiene stock bajo.',
            'product_name' => $this->productName,
            'current_stock' => $this->currentStock,
            'min_stock' => $this->minStock,
            'url' => '/almacen/materiales',
        ];
    }
}
