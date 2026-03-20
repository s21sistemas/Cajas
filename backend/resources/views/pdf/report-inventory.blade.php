<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Inventario</title>
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
        .low-stock { background-color: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte de Inventario</h1>
        <p>Fecha: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="label">Total Items</div>
            <div class="value">{{ $summary['total_items'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Valor Total</div>
            <div class="value">${{ number_format($summary['total_value'], 2) }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Bajo Stock</div>
            <div class="value">{{ $summary['low_stock_count'] }}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Mín</th>
                <th>Máx</th>
                <th>Costo Unit.</th>
                <th>Valor Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr class="{{ $item['quantity'] <= $item['min_stock'] ? 'low-stock' : '' }}">
                <td>{{ $item['code'] }}</td>
                <td>{{ $item['name'] }}</td>
                <td>{{ $item['category'] }}</td>
                <td>{{ $item['quantity'] }}</td>
                <td>{{ $item['unit'] }}</td>
                <td>{{ $item['min_stock'] }}</td>
                <td>{{ $item['max_stock'] }}</td>
                <td>${{ number_format($item['unit_cost'], 2) }}</td>
                <td>${{ number_format($item['total_value'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
