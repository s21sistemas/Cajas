<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ $quote->code }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; font-family: Arial, sans-serif; font-size: 11px; color: #333; }
        .container { width: 100%; max-width: 95%; margin: 0 auto; padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 12px; }
        .logo-container { width: 150px; }
        .logo-container img { max-width: 100%; height: auto; }
        .company-info { flex: 1; margin-left: 15px; }
        .company-info h1 { font-size: 20px; color: #2c3e50; margin-bottom: 4px; }
        .company-info p { font-size: 10px; margin: 2px 0; }
        .quote-info { text-align: right; }
        .quote-info h2 { font-size: 18px; color: #2c3e50; }
        .quote-info p { margin: 2px 0; font-size: 10px; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        .status-draft { background: #f39c12; color: white; }
        .status-sent { background: #3498db; color: white; }
        .status-approved { background: #27ae60; color: white; }
        .status-rejected { background: #e74c3c; color: white; }
        .status-expired { background: #95a5a6; color: white; }
        .client-section { margin-bottom: 15px; }
        .client-section h3 { font-size: 13px; color: #2c3e50; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .client-info p { margin: 2px 0; font-size: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        .items-table th { background: #2c3e50; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
        .items-table td { padding: 6px; border-bottom: 1px solid #ddd; }
        .items-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals-section { width: 220px; margin-left: auto; }
        .totals-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; font-size: 10px; }
        .totals-row.total { font-size: 14px; font-weight: bold; border-bottom: 2px solid #333; margin-top: 5px; padding-top: 8px; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 9px; }
        .valid-until { background: #fff3cd; padding: 6px; border-radius: 3px; margin-bottom: 12px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                @if(!empty($logoData))
                <img src="{{ $logoData }}" alt="Logo">
                @endif
            </div>
            <div class="company-info">
                <h1>{{ $company['name'] ?? 'EMPRESA' }}</h1>
                <p>RFC: {{ $company['rfc'] ?? 'XXX000000XXX' }}</p>
                <p>{{ $company['address'] ?? 'Dirección de la empresa' }}</p>
                <p>{{ $company['city'] ?? '' }}</p>
                <p>Tel: {{ $company['phone'] ?? '(000) 000-0000' }}</p>
                @if(!empty($company['email']))
                <p>Email: {{ $company['email'] }}</p>
                @endif
                @if(!empty($company['website']))
                <p>Web: {{ $company['website'] }}</p>
                @endif
            </div>
            <div class="quote-info">
                <h2>COTIZACIÓN</h2>
                <p><strong>{{ $quote->code }}</strong></p>
                <p>Fecha: {{ $quote->created_at ? $quote->created_at->format('d/m/Y') : 'N/A' }}</p>
                <p>Válida hasta: {{ $quote->valid_until ? $quote->valid_until->format('d/m/Y') : 'N/A' }}</p>
                <p>
                    <span class="status-badge status-{{ $quote->status }}">
                        @switch($quote->status)
                            @case('draft') Borrador @break
                            @case('sent') Enviada @break
                            @case('approved') Aprobada @break
                            @case('rejected') Rechazada @break
                            @case('expired') Expirada @break
                            @default {{ $quote->status }}
                        @endswitch
                    </span>
                </p>
            </div>
        </div>

        <div class="client-section">
            <h3>CLIENTE</h3>
            <div class="client-info">
                <p><strong>{{ $quote->client_name }}</strong></p>
                @if($quote->client)
                    <p>{{ $quote->client->address ?? '' }}</p>
                    <p>RFC: {{ $quote->client->rfc ?? 'N/A' }}</p>
                    <p>Tel: {{ $quote->client->phone ?? 'N/A' }}</p>
                    <p>Email: {{ $quote->client->email ?? 'N/A' }}</p>
                @endif
            </div>
        </div>

        <div class="valid-until">
            <strong>Título:</strong> {{ $quote->title }}
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th class="text-center" style="width: 40px;">#</th>
                    <th style="width: 80px;">Unidad</th>
                    <th style="width: 100px;">No. Parte</th>
                    <th>Descripción</th>
                    <th class="text-right" style="width: 60px;">Cant.</th>
                    <th class="text-right" style="width: 100px;">P. Unitario</th>
                    <th class="text-right" style="width: 100px;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($quote->items as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $item->unit ?? '-' }}</td>
                    <td>{{ $item->part_number ?? '-' }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="text-right">{{ number_format($item->quantity, 2) }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">${{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>${{ number_format($quote->subtotal ?? 0, 2) }}</span>
            </div>
            <div class="totals-row">
                <span>IVA (${{ number_format($quote->tax_percentage ?? 0, 0) }}%):</span>
                <span>${{ number_format($quote->tax ?? 0, 2) }}</span>
            </div>
            <div class="totals-row total">
                <span>TOTAL:</span>
                <span>${{ number_format($quote->total ?? 0, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>Esta cotización es válida hasta el {{ $quote->valid_until ? $quote->valid_until->format('d/m/Y') : 'N/A' }}.</p>
            <p>Los precios pueden estar sujetos a cambios sin previo aviso.</p>
            <p>Generado el {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>
</body>
</html>