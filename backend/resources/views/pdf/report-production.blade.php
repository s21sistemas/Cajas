<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Producción</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #333; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status { padding: 3px 8px; border-radius: 3px; font-size: 9px; }
        .status-completed { background-color: #d4edda; color: #155724; }
        .status-in_progress { background-color: #cce5ff; color: #004085; }
        .status-pending { background-color: #fff3cd; color: #856404; }
        .status-cancelled { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte de Producción</h1>
        <p>Fecha: {{ now()->format('d/m/Y H:i') }}</p>
        <p>Período: {{ $startDate }} - {{ $endDate }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Proceso</th>
                <th>Operador</th>
                <th>Máquina</th>
                <th>Orden</th>
                <th>Meta</th>
                <th>Buenas</th>
                <th>Scrap</th>
                <th>Estado</th>
                <th>Calidad</th>
                <th>Inicio</th>
                <th>Fin</th>
            </tr>
        </thead>
        <tbody>
            @foreach($productions as $p)
            <tr>
                <td>{{ $p['code'] }}</td>
                <td>{{ $p['product'] }}</td>
                <td>{{ $p['process'] }}</td>
                <td>{{ $p['operator'] }}</td>
                <td>{{ $p['machine'] }}</td>
                <td>{{ $p['work_order'] }}</td>
                <td>{{ $p['target_parts'] }}</td>
                <td>{{ $p['good_parts'] }}</td>
                <td>{{ $p['scrap_parts'] }}</td>
                <td>
                    <span class="status status-{{ $p['status'] }}">
                        {{ ucfirst($p['status']) }}
                    </span>
                </td>
                <td>{{ $p['quality_status'] }}</td>
                <td>{{ $p['start_time'] ? (is_string($p['start_time']) ? \Carbon\Carbon::parse($p['start_time'])->format('d/m/Y H:i') : $p['start_time']) : '-' }}</td>
                <td>{{ $p['end_time'] ? (is_string($p['end_time']) ? \Carbon\Carbon::parse($p['end_time'])->format('d/m/Y H:i') : $p['end_time']) : '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
