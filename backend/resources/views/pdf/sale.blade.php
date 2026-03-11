<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Venta {{ $sale->code }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; font-family: Arial, sans-serif; font-size: 11px; color: #333; }
        .container { width: 100%; max-width: 95%; margin: 0 auto; padding: 10px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 12px; }
        .logo-container { width: 150px; }
        .logo-container img { flex:2; max-width: 100%; height: auto; }
        .company-info { flex: 1; margin-left: 15px; }
        .company-info h1 { font-size: 20px; color: #2c3e50; margin-bottom: 4px; }
        .company-info p { font-size: 10px; margin: 2px 0; }
        .sale-info { text-align: right; }
        .sale-info h2 { font-size: 18px; color: #2c3e50; }
        .sale-info p { margin: 2px 0; font-size: 10px; }
        .status-badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        .status-pending { background: #f39c12; color: white; }
        .status-paid { background: #27ae60; color: white; }
        .status-overdue { background: #e74c3c; color: white; }
        .status-cancelled { background: #95a5a6; color: white; }
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
        .payment-info { background: #e8f4f8; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
        .payment-info p { margin: 3px 0; font-size: 10px; }
        .payment-info strong { color: #2c3e50; }
    </style>
</head>
<body>
    <div class="container">
        <table style="width:100%;">
            <tr>
                <td style="width:150px; vertical-align:top;">
                    @if(!empty($logoData))
                        <img src="{{ $logoData }}" style="max-width:120px;">
                    @endif
                </td>

                <td style="width:50%;">
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
                </td>
            </tr>
        </table>

        <div class="header">
            <div class="sale-info">
                <h2>VENTA</h2>
                <p><strong>{{ $sale->code }}</strong></p>
                <p>Fecha: {{ $sale->created_at->format('d/m/Y') }}</p>
                <p>Vence: {{ $sale->due_date ? \Carbon\Carbon::parse($sale->due_date)->format('d/m/Y') : 'N/A' }}</p>
                <p>
                    <span class="status-badge status-{{ $sale->status }}">
                        @switch($sale->status)
                            @case('pending') Pendiente @break
                            @case('paid') Pagada @break
                            @case('overdue') Vencida @break
                            @case('cancelled') Cancelada @break
                            @default {{ $sale->status }}
                        @endswitch
                    </span>
                </p>
            </div>
        </div>

        <div class="client-section">
            <h3>CLIENTE</h3>
            <div class="client-info">
                <p><strong>{{ $sale->client_name }}</strong></p>
                @if($sale->client)
                    <p>{{ $sale->client->address ?? '' }}</p>
                    <p>RFC: {{ $sale->client->rfc ?? 'N/A' }}</p>
                    <p>Tel: {{ $sale->client->phone ?? 'N/A' }}</p>
                    <p>Email: {{ $sale->client->email ?? 'N/A' }}</p>
                @endif
            </div>
        </div>

        @if($sale->quote)
        <div class="client-section">
            <h3>COTIZACIÓN RELACIONADA</h3>
            <div class="client-info">
                <p><strong>{{ $sale->quote->code }}</strong></p>
                <p>Fecha: {{ $sale->quote->created_at->format('d/m/Y') }}</p>
            </div>
        </div>
        @endif

        <div class="payment-info">
            <p><strong>Información de Pago:</strong></p>
            <p>Método: {{ $sale->payment_method ?? 'No especificado' }}</p>
            <p>Tipo: {{ $sale->payment_type === 'cash' ? 'Contado' : 'Crédito' }}</p>
            @if($sale->payment_type === 'credit' && $sale->credit_days)
            <p>Días de crédito: {{ $sale->credit_days }} días</p>
            @endif
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>No. Parte</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">Descuento</th>
                    <th class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @forelse($sale->saleItems as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item->description }}</td>
                    <td>{{ $item->part_number ?? 'N/A' }}</td>
                    <td class="text-center">{{ number_format($item->quantity, 2) }} {{ $item->unit }}</td>
                    <td class="text-right">${{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">
                        @if($item->discount_percentage > 0)
                        {{ number_format($item->discount_percentage, 2) }}%
                        @elseif($item->discount_amount > 0)
                        ${{ number_format($item->discount_amount, 2) }}
                        @else
                        -
                        @endif
                    </td>
                    <td class="text-right">${{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="7" class="text-center">No hay items registrados</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>${{ number_format($sale->subtotal, 2) }}</span>
            </div>
            <div class="totals-row">
                <span>Impuesto ({{ $sale->tax_rate }}%):</span>
                <span>${{ number_format($sale->tax, 2) }}</span>
            </div>
            <div class="totals-row total">
                <span>TOTAL:</span>
                <span>${{ number_format($sale->total, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>Gracias por su preferencia</p>
            <p>Este documento es una representación impresa de una venta</p>
        </div>
    </div>
</body>
</html>
