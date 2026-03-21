<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Cotización</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
        }
        .quote-info {
            background: white;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .quote-info p {
            margin: 5px 0;
        }
        .label {
            font-weight: bold;
            color: #2c3e50;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
        }
        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Nueva Cotización</h1>
    </div>
    
    <div class="content">
        <p>Estimado cliente: <strong>{{ $quote->client_name }}</strong></p>
        
        <p>{{ $body }}</p>
        
        <div class="quote-info">
            <p><span class="label">Código de Cotización:</span> {{ $quote->code }}</p>
            <p><span class="label">Título:</span> {{ $quote->title }}</p>
            <p><span class="label">Fecha de elaboración:</span> {{ $quote->created_at ? $quote->created_at->format('d/m/Y') : 'N/A' }}</p>
            <p><span class="label">Válida hasta:</span> {{ $quote->valid_until ? $quote->valid_until->format('d/m/Y') : 'N/A' }}</p>
            <p><span class="label">Total:</span> ${{ number_format($quote->total ?? 0, 2) }} MXN</p>
        </div>
        
        <p>Adjunto encontrará el documento PDF con el detalle completo de la cotización.</p>
        
        @if(isset($approvalUrl))
        <div style="background: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2e7d32; margin-top: 0;">Aprobación de Cotización</h3>
            <p>Puede revisar y aprobar esta cotización en línea haciendo clic en el siguiente botón:</p>
            <a href="{{ $approvalUrl }}" class="btn" style="background: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Revisar y Aprobar Cotización</a>
            <p style="font-size: 12px; color: #666;">Este link es válido por 7 días.</p>
        </div>
        @endif
        
        <p>Si tiene alguna duda o requiere más información, no dude en contactarnos.</p>
        
        <p>Saludos cordiales,<br>
        <strong>Equipo de Ventas</strong></p>
    </div>
    
    <div class="footer">
        <p>Este correo fue enviado a {{ $quote->client->email ?? $quote->client_name }}</p>
        <p>© {{ date('Y') }} - Todos los derechos reservados</p>
    </div>
</body>
</html>
