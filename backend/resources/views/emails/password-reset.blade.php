<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 200px;
        }
        h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .button {
            display: inline-block;
            background-color: #27ae60;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #219a52;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="http://localhost:3000/villazco_logo.jpeg" alt="Villazco">
        </div>
        
        <h1>Restablecer tu contraseña</h1>
        
        <p>Hola {{ $client->name }},</p>
        
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        
        <p style="text-align: center;">
            <a href="{{ $resetUrl }}" class="button">Restablecer Contraseña</a>
        </p>
        
        <p>Este enlace es válido por 2 horas.</p>
        
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        
        <div class="footer">
            <p>© {{ date('Y') }} Villazco. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
