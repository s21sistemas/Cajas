'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ERPLayout } from '@/components/erp/erp-layout';
import { ConfirmDialog } from '@/components/erp/confirm-dialog';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { logisticsService } from '@/lib/services/logistics.service';
import { Vehicle, GasolineReceipt } from '@/lib/types';
import { Plus, Fuel, Car, Loader2, Edit, Trash2 } from 'lucide-react';

// Schemas de validación con Zod
const gasolineSchema = z.object({
  vehicle_id: z.number().min(1, 'El vehículo es requerido'),
  mileage: z.number().min(0, 'El kilometraje debe ser mayor a 0'),
  liters: z.number().min(0.01, 'Los litros deben ser mayores a 0'),
  cost_per_liter: z.number().min(0, 'El costo debe ser mayor a 0'),
  notes: z.string().optional(),
}).refine(data => data.liters > 0, {
  message: 'Los litros deben ser mayores a 0',
  path: ['liters'],
});

const vehicleSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  licensePlate: z.string().min(1, 'Las placas son requeridas'),
  typeVehicle: z.enum(['car', 'motorcycle'], { message: 'Selecciona un tipo válido' }),
  color: z.string().optional(),
  labeled: z.enum(['YES', 'NO']).optional(),
  gps: z.enum(['YES', 'NO']).optional(),
  taxesPaid: z.enum(['YES', 'NO']).optional(),
  status: z.enum(['Available', 'Assigned', 'Under repair', 'Out of service', 'Accident', 'Stolen', 'Sold']).optional(),
  insuranceCompany: z.string().optional(),
  insuranceCompanyPhone: z.string().optional(),
  policyNumber: z.string().optional(),
  expirationDate: z.string().optional(),
});

type GasolineFormValues = z.infer<typeof gasolineSchema>;
type VehicleFormValues = z.infer<typeof vehicleSchema>;

