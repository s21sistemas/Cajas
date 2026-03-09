"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Users,
  Settings,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Key,
  Clock,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/erp/action-toast";
import { settingsService, rolesService, permissionsService, usersService } from "@/lib/services";
import type { Settings as SettingsType } from "@/lib/services/settings.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  guard_name?: string;
  created_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  status?: string;
}

// Mapeo de módulos a español
const moduleNames: Record<string, string> = {
  // Módulos principales
  clientes: "Clientes",
  clients: "Clientes",
  employees: "Empleados",
  empleados: "Empleados",
  productos: "Productos",
  products: "Productos",
  materials: "Materiales",
  materiales: "Materiales",
  produccion: "Producción",
  production: "Producción",
  productions: "Producción",
  proveedores: "Proveedores",
  suppliers: "Proveedores",
  ventas: "Ventas",
  sales: "Ventas",
  warehouse: "Almacén",
  almacen: "Almacén",
  warehouselocations: "Ubicaciones de Almacén",
  склад: "Almacén",
  mantenimientos: "Mantenimientos",
  mantenimients: "Mantenimientos",
  maintenance: "Mantenimientos",
  maintenanceorders: "Órdenes de Mantenimiento",
  reportes: "Reportes",
  reports: "Reportes",
  configuracion: "Configuración",
  configuration: "Configuración",
  usuarios: "Usuarios",
  users: "Usuarios",
  roles: "Roles",
  permissions: "Permisos",
  permisos: "Permisos",
  settings: "Ajustes",
  // Módulos de RRHH
  ausencias: "Ausencias",
  ausencia: "Ausencias",
  absences: "Ausencias",
  incapacidad: "Incapacidades",
  disability: "Incapacidades",
  discapacidad: "Incapacidades",
  disabilities: "Incapacidades",
  tiempoextra: "Tiempo Extra",
  overtime: "Tiempo Extra",
  overtimes: "Tiempo Extra",
  descuento: "Descuentos",
  discount: "Descuentos",
  discounts: "Descuentos",
  discounttype: "Tipos de Descuento",
  discounttypes: "Tipos de Descuento",
  vacacion: "Vacaciones",
  vacation: "Vacaciones",
  vacationrequests: "Solicitudes de Vacaciones",
  prestamo: "Préstamos",
  loan: "Préstamos",
  loans: "Préstamos",
  loanpayment: "Abonos a Préstamos",
  loanpayments: "Abonos a Préstamos",
  loantype: "Tipos de Préstamo",
  loantypes: "Tipos de Préstamo",
  guardpayment: "Pagos de Guardias",
  guardpayments: "Pagos de Guardias",
  employeeaccount: "Cuentas de Empleados",
  employeeaccounts: "Cuentas de Empleados",
  // Otros módulos
  presupuesto: "Presupuestos",
  quote: "Presupuestos",
  quotes: "Presupuestos",
  orden: "Órdenes",
  order: "Órdenes",
  workorder: "Órden de Trabajo",
  workorders: "Órdenes de Trabajo",
  serviceorder: "Orden de Servicio",
  serviceorders: "Órdenes de Servicio",
  purchaseorder: "Orden de Compra",
  purchaseorders: "Órdenes de Compra",
  movement: "Movimientos",
  movements: "Movimientos",
  banco: "Bancos",
  bank: "Bancos",
  vehiculo: "Vehículos",
  vehicle: "Vehículos",
  calidad: "Calidad",
  quality: "Calidad",
  // Máquinas y procesos
  machines: "Máquinas",
  machine: "Máquinas",
  operators: "Operadores",
  operator: "Operador",
  processes: "Procesos",
  process: "Proceso",
  cncprograms: "Programas CNC",
  cncprogram: "Programa CNC",
  // Módulos financieros
  accountstatement: "Estados de Cuenta",
  accountstatements: "Estados de Cuenta",
  supplierstatement: "Estados de Cuenta de Proveedores",
  supplierstatements: "Estados de Cuenta de Proveedores",
  bankaccount: "Cuentas Bancarias",
  bankaccounts: "Cuentas Bancarias",
  banktransaction: "Transacciones Bancarias",
  banktransactions: "Transacciones Bancarias",
  // Inventario
  inventoryitem: "Inventario",
  inventoryitems: "Inventario",
  // Sucursales
  branches: "Sucursales",
  branch: "Sucursal",
  // Otros
  qritems: "Códigos QR",
  qritem: "Código QR",
};

