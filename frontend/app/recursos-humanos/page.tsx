"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Filter, Mail, Phone, Calendar, Edit, Trash2, DollarSign, Building2, UserCheck, UserX, Palmtree, ChevronLeft, ChevronRight, MoreHorizontal, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { employeesService } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { EmployeeStatsCards } from "./components/EmployeeStatsCards";
import type { Employee } from "@/lib/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Activo", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: UserCheck },
  inactive: { label: "Inactivo", color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: UserX },
  vacation: { label: "Vacaciones", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Palmtree },
};

const departmentColors: Record<string, string> = {
  "Producción": "text-chart-1",
  "Ingeniería": "text-chart-2",
  "Calidad": "text-chart-3",
  "Mantenimiento": "text-chart-4",
  "Dirección": "text-chart-5",
  "Recursos Humanos": "text-primary",
  "Almacén": "text-success",
  "Finanzas": "text-warning",
};

const DEFAULT_DEPARTMENTS = ["Producción", "Ingeniería", "Calidad", "Mantenimiento", "Dirección", "Recursos Humanos", "Almacén", "Finanzas"];

interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  vacation: number;
  totalSalary: number;
}

export default function RecursosHumanosPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployeeStats>({
    total: 0,
    active: 0,
    inactive: 0,
    vacation: 0,
    totalSalary: 0,
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Refs
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const hasInitialLoad = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    position: "",
    department: "Producción",
    email: "",
    phone: "",
    salary: 0,
    hire_date: new Date().toISOString().split('T')[0],
    status: "active",
  });

  // Fetch employees
  const fetchEmployees = async (searchValue: string = "", page: number = 1, dept?: string, stat?: string) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      if (dept && dept !== "all") {
        params.department = dept;
      }
      if (stat && stat !== "all") {
        params.status = stat;
      }
      
      const response = await employeesService.getAll(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setEmployees(data);
      setCurrentPage((response as any)?.currentPage || (response as any)?.current_page || 1);
      setLastPage((response as any)?.lastPage || (response as any)?.last_page || 1);
      setTotalEmployees(response?.total || 0);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      showToast("error", "Error", "No se pudieron cargar los empleados");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await employeesService.getStats();
      const statsData = response?.data;
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          active: statsData.active || 0,
          inactive: statsData.inactive || 0,
          vacation: statsData.vacation || 0,
          totalSalary: statsData.totalSalary || 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  // Initial load - solo una vez
  useEffect(() => {
    if (hasInitialLoad.current) return;
    hasInitialLoad.current = true;
    
    fetchEmployees("", 1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search and filters with debounce - se salta el mount inicial
  useEffect(() => {
    // Skip en el primer mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchEmployees(searchTerm, 1, departmentFilter, statusFilter);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, departmentFilter, statusFilter]);

  // Page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchEmployees(searchTerm, newPage, departmentFilter, statusFilter);
    }
  };

  // Submit (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.position || !formData.department || !formData.email || !formData.salary) {
      showToast("warning", "Campos requeridos", "Por favor complete todos los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      if (editingEmployee) {
        await employeesService.update(Number(editingEmployee.id), formData);
        showToast("success", "Éxito", "Empleado actualizado correctamente");
      } else {
        await employeesService.create(formData);
        showToast("success", "Éxito", "Empleado creado correctamente");
      }
      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        code: "",
        name: "",
        position: "",
        department: "Producción",
        email: "",
        phone: "",
        salary: 0,
        hire_date: new Date().toISOString().split('T')[0],
        status: "active",
      });
      fetchEmployees(searchTerm, currentPage, departmentFilter, statusFilter);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingEmployee) return;
    setSubmitting(true);
    try {
      await employeesService.delete(Number(deletingEmployee.id));
      showToast("success", "Éxito", "Empleado eliminado correctamente");
      setDeletingEmployee(null);
      fetchEmployees(searchTerm, currentPage, departmentFilter, statusFilter);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      code: emp.code || "",
      name: emp.name || "",
      position: emp.position || "",
      department: emp.department || "Producción",
      email: emp.email || "",
      phone: emp.phone || "",
      salary: emp.salary || 0,
      hire_date: emp.hireDate || new Date().toISOString().split('T')[0],
      status: emp.status || "active",
    });
    setIsDialogOpen(true);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const departments = DEFAULT_DEPARTMENTS;

  return (
    <ERPLayout title="Recursos Humanos" subtitle="Gestión del personal de la empresa">
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <EmployeeStatsCards
          total={stats.total}
          active={stats.active}
          vacation={stats.vacation}
          totalSalary={stats.totalSalary}
        />

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="employees">Empleados</TabsTrigger>
            <TabsTrigger value="departments">Por Departamento</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="mt-6 space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64 bg-secondary border-0"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40 bg-secondary border-0">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Depto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 bg-secondary border-0">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="vacation">Vacaciones</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setEditingEmployee(null); setFormData({ code: "", name: "", position: "", department: "Producción", email: "", phone: "", salary: 0, hire_date: new Date().toISOString().split('T')[0], status: "active" }); }}}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Empleado
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEmployee ? "Editar Empleado" : "Registrar Nuevo Empleado"}</DialogTitle>
                    <DialogDescription>
                      Complete los datos del empleado.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Código *</label>
                        <Input
                          placeholder="EMP-XXX"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Departamento *</label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => setFormData({ ...formData, department: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nombre Completo *</label>
                      <Input
                        placeholder="Nombre del empleado"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Puesto *</label>
                      <Input
                        placeholder="Puesto del empleado"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email *</label>
                        <Input
                          placeholder="correo@empresa.com"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Teléfono</label>
                        <Input
                          placeholder="+52 55 XXXX XXXX"
                          value={formData.phone || ""}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Salario Mensual *</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formData.salary || ""}
                        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Fecha de Ingreso *</label>
                      <Input
                        type="date"
                        value={formData.hire_date}
                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Estado</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive" | "vacation") => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="vacation">Vacaciones</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={submitting}>
                      {submitting ? "Guardando..." : (editingEmployee ? "Actualizar Empleado" : "Registrar Empleado")}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Employees Table */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Directorio de Empleados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Empleado</TableHead>
                      <TableHead className="text-muted-foreground">Código</TableHead>
                      <TableHead className="text-muted-foreground">Puesto</TableHead>
                      <TableHead className="text-muted-foreground">Departamento</TableHead>
                      <TableHead className="text-muted-foreground">Contacto</TableHead>
                      <TableHead className="text-muted-foreground">Ingreso</TableHead>
                      <TableHead className="text-muted-foreground">Salario</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // Skeleton loading state - 5 rows
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-9 w-9 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-36" />
                              <Skeleton className="h-3 w-28" />
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 rounded ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No hay empleados registrados.
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((emp) => {
                        const status = statusConfig[emp.status] || statusConfig.active;
                        const StatusIcon = status.icon;
                        const deptColor = departmentColors[emp.department] || "text-muted-foreground";

                        return (
                          <TableRow key={emp.id} className="border-border">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(emp.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{emp.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {emp.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-muted-foreground">🏢</span>
                                {emp.position}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn("text-xs", deptColor)}>
                                {emp.department}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[120px]">{emp.email}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{emp.phone || "-"}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {formatDate(emp.hireDate)}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-semibold">
                              {formatCurrency(emp.salary || 0)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={cn("text-[10px]", status.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(emp)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeletingEmployee(emp)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalEmployees > 0 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {employees.length} de {totalEmployees} empleados
                    </p>
                    {lastPage > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground px-3">
                          Página {currentPage} de {lastPage}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === lastPage || loading}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Distribución por Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {departments.map((dept) => {
                    const count = employees.filter(e => e.department === dept).length;
                    const colorClass = departmentColors[dept] || "text-muted-foreground";
                    return (
                      <Card key={dept} className="bg-secondary/50 border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={cn("text-sm font-medium", colorClass)}>{dept}</p>
                              <p className="text-2xl font-bold text-card-foreground">{count}</p>
                            </div>
                            <Building2 className={cn("h-8 w-8", colorClass.replace("text-", "text-"))} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={!!deletingEmployee}
        onOpenChange={() => setDeletingEmployee(null)}
        title="Eliminar Empleado"
        description={`¿Estás seguro de eliminar a ${deletingEmployee?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </ERPLayout>
  );
}
