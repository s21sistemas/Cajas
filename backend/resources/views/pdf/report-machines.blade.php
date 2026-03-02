<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Máquinas</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #333; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status { padding: 3px 8px; border-radius: 3px; font-size: 9px; }
        .status-available { background-color: #d4edda; color: #155724; }
        .status-running { background-color: #cce5ff; color: #004085; }
        .status-maintenance { background-color: #fff3cd; color: #856404; }
        .status-offline { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte de Máquinas</h1>
        <p>Fecha: {{ now()->format('d/m/Y H:i') }}</p>
        <p>Período: {{ $startDate }} - {{ $endDate }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Marca/Modelo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Producciones</th>
                <th> Piezas Buenas</th>
                <th>Scrap</th>
                <th>Horas</th>
                <th>Utilización %</th>
            </tr>
        </thead>
        <tbody>
            @foreach($machines as $machine)
            <tr>
                <td>{{ $machine['code'] }}</td>
                <td>{{ $machine['name'] }}</td>
                <td>{{ $machine['type'] }}</td>
                <td>{{ $machine['brand'] }} {{ $machine['model'] }}</td>
                <td>{{ $machine['location'] }}</td>
                <td>
                    <span class="status status-{{ $machine['status'] }}">
                        {{ ucfirst($machine['status']) }}
                    </span>
                </td>
                <td>{{ $machine['total_productions'] }}</td>
                <td>{{ $machine['total_parts'] }}</td>
                <td>{{ $machine['total_scrap'] }}</td>
                <td>{{ $machine['total_hours'] }}</td>
                <td>{{ $machine['utilization'] }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
