'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/erp/action-toast';

interface ClientInfo {
  id: number;
  name: string;
  email: string;
  code?: string;
}

interface ApprovalItem {
  id: number;
  type: 'sale' | 'quote';
  code: string;
  total: number;
  status: string;
  created_at: string;
}

interface ApprovalInfo {
  client: ClientInfo;
  has_password: boolean;
  pending_approvals: {
    sales: ApprovalItem[];
    quotes: ApprovalItem[];
  };
}

function ClientApprovalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const token = searchParams.get('token');

  const [view, setView] = useState<'loading' | 'login' | 'set-password' | 'approvals'>('loading');
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for document upload
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (token) {
      loadApprovalInfo();
    } else {
      setView('login');
    }
  }, [token]);

  const loadApprovalInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/client/approval-info?token=${token}`,
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
      
      const allApprovals = [...(data.pending_approvals.sales || []), ...(data.pending_approvals.quotes || [])];
      setPendingApprovals(allApprovals);
      
      if (!data.has_password) {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/login`, {
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

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
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

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al establecer contraseña');
      }

      // Save session
      localStorage.setItem('client_session_token', data.session_token);
      localStorage.setItem('client_info', JSON.stringify(data.client));
      
      setClientInfo(data.client);
      setHasPassword(true);
      showToast('success', 'Éxito', 'Contraseña establecida correctamente');
      
      // Continue to approvals
      await loadApprovalInfo();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al establecer contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (item: ApprovalItem) => {
    setSelectedItem(item);
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
    if (!selectedItem || !uploadFile) {
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
      formData.append('type', selectedItem.type);
      formData.append('id', selectedItem.id.toString());
      formData.append('document', uploadFile);
      if (uploadNotes) {
        formData.append('notes', uploadNotes);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/approve-document`, {
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

      showToast('success', 'Aprobado', `El ${selectedItem.type === 'sale' ? 'pedido' : 'cotización'} ha sido aprobado`);
      
      // Close modal and refresh
      setSelectedItem(null);
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
              <CardDescription>Ingresa tus credenciales para aprobar pedidos</CardDescription>
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
              <CardTitle>Mis Aprobaciones</CardTitle>
              <CardDescription>
                Bienvenido {clientInfo?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-muted-foreground">No hay pedidos pendientes de aprobación</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.code}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(item.total).toLocaleString()} • {item.type === 'sale' ? 'Venta' : 'Cotización'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleApprove(item)}>
                        <Upload className="h-4 w-4 mr-1" />
                        Subir
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Aprobar {selectedItem.type === 'sale' ? 'Venta' : 'Cotización'}</CardTitle>
                <CardDescription>{selectedItem.code}</CardDescription>
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
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedItem(null)}>
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
