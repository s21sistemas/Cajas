'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/erp/action-toast';

interface ClientInfo {
  id: number;
  name: string;
  email: string;
  code?: string;
}

interface QuoteItem {
  id: number;
  code: string;
  total: number;
  status: string;
  created_at: string;
}

function ClientApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = searchParams.get('token');

  const [view, setView] = useState<'loading' | 'login' | 'set-password' | 'forgot-password' | 'reset-password' | 'approvals'>('loading');
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [pendingQuotes, setPendingQuotes] = useState<QuoteItem[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for document upload
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de reset_password en la URL
    const resetTokenFromUrl = searchParams.get('reset_token');
    
    if (resetTokenFromUrl) {
      // Hay token de reset - establecer vista y token
      setView('reset-password');
      // No podemos cambiar el token aquí directamente, lo manejamos en handleSetPassword
    } else if (token) {
      loadApprovalInfo();
    } else {
      setView('login');
    }
  }, [token, searchParams]);

  const loadApprovalInfo = async () => {
    setLoading(true);
    let temptoken = null;
    if(!token){
      temptoken = localStorage.getItem('client_session_token');
    }else{
      temptoken = token;
    }
    console.log(temptoken);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/approval-info?token=${temptoken}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar información');
      }
      
      setClientInfo(data.client);
      setHasPassword(data.has_password);
      
      // Solo mostrar cotizaciones
      setPendingQuotes(data.pending_approvals.quotes || []);
      
      // Determinar si viene de un flujo de reset-password
      const resetTokenFromUrl = searchParams.get('reset_token');
      if (resetTokenFromUrl) {
        // Limpiar el token de la URL
        window.history.replaceState({}, '', '/cliente');
        showToast('success', 'Éxito', 'Contraseña actualizada correctamente');
        setView('login');
      } else if (!data.has_password) {
        // Cliente nuevo sin contraseña - mostrar formulario para crear contraseña
        setView('set-password');
      } else {
        setView('approvals');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Token inválido o expirado';
      setError(errorMessage);
      setView('login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      // Save session
      localStorage.setItem('client_session_token', data.session_token);
      localStorage.setItem('client_info', JSON.stringify(data.client));
      
      setClientInfo(data.client);
      setHasPassword(true);
      
      // Reload approvals
      await loadApprovalInfo();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email) {
      setError('Ingresa tu email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar recuperación');
      }

      showToast('success', 'Éxito', 'Si el email existe, recibirás un enlace de recuperación');
      setView('login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al solicitar recuperación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    // El handleSetPassword ya maneja el reset-password
    await handleSetPassword(e);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verificar si hay token de reset o token normal
    const resetTokenFromUrl = searchParams.get('reset_token');
    const tokenToUse = resetTokenFromUrl || token;
    
    if (!tokenToUse) {
      setError('Token no disponible');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    // Determinar si es para reset-password o set-password
    const isResetPassword = view === 'reset-password';

    try {
      const endpoint = isResetPassword 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/reset-password`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/client/set-password`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: tokenToUse,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al establecer contraseña');
      }

      // Para reset-password, el token se invalida después del cambio
      // El cliente debe iniciar sesión con su nueva contraseña
      if (isResetPassword) {
        showToast('success', 'Éxito', 'Contraseña actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.');
        // Limpiar la URL para que no sedetecte el token de nuevo
        window.history.replaceState({}, '', '/cliente');
        setView('login');
        // Limpiar el formulario
        setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
      } else {
        // Para set-password (establecer contraseña por primera vez), guardar sesión
        localStorage.setItem('client_session_token', data.session_token);
        localStorage.setItem('client_info', JSON.stringify(data.client));
        
        setClientInfo(data.client);
        setHasPassword(true);
        showToast('success', 'Éxito', 'Contraseña establecida correctamente');
        
        // Continue to approvals
        await loadApprovalInfo();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al establecer contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (quote: QuoteItem) => {
    setSelectedQuote(quote);
    setUploadFile(null);
    setUploadNotes('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedQuote || !uploadFile) {
      setError('Por favor selecciona un documento');
      return;
    }

    if (!token && !localStorage.getItem('client_session_token')) {
      setError('Sesión expirada');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('token', token || localStorage.getItem('client_session_token') || '');
      formData.append('type', 'quote');
      formData.append('id', selectedQuote.id.toString());
      formData.append('document', uploadFile);
      if (uploadNotes) {
        formData.append('notes', uploadNotes);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/client/approve-document`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir documento');
      }

      showToast('success', 'Aprobado', 'La cotización ha sido aprobada');
      
      // Close modal and refresh
      setSelectedQuote(null);
      await loadApprovalInfo();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir documento';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/villazco_logo.jpeg"
              alt="Villazco Logo"
              width={200}
              height={200}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login View */}
        {view === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle>Acceso Cliente</CardTitle>
              <CardDescription>Ingresa tus credenciales para aprobar cotizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Iniciar Sesión
                </Button>
              </form>
              {/* Enlace para recuperar contraseña */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setView('forgot-password')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forgot Password View */}
        {view === 'forgot-password' && (
          <Card>
            <CardHeader>
              <CardTitle>Recuperar Contraseña</CardTitle>
              <CardDescription>Ingresa tu email para recibir un enlace de recuperación</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enviar Enlace
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setView('login')}
                >
                  Volver a Iniciar Sesión
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Password View */}
        {view === 'reset-password' && (
          <Card>
            <CardHeader>
              <CardTitle>Nueva Contraseña</CardTitle>
              <CardDescription>Crea una nueva contraseña para tu cuenta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Actualizar Contraseña
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Set Password View */}
        {view === 'set-password' && (
          <Card>
            <CardHeader>
              <CardTitle>Establecer Contraseña</CardTitle>
              <CardDescription>Hola {clientInfo?.name}, crea una contraseña para acceder</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Continuar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Approvals View */}
        {view === 'approvals' && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Cotizaciones</CardTitle>
              <CardDescription>
                Bienvenido {clientInfo?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay cotizaciones pendientes de aprobación</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{quote.code}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(quote.total).toLocaleString()} • {quote.status}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleApprove(quote)}>
                        <Upload className="h-4 w-4 mr-1" />
                        Subir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {/* Botón de cerrar sesión */}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    localStorage.removeItem('client_session_token');
                    localStorage.removeItem('client_info');
                    window.location.href = '/cliente';
                  }}
                >
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Aprobar Cotización</CardTitle>
                <CardDescription>{selectedQuote.code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Documento de aprobación (PDF, JPG, PNG)</Label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notas (opcional)</Label>
                  <Input
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    placeholder="Notas adicionales..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedQuote(null)}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleUploadDocument} disabled={uploading || !uploadFile}>
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Subir y Aprobar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientApprovalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ClientApprovalContent />
    </Suspense>
  );
}