function VehiclesPageInner() {
  const [gasolineReceipts, setGasolineReceipts] = useState<GasolineReceipt[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [gasolineDialogOpen, setGasolineDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [editingFuel, setEditingFuel] = useState<GasolineReceipt | null>(null);
  const [deletingFuel, setDeletingFuel] = useState<GasolineReceipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('vehicles');

  // Cargar datos iniciales
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gasolineRes, vehiclesRes] = await Promise.all([
        logisticsService.getGasolineReceipts(),
        logisticsService.getVehicles(),
      ]);
      setGasolineReceipts(Array.isArray(gasolineRes) ? gasolineRes : []);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gasolineForm = useForm<GasolineFormValues>({
    resolver: zodResolver(gasolineSchema),
    defaultValues: {
      vehicle_id: 0,
      mileage: 0,
      liters: 0,
      cost_per_liter: 0,
      notes: '',
    },
  });

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brand: '',
      model: '',
      licensePlate: '',
      typeVehicle: 'car',
      color: '',
      labeled: undefined,
      gps: undefined,
      taxesPaid: undefined,
      status: 'Available',
      insuranceCompany: '',
      insuranceCompanyPhone: '',
      policyNumber: '',
      expirationDate: '',
    },
  });

  const onGasolineSubmit = async (data: GasolineFormValues) => {
    setSaving(true);
    try {
      if (editingFuel) {
        await logisticsService.updateGasolineReceipt(editingFuel.id, {
          vehicleId: data.vehicle_id,
          mileage: data.mileage,
          liters: data.liters,
          costPerLiter: data.cost_per_liter,
          totalCost: data.liters * data.cost_per_liter,
          notes: data.notes,
        });
      } else {
        await logisticsService.createGasolineReceipt({
          vehicleId: data.vehicle_id,
          mileage: data.mileage,
          liters: data.liters,
          costPerLiter: data.cost_per_liter,
          totalCost: data.liters * data.cost_per_liter,
          notes: data.notes,
        });
      }
      setGasolineDialogOpen(false);
      gasolineForm.reset();
      setEditingFuel(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving receipt:', error);
      alert('Error al guardar registro de combustible: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const onVehicleSubmit = async (data: VehicleFormValues) => {
    setSaving(true);
    try {
      if (editingVehicle) {
        await logisticsService.updateVehicle(editingVehicle.id, {
          brand: data.brand,
          model: data.model,
          licensePlate: data.licensePlate,
          typeVehicle: data.typeVehicle || 'car',
          color: data.color || null,
          labeled: data.labeled || null,
          gps: data.gps || null,
          taxesPaid: data.taxesPaid || null,
          status: data.status || 'Available',
          insuranceCompany: data.insuranceCompany || null,
          insuranceCompanyPhone: data.insuranceCompanyPhone || null,
          policyNumber: data.policyNumber || null,
          expirationDate: data.expirationDate || null,
        });
      } else {
        await logisticsService.createVehicle({
          brand: data.brand,
          model: data.model,
          licensePlate: data.licensePlate,
          typeVehicle: data.typeVehicle || 'car',
          color: data.color || null,
          labeled: data.labeled || null,
          gps: data.gps || null,
          taxesPaid: data.taxesPaid || null,
          status: data.status || 'Available',
          insuranceCompany: data.insuranceCompany || null,
          insuranceCompanyPhone: data.insuranceCompanyPhone || null,
          policyNumber: data.policyNumber || null,
          expirationDate: data.expirationDate || null,
        });
      }
      setVehicleDialogOpen(false);
      vehicleForm.reset();
      setEditingVehicle(null);
      fetchData();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        Object.keys(backendErrors).forEach((key) => {
          const formKey = key.replace('_', '');
          vehicleForm.setError(formKey as any, { 
            message: backendErrors[key][0] 
          });
        });
      } else {
        alert('Error al guardar vehículo: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    setSaving(true);
    try {
      await logisticsService.deleteVehicle(deletingVehicle.id);
      setDeletingVehicle(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      alert('Error al eliminar vehículo: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFuel = async () => {
    if (!deletingFuel) return;
    setSaving(true);
    try {
      await logisticsService.deleteGasolineReceipt(deletingFuel.id);
      setDeletingFuel(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting fuel:', error);
      alert('Error al eliminar registro de combustible: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    vehicleForm.reset({
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      licensePlate: vehicle.licensePlate || '',
      typeVehicle: vehicle.typeVehicle || 'car',
      color: vehicle.color || '',
      labeled: vehicle.labeled as 'YES' | 'NO' | undefined || undefined,
      gps: vehicle.gps as 'YES' | 'NO' | undefined || undefined,
      taxesPaid: vehicle.taxesPaid as 'YES' | 'NO' | undefined || undefined,
      status: vehicle.status || 'Available',
      insuranceCompany: vehicle.insuranceCompany || '',
      insuranceCompanyPhone: vehicle.insuranceCompanyPhone || '',
      policyNumber: vehicle.policyNumber || '',
      expirationDate: vehicle.expirationDate || '',
    });
    setVehicleDialogOpen(true);
  };

  const openEditFuel = (receipt: GasolineReceipt) => {
    setEditingFuel(receipt);
    gasolineForm.reset({
      vehicle_id: receipt.vehicleId || 0,
      mileage: receipt.mileage || 0,
      liters: receipt.liters || 0,
      cost_per_liter: receipt.costPerLiter || 0,
      notes: receipt.notes || '',
    });
    setGasolineDialogOpen(true);
  };

  const totalGasoline = (gasolineReceipts || []).reduce((sum: number, r) => sum + Number(r.totalCost || 0), 0);
  const totalLiters = (gasolineReceipts || []).reduce((sum: number, r) => sum + Number(r.liters || 0), 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

  // Labels de status en español
  const statusLabels: Record<string, string> = {
    'Available': 'Disponible',
    'Assigned': 'Asignado',
    'Under repair': 'En reparación',
    'Out of service': 'Fuera de servicio',
    'Accident': 'Accidentado',
    'Stolen': 'Robado',
    'Sold': 'Vendido',
  };

  const getStatusLabel = (status?: string) => statusLabels[status || 'Available'] || status || 'Disponible';

  return (
    <ERPLayout title="Vehículos" subtitle="Gestión de vehículos y combustible">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-500" />
                {vehicles.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Litros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Fuel className="h-5 w-5 text-green-500" />
                {(totalLiters || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gasto Combustible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                {formatCurrency(totalGasoline || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Vehículos y Combustible */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="fuel" className="flex items-center gap-2">
              <Fuel className="h-4 w-4" />
              Combustible
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => { setEditingVehicle(null); vehicleForm.reset({ brand: '', model: '', licensePlate: '', typeVehicle: 'car', color: '', labeled: undefined, gps: undefined, taxesPaid: undefined, status: 'Available', insuranceCompany: '', insuranceCompanyPhone: '', policyNumber: '', expirationDate: ''}); setVehicleDialogOpen(true); }}>
                <Car className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Lista de Vehículos</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay vehículos registrados
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Marca/Modelo</TableHead>
                        <TableHead>Placas</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">
                            {vehicle.brand} {vehicle.model}
                          </TableCell>
                          <TableCell>{vehicle.licensePlate}</TableCell>
                          <TableCell>{vehicle.typeVehicle === 'car' ? 'Automóvil' : 'Motocicleta'}</TableCell>
                          <TableCell>{vehicle.color || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                              vehicle.status === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                              vehicle.status === 'Under repair' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusLabel(vehicle.status)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditVehicle(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingVehicle(vehicle)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fuel" className="mt-6 space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => { setEditingFuel(null); gasolineForm.reset({ vehicle_id: 0, mileage: 0, liters: 0, cost_per_liter: 0, notes: '' }); setGasolineDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Combustible
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Registro de Combustible</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : gasolineReceipts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay registros de combustible
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehículo</TableHead>
                        <TableHead>Kilometraje</TableHead>
                        <TableHead className="text-right">Litros</TableHead>
                        <TableHead className="text-right">$/Litro</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gasolineReceipts.map((receipt) => (
                        <TableRow key={receipt.id}>
                          <TableCell className="font-medium">
                            {receipt.vehicle?.brand} {receipt.vehicle?.model} ({receipt.vehicle?.licensePlate})
                          </TableCell>
                          <TableCell>{Number(receipt.mileage || 0).toLocaleString()} km</TableCell>
                          <TableCell className="text-right">{Number(receipt.liters || 0).toFixed(2)} L</TableCell>
                          <TableCell className="text-right">{formatCurrency(receipt.costPerLiter)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(receipt.totalCost)}
                          </TableCell>
                          <TableCell>
                            {receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString('es-MX') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => openEditFuel(receipt)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingFuel(receipt)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para agregar/editar combustible */}
        <Dialog open={gasolineDialogOpen} onOpenChange={(open) => { setGasolineDialogOpen(open); if (!open) { setEditingFuel(null); gasolineForm.reset({ vehicle_id: 0, mileage: 0, liters: 0, cost_per_liter: 0, notes: '' }); } }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFuel ? 'Editar Registro de Combustible' : 'Nuevo Registro de Combustible'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={gasolineForm.handleSubmit(onGasolineSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="vehicle">Vehículo</Label>
                <Select
                  value={gasolineForm.watch('vehicle_id') ? String(gasolineForm.watch('vehicle_id')) : ''}
                  onValueChange={(value) => gasolineForm.setValue('vehicle_id', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {gasolineForm.formState.errors.vehicle_id && (
                  <p className="text-sm text-red-500">{gasolineForm.formState.errors.vehicle_id.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Kilometraje</Label>
                  <Input
                    id="mileage"
                    type="number"
                    {...gasolineForm.register('mileage', { valueAsNumber: true })}
                  />
                  {gasolineForm.formState.errors.mileage && (
                    <p className="text-sm text-red-500">{gasolineForm.formState.errors.mileage.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="liters">Litros</Label>
                  <Input
                    id="liters"
                    type="number"
                    step="0.01"
                    {...gasolineForm.register('liters', { valueAsNumber: true })}
                  />
                  {gasolineForm.formState.errors.liters && (
                    <p className="text-sm text-red-500">{gasolineForm.formState.errors.liters.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cost_per_liter">Precio por Litro</Label>
                <Input
                  id="cost_per_liter"
                  type="number"
                  step="0.01"
                  {...gasolineForm.register('cost_per_liter', { valueAsNumber: true })}
                />
                {gasolineForm.formState.errors.cost_per_liter && (
                  <p className="text-sm text-red-500">{gasolineForm.formState.errors.cost_per_liter.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  {...gasolineForm.register('notes')}
                  placeholder="Notas adicionales..."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setGasolineDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog para agregar/editar vehículo */}
        <Dialog open={vehicleDialogOpen} onOpenChange={(open) => { setVehicleDialogOpen(open); if (!open) setEditingVehicle(null); }}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={vehicleForm.handleSubmit(onVehicleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    {...vehicleForm.register('brand')}
                    placeholder="Toyota"
                  />
                  {vehicleForm.formState.errors.brand && (
                    <p className="text-sm text-red-500">{vehicleForm.formState.errors.brand.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    {...vehicleForm.register('model')}
                    placeholder="Hilux"
                  />
                  {vehicleForm.formState.errors.model && (
                    <p className="text-sm text-red-500">{vehicleForm.formState.errors.model.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licensePlate">Placas *</Label>
                  <Input
                    id="licensePlate"
                    {...vehicleForm.register('licensePlate')}
                    placeholder="ABC-1234"
                  />
                  {vehicleForm.formState.errors.licensePlate && (
                    <p className="text-sm text-red-500">{vehicleForm.formState.errors.licensePlate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...vehicleForm.register('color')}
                    placeholder="Blanco"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="typeVehicle">Tipo de Vehículo *</Label>
                  <Select
                    value={vehicleForm.watch('typeVehicle') || 'car'}
                    onValueChange={(value) => vehicleForm.setValue('typeVehicle', value as 'car' | 'motorcycle')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Automóvil</SelectItem>
                      <SelectItem value="motorcycle">Motocicleta</SelectItem>
                    </SelectContent>
                  </Select>
                  {vehicleForm.formState.errors.typeVehicle && (
                    <p className="text-sm text-red-500">{vehicleForm.formState.errors.typeVehicle.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={vehicleForm.watch('status') || 'Available'}
                    onValueChange={(value) => vehicleForm.setValue('status', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Disponible</SelectItem>
                      <SelectItem value="Assigned">Asignado</SelectItem>
                      <SelectItem value="Under repair">En reparación</SelectItem>
                      <SelectItem value="Out of service">Fuera de servicio</SelectItem>
                      <SelectItem value="Accident">Accidente</SelectItem>
                      <SelectItem value="Stolen">Robado</SelectItem>
                      <SelectItem value="Sold">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="labeled">Identificado</Label>
                  <Select
                    value={vehicleForm.watch('labeled') || ''}
                    onValueChange={(value) => vehicleForm.setValue('labeled', value as 'YES' | 'NO')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Sí</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gps">GPS</Label>
                  <Select
                    value={vehicleForm.watch('gps') || ''}
                    onValueChange={(value) => vehicleForm.setValue('gps', value as 'YES' | 'NO')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Sí</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxesPaid">Impuestos Pagados</Label>
                  <Select
                    value={vehicleForm.watch('taxesPaid') || ''}
                    onValueChange={(value) => vehicleForm.setValue('taxesPaid', value as 'YES' | 'NO')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">Sí</SelectItem>
                      <SelectItem value="NO">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceCompany">Compañía de Seguros</Label>
                  <Input
                    id="insuranceCompany"
                    {...vehicleForm.register('insuranceCompany')}
                    placeholder="Qualitas"
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceCompanyPhone">Teléfono de Seguros</Label>
                  <Input
                    id="insuranceCompanyPhone"
                    {...vehicleForm.register('insuranceCompanyPhone')}
                    placeholder="55-1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyNumber">Número de Póliza</Label>
                  <Input
                    id="policyNumber"
                    {...vehicleForm.register('policyNumber')}
                    placeholder="POL-123456"
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    {...vehicleForm.register('expirationDate')}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setVehicleDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirmación de eliminación de vehículo */}
        <ConfirmDialog
          open={!!deletingVehicle}
          onOpenChange={() => setDeletingVehicle(null)}
          title="Eliminar Vehículo"
          description={`¿Estás seguro de eliminar el vehículo "${deletingVehicle?.brand} ${deletingVehicle?.model}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDeleteVehicle}
        />

        {/* Confirmación de eliminación de combustible */}
        <ConfirmDialog
          open={!!deletingFuel}
          onOpenChange={() => setDeletingFuel(null)}
          title="Eliminar Registro de Combustible"
          description={`¿Estás seguro de eliminar el registro de combustible del vehículo "${deletingFuel?.vehicle?.brand} ${deletingFuel?.vehicle?.model}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDeleteFuel}
        />
      </div>
    </ERPLayout>
  );
}

export default function VehiclesPage() {
  return (
    <ProtectedRoute>
      <VehiclesPageInner />
    </ProtectedRoute>
  );
}

