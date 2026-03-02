<?php

namespace App\Mail;

use App\Models\Quote;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class QuoteMail extends Mailable
{
    use Queueable, SerializesModels;

    /** @var Quote */
    public $quote;

    /** @var string|null */
    public $subject;

    /** @var string|null */
    public $body;

    public function __construct(Quote $quote, ?string $subject = null, ?string $body = null)
    {
        $this->quote = $quote;
        $this->subject = $subject;
        $this->body = $body;
    }

    public function envelope(): Envelope
    {
        // Cargar relaciones si no están cargadas
        $this->quote->loadMissing(['client', 'items']);
        
        $toEmail = $this->quote->client?->email ?? 'cliente@ejemplo.com';
        $subject = $this->subject ?? "Cotización {$this->quote->code} - " . ($this->quote->title ?? 'Nueva Cotización');

        return new Envelope(
            subject: $subject,
            to: [$toEmail]
        );
    }

    public function content(): Content
    {
        // Cargar relaciones si no están cargadas
        $this->quote->loadMissing(['client', 'items']);

        return new Content(
            view: 'emails.quote',
            with: [
                'quote' => $this->quote,
                'body' => $this->body ?? 'Adjuntamos la cotización solicitada. Quedamos a sus órdenes para cualquier duda o comentario.',
            ],
        );
    }

    public function attachments(): array
    {
        try {
            // Cargar relaciones si no están cargadas
            $this->quote->loadMissing(['client', 'items']);

            // Generar el PDF
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.quote', [
                'quote' => $this->quote
            ]);

            return [
                Attachment::fromData(
                    fn () => $pdf->output(),
                    'cotizacion-' . $this->quote->code . '.pdf'
                )
                ->withMime('application/pdf'),
            ];
        } catch (\Exception $e) {
            // Si falla la generación del PDF, enviar sin adjunto
            return [];
        }
    }
}
