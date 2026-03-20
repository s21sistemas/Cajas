<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Financiero</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; }
        .summary { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 10px; color: #666; }
        .summary-item .value { font-size: 16px; font-weight: bold; color: #333; }
        .summary-item .value.positive { color: #28a745; }
        .summary-item .value.negative { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #333; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .type-income { color: #28a745; }
        .type-expense { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte Financiero</h1>
        <p>Fecha: {{ now()->format('d/m/Y H:i') }}</p>
        <p>Período: {{ $startDate }} - {{ $endDate }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="label">Ingresos</div>
            <div class="value positive">${{ number_format($summary['total_income'], 2) }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Egresos</div>
            <div class="value negative">${{ number_format($summary['total_expenses'], 2) }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Balance</div>
            <div class="value {{ $summary['balance'] >= 0 ? 'positive' : 'negative' }}">
                ${{ number_format($summary['balance'], 2) }}
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Referencia</th>
                <th>Monto</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($movements as $m)
            <tr>
                <td>{{ \Carbon\Carbon::parse($m['date'])->format('d/m/Y') }}</td>
                <td class="type-{{ $m['type'] }}">
                    {{ $m['type'] === 'income' ? 'Ingreso' : 'Egreso' }}
                </td>
                <td>{{ $m['category'] }}</td>
                <td>{{ $m['description'] }}</td>
                <td>{{ $m['reference'] }}</td>
                <td class="type-{{ $m['type'] }}">${{ number_format($m['amount'], 2) }}</td>
                <td>{{ ucfirst($m['status']) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
