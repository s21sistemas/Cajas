'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, User, Clock, Package } from 'lucide-react';
import { useToast } from '@/components/erp/action-toast';
import { operatorAuthApi, OperatorUser } from '@/lib/api';

export default function OperatorDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [operator, setOperator] = useState<OperatorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('operator_token');
      const userStr = localStorage.getItem('operator_user');

      if (!token || !userStr) {
        router.push('/operador/login');
        return;
      }

      try {
        // Validate token with backend
        const user = await operatorAuthApi.getCurrentOperator();
        setOperator(user);
        // Update local storage with fresh data
        localStorage.setItem('operator_user', JSON.stringify(user));
      } catch (error) {
        // Token invalid or expired - redirect to login
        localStorage.removeItem('operator_token');
        localStorage.removeItem('operator_user');
        router.push('/operador/login');
      } finally {
        setValidating(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [router]);

  const handleLogout = async () => {
    try {
      await operatorAuthApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('operator_token');
      localStorage.removeItem('operator_user');
      showToast('success', 'Sesión cerrada', 'Has cerrado sesión correctamente');
      router.push('/operador/login');
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!operator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/villazco_logo.jpeg"
              alt="Villazco Logo"
              width={120}
              height={120}
              className="object-contain"
            />
            <div>
              <h1 className="text-xl font-bold">Panel de Operador</h1>
              <p className="text-sm text-muted-foreground">Sistema de Producción</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{operator.name}</p>
              <p className="text-sm text-muted-foreground">Código: {operator.employeeCode}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Operator Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operador</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operator.name}</div>
              <p className="text-xs text-muted-foreground">{operator.specialty || 'Sin especialidad'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Turno</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{operator.shift || 'No asignado'}</div>
              <p className="text-xs text-muted-foreground">Horario de trabajo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Activo</div>
              <p className="text-xs text-muted-foreground">Operando normalmente</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => router.push('/produccion')}
          >
            <Package className="h-6 w-6" />
            <span>Producciones</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => router.push('/produccion')}
          >
            <Clock className="h-6 w-6" />
            <span>Registrar Avance</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => router.push('/calidad')}
          >
            <User className="h-6 w-6" />
            <span>Control de Calidad</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => router.push('/mantenimiento')}
          >
            <Clock className="h-6 w-6" />
            <span>Reportar Problema</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
