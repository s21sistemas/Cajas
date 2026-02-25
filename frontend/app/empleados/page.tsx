"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, Edit, Trash2, UserCheck, UserX, Plane } from "lucide-react";
import { employeesService } from "@/lib/services/employees.service";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useToast } from "@/components/erp/action-toast";
import { EmployeeForm } from "@/components/forms/EmployeeForm";

export default function EmpleadosPage() {
  return (
    <ProtectedRoute requiredPermission="employees.view">
      <EmpleadosPageInner />
    </ProtectedRoute>
  );
}

function EmpleadosPageInner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<any>(null);
  
  const { showToast } = useToast();

  // Fetch employees from API
  const { data: employeesResponse, loading, refetch } = useApiQuery(
    () => employeesService.getAll({ search: searchTerm || undefined }),
    { enabled: true }
  );

  const employees = employeesResponse?.data || [];

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'Vacaciones',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    vacation: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const statusIcons: Record<string, any> = {
    active: UserCheck,
    inactive: UserX,
    vacation: Plane,
  };

  // Create mutation
  const { mutate: createEmployee, loading: creating } = useApiMutation(
    (data: any) => employeesService.create(data),
    {
      onSuccess: () => {
        showToast("success", "Empleado creado", "El empleado se ha creado correctamente");
        setIsDialogOpen(false);
        setEditingEmployee(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo crear el empleado");
      },
    }
  );

  // Update mutation
  const { mutate: updateEmployee, loading: updating } = useApiMutation(
    ({ id, data }: { id: number; data: any }) => employeesService.update(id, data),
    {
      onSuccess: () => {
        showToast("success", "Empleado actualizado", "El empleado se ha actualizado correctamente");
        setIsDialogOpen(false);
        setEditingEmployee(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo actualizar el empleado");
      },
    }
  );

  // Delete mutation
  const { mutate: deleteEmployee, loading: deleting } = useApiMutation(
    (id: number) => employeesService.delete(id),
    {
      onSuccess: () => {
        showToast("success", "Empleado eliminado", "El empleado se ha eliminado correctamente");
        setDeletingEmployee(null);
        refetch();
      },
      onError: (error: any) => {
        showToast("error", "Error", error?.message || "No se pudo eliminar el empleado");
      },
    }
  );

  // Handle form submit
  const handleSubmit = async (data: any) => {
    if (editingEmployee) {
      updateEmployee({ id: editingEmployee.id, data });
    } else {
      createEmployee(data);
    }
  };

  // Open edit dialog
  function openEditDialog(employee: any) {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  }

  // Open create dialog
  function openCreateDialog() {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  }

  // Format currency
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(amount);
  }

  // Format date
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-MX');
  }

  // Calculate totals
  const activeCount = employees.filter((e: any) => e.status === 'active').length;
  const inactiveCount = employees.filter((e: any) => e.status === 'inactive').length;
  const vacationCount = employees.filter((e: any) => e.status === 'vacation').length;
  const totalPayroll = employees.filter((e: any) => e.status === 'active').reduce((sum, e) => sum + (e.salary || 0), 0);

  // Get unique departments
  const departments = [...new Set(employees.map((e: any) => e.department).filter(Boolean))];

  if (loading) {
    return (
      <ERPLayout title="Empleados" subtitle="Gestión de empleados">
        <div className="space-y-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-[400px]" />
        </div>
      </ERPLayout>
    );
  }

  return (
    <ERPLayout title="Empleados" subtitle="Gestión de empleados">
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{employees.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Activos</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{activeCount}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-400 mt-1">{inactiveCount}</p>
                </div>
                <UserX className="h-8 w-8 text-gray-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Vacaciones</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{vacationCount}</p>
                </div>
                <Plane className="h-8 w-8 text-blue-400/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Deptos.</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{departments.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Nómina</p>
                  <p className="text-xl font-bold text-card-foreground mt-1">{formatCurrency(totalPayroll)}</p>
                </div>
                <Users className="h-8 w-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-secondary border-0"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar Empleado" : "Crear Nuevo Empleado"}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee
                    ? "Modifique los datos del empleado."
                    : "Complete los datos del empleado a registrar."}
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                defaultValues={editingEmployee || undefined}
                onSubmit={handleSubmit}
                isLoading={creating || updating}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Employees Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-left">Código</TableHead>
                  <TableHead className="text-left">Nombre</TableHead>
                  <TableHead className="text-left">Puesto</TableHead>
                  <TableHead className="text-left">Departamento</TableHead>
                  <TableHead className="text-left">Email</TableHead>
                  <TableHead className="text-right">Salario</TableHead>
                  <TableHead className="text-left">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No hay empleados registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee: any) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.code}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell className="text-right">{formatCurrency(employee.salary || 0)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs border ${statusColors[employee.status] || statusColors.active}`}>
                          {statusLabels[employee.status] || employee.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingEmployee(employee)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar Empleado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  ¿Está seguro de eliminar al empleado "{deletingEmployee?.name}"?
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deletingEmployee && deleteEmployee(deletingEmployee.id)}
                                  disabled={deleting}
                                >
                                  {deleting ? 'Eliminando...' : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