// Función para traducir módulos
const translateModule = (module: string): string => {
  return moduleNames[module.toLowerCase()] || module.charAt(0).toUpperCase() + module.slice(1);
};

// Mapeo de acciones a español
const actionNames: Record<string, string> = {
  view: "Ver",
  ver: "Ver",
  create: "Crear",
  crear: "Crear",
  edit: "Editar",
  editar: "Editar",
  delete: "Eliminar",
  eliminar: "Eliminar",
  // Otras acciones comunes
  list: "Listar",
  show: "Ver",
  update: "Actualizar",
  store: "Crear",
  access: "Acceder",
  manage: "Gestionar",
  export: "Exportar",
  importar: "Importar",
  import: "Importar",
  print: "Imprimir",
  approve: "Aprobar",
  reject: "Rechazar",
  download: "Descargar",
  upload: "Subir",
};

// Función para traducir acciones
const translateAction = (action: string): string => {
  return actionNames[action.toLowerCase()] || action;
};

export default function ConfigurationPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("empresa");
  
  // Settings state
  const [settings, setSettings] = useState<SettingsType>({
    company: {},
    production: {},
    notifications: {},
    system: {},
  });
  
  // Roles and permissions state
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  
  // Modal state for roles
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: [] as number[],
  });
  const [submittingRole, setSubmittingRole] = useState(false);

  // Modal state for users
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });
  const [submittingUser, setSubmittingUser] = useState(false);

  // Logo upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Load settings
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast("error", "Error", "No se pudieron cargar las configuraciones");
    } finally {
      setLoading(false);
    }
  };

  // Load roles, permissions and users
  const loadSecurityData = async () => {
    setLoadingRoles(true);
    try {
      const [rolesData, permissionsData, usersData] = await Promise.all([
        rolesService.getAll(),
        permissionsService.getAll(),
        usersService.getAll({ perPage: 100 }),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setUsers(usersData.data || []);
    } catch (error) {
      console.error("Error loading security data:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadSecurityData();
  }, []);

  // Handle settings change
  const handleSettingChange = (module: keyof SettingsType, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [module]: {
        ...(prev[module] || {}),
        [key]: value,
      },
    }));
  };

  // Save settings
  const handleSave = async (module: string) => {
    setSaving(true);
    try {
      const moduleSettings = settings[module as keyof SettingsType];
      if (moduleSettings) {
        for (const [key, value] of Object.entries(moduleSettings)) {
          await settingsService.update(module, key, value);
        }
      }
      showToast("success", "Éxito", `Los ajustes de ${module} han sido actualizados`);
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("error", "Error", "No se pudieron guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast("error", "Error", "El archivo debe ser una imagen (jpg, png o svg)");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "Error", "El archivo no debe superar los 2MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await settingsService.uploadLogo(file);
      setSettings(prev => ({
        ...prev,
        company: {
          ...prev.company,
          logo: result.url
        }
      }));
      showToast("success", "Éxito", "Logo subido correctamente");
    } catch (error) {
      console.error("Error uploading logo:", error);
      showToast("error", "Error", "No se pudo subir el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle logo delete
  const handleLogoDelete = async () => {
    setUploadingLogo(true);
    try {
      await settingsService.deleteLogo();
      setSettings(prev => ({
        ...prev,
        company: {
          ...prev.company,
          logo: undefined
        }
      }));
      showToast("success", "Éxito", "Logo eliminado correctamente");
    } catch (error) {
      console.error("Error deleting logo:", error);
      showToast("error", "Error", "No se pudo eliminar el logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle role form
  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleForm({
        name: role.name,
        permissions: role.permissions.map((p) => p.id),
      });
    } else {
      setEditingRole(null);
      setRoleForm({ name: "", permissions: [] });
    }
    setRoleModalOpen(true);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSaveRole = async () => {
    if (!roleForm.name) {
      showToast("error", "Error", "El nombre del rol es requerido");
      return;
    }
    if (roleForm.permissions.length === 0) {
      showToast("error", "Error", "Debe seleccionar al menos un módulo");
      return;
    }

    setSubmittingRole(true);
    try {
      if (editingRole) {
        await rolesService.update(editingRole.id, {
          name: roleForm.name,
          permissions: roleForm.permissions,
        });
        showToast("success", "Éxito", "Rol actualizado correctamente");
      } else {
        await rolesService.create({
          name: roleForm.name,
          permissions: roleForm.permissions,
        });
        showToast("success", "Éxito", "Rol creado correctamente");
      }
      setRoleModalOpen(false);
      loadSecurityData();
    } catch (error) {
      console.error("Error saving role:", error);
      showToast("error", "Error", "No se pudo guardar el rol");
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await rolesService.delete(roleId);
      showToast("success", "Éxito", "Rol eliminado correctamente");
      loadSecurityData();
    } catch (error) {
      console.error("Error deleting role:", error);
      showToast("error", "Error", "No se pudo eliminar el rol");
    }
  };

  // User modal functions
  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      // Find role ID by name
      const userRole = user.roles && user.roles.length > 0 ? roles.find(r => r.name === user.roles[0]) : null;
      setUserForm({
        name: user.name,
        email: user.email,
        password: "",
        roleId: userRole ? userRole.id.toString() : "",
      });
    } else {
      setEditingUser(null);
      setUserForm({ name: "", email: "", password: "", roleId: "" });
    }
    setUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!userForm.name) {
      showToast("error", "Error", "El nombre es requerido");
      return;
    }
    if (!userForm.email) {
      showToast("error", "Error", "El email es requerido");
      return;
    }
    if (!editingUser && !userForm.password) {
      showToast("error", "Error", "La contraseña es requerida para nuevos usuarios");
      return;
    }

    setSubmittingUser(true);
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: userForm.name,
          email: userForm.email,
          roleId: userForm.roleId ? parseInt(userForm.roleId) : undefined,
          ...(userForm.password && { password: userForm.password }),
        });
        showToast("success", "Éxito", "Usuario actualizado correctamente");
      } else {
        await usersService.create({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password,
          roleId: userForm.roleId && userForm.roleId !== "none" ? parseInt(userForm.roleId) : undefined,
        });
        showToast("success", "Éxito", "Usuario creado correctamente");
      }
      setUserModalOpen(false);
      loadSecurityData();
    } catch (error) {
      console.error("Error saving user:", error);
      showToast("error", "Error", "No se pudo guardar el usuario");
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await usersService.delete(userId);
      showToast("success", "Éxito", "Usuario eliminado correctamente");
      loadSecurityData();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("error", "Error", "No se pudo eliminar el usuario");
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const [module, action] = perm.name.split(".");
    if (!acc[module]) acc[module] = [];
    acc[module].push({ ...perm, action });
    return acc;
  }, {} as Record<string, (Permission & { action: string })[]>);

  if (loading) {
    return (
      <ERPLayout title="Configuración" subtitle="Ajustes del sistema">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Configuración" subtitle="Ajustes del sistema">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">
            Administra los ajustes del sistema ERP
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="empresa" className="gap-2">
              <Building2 className="h-4 w-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="produccion" className="gap-2">
              <Settings className="h-4 w-4" />
              Producción
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="sistema" className="gap-2">
              <Database className="h-4 w-4" />
              Sistema
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="gap-2">
              <Shield className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información de la Empresa
                </CardTitle>
                <CardDescription>Datos generales de la organización</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Razón Social</Label>
                    <Input
                      value={settings.company?.name || ""}
                      onChange={(e) => handleSettingChange("company", "name", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">RFC</Label>
                    <Input
                      value={settings.company?.rfc || ""}
                      onChange={(e) => handleSettingChange("company", "rfc", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Dirección</Label>
                  <Input
                    value={settings.company?.address || ""}
                    onChange={(e) => handleSettingChange("company", "address", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Ciudad</Label>
                    <Input
                      value={settings.company?.city || ""}
                      onChange={(e) => handleSettingChange("company", "city", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Teléfono</Label>
                    <Input
                      value={settings.company?.phone || ""}
                      onChange={(e) => handleSettingChange("company", "phone", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Email</Label>
                    <Input
                      type="email"
                      value={settings.company?.email || ""}
                      onChange={(e) => handleSettingChange("company", "email", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Sitio Web</Label>
                    <Input
                      value={settings.company?.website || ""}
                      onChange={(e) => handleSettingChange("company", "website", e.target.value)}
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                {/* Logo Section */}
                <div className="space-y-2 mt-4">
                  <Label className="text-foreground">Logo de la Empresa</Label>
                  <p className="text-xs text-muted-foreground">
                    Sube un logo para mostrar en cotizaciones y ventas (jpg, png, svg - máx 2MB)
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center w-48 h-24">
                      {settings.company?.logo ? (
                        <img 
                          src={settings.company.logo} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          <Building2 className="h-8 w-8 mx-auto mb-1" />
                          <span className="text-xs">Sin logo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <Label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Subir Logo
                      </Label>
                      {settings.company?.logo && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleLogoDelete}
                          disabled={uploadingLogo}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                  {uploadingLogo && (
                    <p className="text-sm text-blue-500">Subiendo logo...</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("company")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Producción Tab */}
          <TabsContent value="produccion" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Turnos y Horarios
                </CardTitle>
                <CardDescription>Configuración de turnos de trabajo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Turno Predeterminado</Label>
                    <Select
                      value={settings.production?.defaultShift || "morning"}
                      onValueChange={(v) => handleSettingChange("production", "defaultShift", v)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Matutino (6:00 - 14:00)</SelectItem>
                        <SelectItem value="afternoon">Vespertino (14:00 - 22:00)</SelectItem>
                        <SelectItem value="night">Nocturno (22:00 - 6:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Horas por Turno</Label>
                    <Input
                      type="number"
                      value={settings.production?.hoursPerShift ?? ''}
                      onChange={(e) => handleSettingChange("production", "hoursPerShift", e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="8"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Descansos por Turno</Label>
                    <Input
                      type="number"
                      value={settings.production?.breaksPerShift ?? ''}
                      onChange={(e) => handleSettingChange("production", "breaksPerShift", e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="2"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Duración Descanso (min)</Label>
                    <Input
                      type="number"
                      value={settings.production?.breakDuration ?? ''}
                      onChange={(e) => handleSettingChange("production", "breakDuration", e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="15"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("production")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Tarifas y Pagos
                </CardTitle>
                <CardDescription>Multiplicadores para horas extra y días festivos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Multiplicador Tiempo Extra</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.production?.overtimeMultiplier ?? ''}
                      onChange={(e) => handleSettingChange("production", "overtimeMultiplier", e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="1.5"
                      className="bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Multiplicador Días Festivos</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={settings.production?.holidayMultiplier ?? ''}
                      onChange={(e) => handleSettingChange("production", "holidayMultiplier", e.target.value === '' ? null : Number(e.target.value))}
                      placeholder="2.0"
                      className="bg-secondary border-border"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("production")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Seguridad de Eliminación
                </CardTitle>
                <CardDescription>Código PIN requerido para eliminar máquinas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">PIN para Eliminar Máquinas</Label>
                  <Input
                    type="password"
                    value={settings.production?.machinesDeletePin || ""}
                    onChange={(e) => handleSettingChange("production", "machinesDeletePin", e.target.value)}
                    placeholder="Ingrese un PIN de 4-6 dígitos"
                    maxLength={6}
                    className="bg-secondary border-border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Deje vacío para permitir eliminación sin PIN. Si configura un PIN, se requerirá para eliminar cualquier máquina.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("production")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notificaciones Tab */}
          <TabsContent value="notificaciones" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas del Sistema
                </CardTitle>
                <CardDescription>Configura las notificaciones automáticas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alertas por Email</p>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones por correo electrónico</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.emailAlerts || false}
                    onCheckedChange={(v) => handleSettingChange("notifications", "emailAlerts", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Stock Bajo</p>
                    <p className="text-sm text-muted-foreground">Alertas cuando el inventario esté por debajo del mínimo</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.lowStockAlerts || false}
                    onCheckedChange={(v) => handleSettingChange("notifications", "lowStockAlerts", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Recordatorios de Mantenimiento</p>
                    <p className="text-sm text-muted-foreground">Notificaciones de mantenimiento programado</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.maintenanceReminders || false}
                    onCheckedChange={(v) => handleSettingChange("notifications", "maintenanceReminders", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Alertas de Producción</p>
                    <p className="text-sm text-muted-foreground">Notificaciones de órdenes retrasadas o problemas</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.productionAlerts || false}
                    onCheckedChange={(v) => handleSettingChange("notifications", "productionAlerts", v)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("notifications")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema Tab */}
          <TabsContent value="sistema" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Regional
                </CardTitle>
                <CardDescription>Configuración de idioma, zona horaria y formato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Idioma</Label>
                    <Select
                      value={settings.system?.language || "es"}
                      onValueChange={(v) => handleSettingChange("system", "language", v)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Zona Horaria</Label>
                    <Select
                      value={settings.system?.timezone || "America/Mexico_City"}
                      onValueChange={(v) => handleSettingChange("system", "timezone", v)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                        <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
                        <SelectItem value="America/Cancún">Cancún (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Formato de Fecha</Label>
                    <Select
                      value={settings.system?.dateFormat || "DD/MM/YYYY"}
                      onValueChange={(v) => handleSettingChange("system", "dateFormat", v)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Moneda</Label>
                    <Select
                      value={settings.system?.currency || "MXN"}
                      onValueChange={(v) => handleSettingChange("system", "currency", v)}
                    >
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSave("system")} disabled={saving} className="gap-2">
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seguridad Tab */}
          <TabsContent value="seguridad" className="space-y-6">
            {/* Roles y Permisos */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Roles y Permisos
                </CardTitle>
                <CardDescription>Administración de roles y permisos del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openRoleModal()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Rol
                  </Button>
                </div>

                {loadingRoles ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-muted-foreground">Rol</TableHead>
                        <TableHead className="text-muted-foreground">Módulos</TableHead>
                        <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                            No hay roles configurados
                          </TableCell>
                        </TableRow>
                      ) : (
                        roles.map((role) => {
                          // Obtener módulos únicos del rol
                          const roleModules = [...new Set(role.permissions.map(p => {
                            const module = p.name.split('.')[0];
                            return translateModule(module);
                          }))];
                          return (
                          <TableRow key={role.id} className="border-border">
                            <TableCell className="font-medium text-foreground">
                              {role.name}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {roleModules.slice(0, 4).map((mod, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {mod}
                                  </Badge>
                                ))}
                                {roleModules.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{roleModules.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openRoleModal(role)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRole(role.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );})
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Usuarios */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuarios
                </CardTitle>
                <CardDescription>Administración de usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => openUserModal()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Usuario
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Nombre</TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Rol</TableHead>
                      <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                          No hay usuarios configurados
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {user.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.roles && user.roles.length > 0 ? user.roles[0] : "Sin rol"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openUserModal(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Role Modal */}
        <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingRole ? "Editar Rol" : "Nuevo Rol"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre del Rol</Label>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="Ej: Administrador, Supervisor, Operador"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground">Permisos por Módulo</Label>
                <div className="space-y-3 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module} className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{translateModule(module)}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handlePermissionToggle(perm.id)}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                roleForm.permissions.includes(perm.id)
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {roleForm.permissions.includes(perm.id) && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{translateAction(perm.action)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRole} disabled={submittingRole}>
                {submittingRole ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Modal */}
        <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">
                  Contraseña {editingUser && "(dejar vacío para mantener)"}
                </Label>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder={editingUser ? "********" : "Contraseña"}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Rol</Label>
                <Select
                  value={userForm.roleId || "none"}
                  onValueChange={(v) => setUserForm({ ...userForm, roleId: v === "none" ? "" : v })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin rol</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} disabled={submittingUser}>
                {submittingUser ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
