<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Ejecutivo</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 15px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header h1 { margin: 0; color: #333; }
        .period { font-size: 12px; color: #666; margin-top: 5px; }
        .summary { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 10px; color: #666; }
        .summary-item .value { font-size: 16px; font-weight: bold; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; page-break-inside: avoid; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
        th { background-color: #333; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .section-title { margin-top: 20px; margin-bottom: 10px; font-size: 14px; font-weight: bold; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .badge { padding: 3px 8px; border-radius: 3px; font-size: 9px; }
        .badge-active { background-color: #d4edda; color: #155724; }
        .badge-inactive { background-color: #f8d7da; color: #721c24; }
        .roles-list, .permissions-list { font-size: 9px; color: #666; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Villazco - Reporte Ejecutivo</h1>
        <p>Usuarios, Roles y Permisos</p>
        <p class="period">Período: {{ $startDate }} - {{ $endDate }}</p>
        <p>Fecha de generación: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="label">Total Usuarios</div>
            <div class="value">{{ $summary['total_users'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Usuarios Activos</div>
            <div class="value">{{ $summary['active_users'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Total Roles</div>
            <div class="value">{{ $summary['total_roles'] }}</div>
        </div>
        <div class="summary-item">
            <div class="label">Total Permisos</div>
            <div class="value">{{ $summary['total_permissions'] }}</div>
        </div>
    </div>

    <div class="section-title">Usuarios</div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Roles</th>
                <th>Permisos</th>
                <th>Fecha Registro</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $user)
            <tr>
                <td>{{ $user['id'] }}</td>
                <td>{{ $user['name'] }}</td>
                <td>{{ $user['email'] }}</td>
                <td>
                    <span class="badge badge-{{ $user['status'] }}">
                        {{ ucfirst($user['status']) }}
                    </span>
                </td>
                <td class="roles-list">
                    @forelse($user['roles'] as $role)
                        <span>{{ $role }}</span>@if(!$loop->last), @endif
                    @empty
                        <span>-</span>
                    @endforelse
                </td>
                <td class="permissions-list">
                    @forelse(array_slice($user['permissions'], 0, 5) as $permission)
                        <span>{{ $permission }}</span>@if(!$loop->last), @endif
                    @empty
                        <span>-</span>
                    @endforelse
                    @if(count($user['permissions']) > 5)
                        <span>+{{ count($user['permissions']) - 5 }}</span>
                    @endif
                </td>
                <td>{{ \Carbon\Carbon::parse($user['created_at'])->format('d/m/Y') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">No hay usuarios registrados</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">Roles</div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Guard</th>
                <th>Usuarios</th>
                <th>Permisos</th>
            </tr>
        </thead>
        <tbody>
            @forelse($roles as $role)
            <tr>
                <td>{{ $role['id'] }}</td>
                <td>{{ $role['name'] }}</td>
                <td>{{ $role['guard_name'] }}</td>
                <td>{{ $role['users_count'] }}</td>
                <td class="permissions-list">
                    @forelse(array_slice($role['permissions'], 0, 8) as $permission)
                        <span>{{ $permission }}</span>@if(!$loop->last), @endif
                    @empty
                        <span>-</span>
                    @endforelse
                    @if(count($role['permissions']) > 8)
                        <span>+{{ count($role['permissions']) - 8 }}</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="5" style="text-align: center;">No hay roles registrados</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="page-break"></div>

    <div class="section-title">Permisos</div>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Guard</th>
                <th>Roles Asignados</th>
            </tr>
        </thead>
        <tbody>
            @forelse($permissions as $permission)
            <tr>
                <td>{{ $permission['id'] }}</td>
                <td>{{ $permission['name'] }}</td>
                <td>{{ $permission['guard_name'] }}</td>
                <td>{{ $permission['roles_count'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="4" style="text-align: center;">No hay permisos registrados</td>
            </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
