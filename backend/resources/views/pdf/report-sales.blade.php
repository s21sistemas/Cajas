<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Ventas</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; }
        .summary { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 10px; color: #666; }
        .summary-item .value { font-size: 16px; font-weight: bold; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #333; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status { padding: 3px 8px; border-radius: 3px; font-size: 9px; }
        .status-paid { background-color: #d4edda; color: #155724; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte de Ventas</h1>
        <p>Fecha: {{ now()->format('d/m/Y H:i') }}</p>
        <p>Período: {{ $startDate }} - {{ $endDate }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="label">Total Ventas</div>
            <div class="value">{{ $summary['total_sales'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Ingresos</div>
            <div class="value">${{ number_format($summary['total_revenue'], 2) }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Pendientes</div>
            <div class="value">{{ $summary['pending'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Pagadas</div>
            <div class="value">{{ $summary['paid'] }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Fecha</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sales as $sale)
            <tr>
                <td>{{ $sale['code'] }}</td>
                <td>{{ $sale['client'] }}</td>
                <td>${{ number_format($sale['subtotal'], 2) }}</td>
                <td>${{ number_format($sale['tax'], 2) }}</td>
                <td>${{ number_format($sale['total'], 2) }}</td>
                <td>
                    <span class="status status-{{ $sale['status'] }}">
                        {{ ucfirst($sale['status']) }}
                    </span>
                </td>
                <td>{{ $sale['payment_type'] === 'cash' ? 'Contado' : 'Crédito' }}</td>
                <td>{{ \Carbon\Carbon::parse($sale['created_at'])->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
