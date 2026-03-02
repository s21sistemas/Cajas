'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Box } from 'lucide-react';
import { useToast } from '@/components/erp/action-toast';
import { operatorAuthApi } from '@/lib/api';

export default function OperatorLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [employeeCode, setEmployeeCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeCode(e.target.value);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeCode.trim()) {
      setError('Por favor ingresa tu código de empleado');
      return;
    }

    setLoading(true);

    try {
      const response = await operatorAuthApi.login(employeeCode);
      
      // Guardar token y datos del operador
      localStorage.setItem('operator_token', response.token);
      localStorage.setItem('operator_user', JSON.stringify(response.operator));
      
      showToast('success', 'Bienvenido', `Hola, ${response.operator.name}`);
      router.push('/operador');
    } catch (err: any) {
      const errorMessage = err?.message || err?.error || 'Código de empleado inválido';
      setError(errorMessage);
      showToast('error', 'Error de autenticación', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Image
              src="/villazco_logo.jpeg"
              alt="Villazco Logo"
              width={250}
              height={250}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Operator Login Card */}
        <Card className="border-border/50 shadow-lg border-primary/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Panel de Operador
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tu código de empleado para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Employee Code Field */}
              <div className="space-y-2">
                <Label htmlFor="employeeCode">Código de Empleado</Label>
                <Input
                  id="employeeCode"
                  name="employeeCode"
                  type="text"
                  placeholder="Ej: OP001"
                  value={employeeCode}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="h-11"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Back to regular login */}
            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => router.push('/login')}
                className="text-sm text-muted-foreground"
              >
                ¿Necesitas acceso de administrador?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Box className="h-4 w-4" />
            <span className="text-sm">Acceso exclusivo para operadores de producción</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2026 <a href="https://s21sistem.com" target="_blank" rel="noopener noreferrer" className="hover:underline">s21sistem.com</a> - Derechos Reservados</p>
        </div>
      </div>
    </div>
  );
}
