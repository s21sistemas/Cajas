'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield, Users, Box } from 'lucide-react';
import { useToast } from '@/components/erp/action-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Ingresa un email válido');
      return;
    }

    try {
      await login(formData);
      showToast('success', 'Bienvenido', 'Has iniciado sesión correctamente');
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      showToast('error', 'Error de autenticación', errorMessage);
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
          {/* <h1 className="text-2xl font-bold text-foreground">
            ERP CartonBox
          </h1>
          <p className="text-muted-foreground">
            Sistema de gestión para manufactura de cajas de cartón
          </p> */}
        </div>

        {/* Login Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
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

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="h-11"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
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
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Credenciales de Demo
              </h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Email:</strong> test@example.com</p>
                <p><strong>Contraseña:</strong> 123456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto">
              <Box className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Producción</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">CRM</p>
          </div>
          <div className="space-y-2">
            <div className="p-2 bg-primary/10 rounded-lg w-fit mx-auto">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Finanzas</p>
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