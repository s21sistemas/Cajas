<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización {{ $quote->code }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .company-info h1 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .quote-info {
            text-align: right;
        }
        .quote-info h2 {
            font-size: 18px;
            color: #2c3e50;
        }
        .quote-info p {
            margin: 3px 0;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }
        .status-draft { background: #f39c12; color: white; }
        .status-sent { background: #3498db; color: white; }
        .status-approved { background: #27ae60; color: white; }
        .status-rejected { background: #e74c3c; color: white; }
        .status-expired { background: #95a5a6; color: white; }
        .client-section {
            margin-bottom: 30px;
        }
        .client-section h3 {
            font-size: 14px;
            color: #2c3e50;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .client-info p {
            margin: 3px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th {
            background: #2c3e50;
            color: white;
            padding: 10px 8px;
            text-align: left;
            font-size: 11px;
        }
        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
        }
        .items-table tbody tr:nth-child(even) {
            background: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals-section {
            width: 300px;
            margin-left: auto;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .totals-row.total {
            font-size: 16px;
            font-weight: bold;
            border-bottom: 2px solid #333;
            margin-top: 5px;
            padding-top: 10px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
        .valid-until {
            background: #fff3cd;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <h1>EMPRESA</h1>
                <p>RFC: XXX000000XXX</p>
                <p>Dirección de la empresa</p>
                <p>Tel: (000) 000-0000</p>
            </div>
            <div class="quote-info">
                <h2>COTIZACIÓN</h2>
                <p><strong>{{ $quote->code }}</strong></p>
                <p>Fecha: {{ $quote->created_at->format('d/m/Y') }}</p>
                <p>Válida hasta: {{ $quote->valid_until->format('d/m/Y') }}</p>
                <p>
                    <span class="status-badge status-{{ $quote->status }}">
                        {{ $quote->status }}
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
                <span>${{ number_format($quote->subtotal, 2) }}</span>
            </div>
            <div class="totals-row">
                <span>IVA (16%):</span>
                <span>${{ number_format($quote->tax, 2) }}</span>
            </div>
            <div class="totals-row total">
                <span>TOTAL:</span>
                <span>${{ number_format($quote->total, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>Esta cotización es válida hasta el {{ $quote->valid_until->format('d/m/Y') }}.</p>
            <p>Los precios pueden estar sujetos a cambios sin previo aviso.</p>
            <p>Generado el {{ now()->format('d/m/Y H:i') }}</p>
        </div>
    </div>
</body>
</html>