"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { workOrdersService } from "@/lib/services/work-orders.service";
import { productionService } from "@/lib/services/production.service";
import { operatorAuthApi, OperatorUser } from "@/lib/api";
import {
  Play,
  Pause,
  CheckCircle,
  Package,
  ClipboardList,
  Plus,
  Minus,
  RefreshCw,
  AlertCircle,
  Loader2,
  LogOut,
} from "lucide-react";

// WorkOrder del backend (snake_case)
interface WorkOrder {
  id: number;
  code: string;
  productName: string;
  clientName: string;
  quantity: number;
  completed: number;
  progress: number;
  status: string;
  priority: string;
  operator?: string;
  product_id?: number;
  // Materiales para la orden de trabajo
  materials?: {
    id: number;
    code: string;
    name: string;
    requiredQuantity: number;
    availableStock: number;
    isAvailable: boolean;
  }[];
  allMaterialsAvailable?: boolean;
  // Campos calculados en el frontend
  productionCount?: number;
  completedProductionCount?: number;
  productionProgress?: number;
}

// Production del backend
interface Production {
  id: number;
  code: string;
  process_id: number;
  process?: {
    id: number;
    name: string;
    requiresMachine: boolean;
  };
  product_process_id: number;
  productProcess?: {
    id: number;
    sequence: number;
  };
  work_order_id: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  qualityStatus?: 'PENDING' | 'APPROVED' | 'SCRAP' | 'REWORK';
  targetParts: number;
  goodParts: number;
  scrapParts: number;
  startTime?: string;
  endTime?: string;
  pauseReason?: string;
  machine?: {
    id: number;
    name: string;
  };
  operator?: {
    id: number;
    name: string;
  };
}

export default function OperadorProduccionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [operator, setOperator] = useState<OperatorUser | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [productions, setProductions] = useState<Production[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validar token de operador al cargar
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('operator_token');
      const userStr = localStorage.getItem('operator_user');

      if (!token || !userStr) {
        router.push('/operador/login');
        return;
      }

      try {
        const user = await operatorAuthApi.getCurrentOperator();
        setOperator(user);
        localStorage.setItem('operator_user', JSON.stringify(user));
      } catch (error) {
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

  // Logout handler
  const handleLogout = async () => {
    try {
      await operatorAuthApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('operator_token');
      localStorage.removeItem('operator_user');
      router.push('/operador/login');
    }
  };

  // Form state
  const [goodParts, setGoodParts] = useState("");
  const [scrapParts, setScrapParts] = useState("0");
  const [machineId, setMachineId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [machines, setMachines] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [pauseReason, setPauseReason] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0); // Tiempo transcurrido en segundos

  // Funciones para incrementar/decrementar piezas
  const incrementGoodParts = () => {
    const current = parseInt(goodParts) || 0;
    setGoodParts((current + 1).toString());
  };

  const decrementGoodParts = () => {
    const current = parseInt(goodParts) || 0;
    if (current > 0) {
      setGoodParts((current - 1).toString());
    }
  };

  const incrementScrapParts = () => {
    const current = parseInt(scrapParts) || 0;
    setScrapParts((current + 1).toString());
  };

  const decrementScrapParts = () => {
    const current = parseInt(scrapParts) || 0;
    if (current > 0) {
      setScrapParts((current - 1).toString());
    }
  };

  // Timer para actualizar el tiempo transcurrido
  useEffect(() => {
    if (selectedProduction?.status === 'in_progress' && selectedProduction?.startTime) {
      const startTime = new Date(selectedProduction.startTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };
      
      // Actualizar inmediatamente
      updateTimer();
      
      // Luego actualizar cada segundo
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [selectedProduction?.status, selectedProduction?.startTime]);

  // Función para formatear tiempo
  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch work orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await workOrdersService.getAssigned();
      // La API devuelve datos en snake_case
      const data = (response as any).data || [];
      
      // Para cada work order, obtener sus producciones y calcular el progreso
      const workOrdersWithProgress = await Promise.all(
        data.map(async (wo: WorkOrder) => {
          try {
            const prods = await workOrdersService.getProductions(wo.id);
            const productions = prods || [];
            const totalProds = productions.length;
            const completedProds = productions.filter((p: Production) => p.status === 'completed').length;
            const prodProgress = totalProds > 0 ? Math.round((completedProds / totalProds) * 100) : wo.progress;
            
            return {
              ...wo,
              productionCount: totalProds,
              completedProductionCount: completedProds,
              productionProgress: prodProgress
            };
          } catch (e) {
            return wo;
          }
        })
      );
      
      setWorkOrders(workOrdersWithProgress);
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar las órdenes de trabajo");
    } finally {
      setLoading(false);
    }
  };

  // Fetch productions for a work order
  const fetchProductions = async (workOrderId: number) => {
    try {
      const data = await workOrdersService.getProductions(workOrderId);
      setProductions(data || []);
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron cargar las producciones");
    }
  };

  // Fetch machines and operators
  const fetchData = async () => {
    try {
      const [machs, ops] = await Promise.all([
        productionService.getMachines(),
        productionService.getOperators(),
      ]);
      setMachines(machs);
      setOperators(ops);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Select work order and load its productions
  const handleSelectWorkOrder = async (wo: WorkOrder) => {
    setSelectedWorkOrder(wo);
    setSelectedProduction(null);
    await fetchProductions(wo.id);
  };

  // Open production detail dialog
  const handleOpenProductionDetail = (production: Production) => {
    setSelectedProduction(production);
    setMachineId(production.machine?.id?.toString() || "");
    setOperatorId(production.operator?.id?.toString() || "");
    // Pre-fill with current values for in_progress/paused productions
    setGoodParts(production.goodParts?.toString() || "");
    setScrapParts(production.scrapParts?.toString() || "0");
    setRegisterOpen(true);
  };

  // Open start production dialog
  const handleOpenStartProduction = (production: Production) => {
    setSelectedProduction(production);
    setMachineId(production.machine?.id?.toString() || "");
    setOperatorId(production.operator?.id?.toString() || "");
    setRegisterOpen(true);
  };

  // Get current production (the one that can be worked on)
  const getCurrentProduction = (): Production | null => {
    // Find the first pending or in_progress production
    // But also check quality gate - previous must be approved
    const sortedProductions = [...productions].sort((a, b) => 
      (a.productProcess?.sequence || 0) - (b.productProcess?.sequence || 0)
    );
    
    for (let i = 0; i < sortedProductions.length; i++) {
      const prod = sortedProductions[i];
      
      // If this production is already completed or cancelled, skip
      if (prod.status === 'completed' || prod.status === 'cancelled') {
        continue;
      }
      
      // If this is the first production, it's always available
      if (i === 0) {
        return prod;
      }
      
      // Check if previous production passed quality
      const prevProd = sortedProductions[i - 1];
      if (prevProd.qualityStatus === 'APPROVED') {
        return prod;
      }
      
      // Previous not approved, can't work on this one
      return null;
    }
    
    return null;
  };

  // Check if production can be started (quality gate)
  const canStartProduction = (production: Production): { canStart: boolean; reason?: string } => {
    const sortedProductions = [...productions].sort((a, b) => 
      (a.productProcess?.sequence || 0) - (b.productProcess?.sequence || 0)
    );
    
    const currentIndex = sortedProductions.findIndex(p => p.id === production.id);
    
    // First production can always start
    if (currentIndex === 0) {
      return { canStart: true };
    }
    
    // Check previous production quality
    const prevProd = sortedProductions[currentIndex - 1];
    
    if (prevProd.qualityStatus !== 'APPROVED') {
      return { 
        canStart: false, 
        reason: `El proceso anterior (${prevProd.process?.name || 'Proceso'}) debe pasar control de calidad primero` 
      };
    }
    
    return { canStart: true };
  };

  // Start production
  const handleStartProduction = async (production: Production) => {
    const check = canStartProduction(production);
    if (!check.canStart) {
      toast.error(check.reason || "No se puede iniciar la producción");
      return;
    }

    setSubmitting(true);
    try {
      // Si el proceso requiere máquina, usar el machineId seleccionado
      // Si no requiere máquina, no enviar machineId
      const requiresMachine = production.process?.requiresMachine ?? false;
      
      // Usar la función start dedicada del servicio
      await productionService.start(production.id, {
        ...(requiresMachine && machineId ? { machineId: parseInt(machineId) } : {}),
      });
      toast.success("La producción ha iniciado");
      
      // Recargar producciones y abrir el modal automáticamente
      if (selectedWorkOrder) {
        const updatedProductions = await workOrdersService.getProductions(selectedWorkOrder.id);
        setProductions(updatedProductions || []);
        
        // Buscar la producción que se acaba de iniciar
        const startedProduction = (updatedProductions || []).find((p: Production) => p.id === production.id);
        if (startedProduction) {
          setSelectedProduction(startedProduction);
          setGoodParts(startedProduction.goodParts?.toString() || "");
          setScrapParts(startedProduction.scrapParts?.toString() || "0");
          // Abrir el modal automáticamente
          setRegisterOpen(true);
        }
      }
    } catch (error: any) {
      // Manejar error 422 de materiales insuficientes
      if (error?.response?.status === 422 && error?.response?.data?.unavailable_materials) {
        const materials = error.response.data.unavailable_materials;
        const message = materials.map((m: any) => 
          `${m.code}: requiere ${m.required}, disponible ${m.available}`
        ).join('\n');
        toast.error(`Materiales insuficientes:\n${message}`);
      } else {
        toast.error(error?.message || "No se pudo iniciar la producción");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Resume production (for paused productions)
  const handleResumeProduction = async (production: Production) => {
    setSubmitting(true);
    try {
      await productionService.resume(production.id);
      toast.success("La producción ha sido reanudada");
      
      // Recargar las producciones para obtener el estado actualizado
      if (selectedWorkOrder) {
        const updatedProductions = await workOrdersService.getProductions(selectedWorkOrder.id);
        setProductions(updatedProductions || []);
        
        // Buscar la producción que se acaba de reanudar
        const resumedProduction = (updatedProductions || []).find((p: Production) => p.id === production.id);
        if (resumedProduction) {
          setSelectedProduction(resumedProduction);
          // El modal se queda abierto y mostrará "Producción en Curso" porque el estado ahora es 'in_progress'
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo reanudar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Pause production
  const handlePauseProduction = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      await productionService.pause(selectedProduction.id, pauseReason || "Pausado por operador");
      toast.success("La producción ha sido pausada");
      setRegisterOpen(false);
      setPauseReason("");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo pausar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  // Register parts
  const handleRegisterParts = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      const newGoodParts = parseInt(goodParts) || 0;
      const newScrapParts = parseInt(scrapParts) || 0;
      
      await productionService.registerParts(
        selectedProduction.id,
        newGoodParts,
        newScrapParts
      );
      toast.success(`Buenas: ${newGoodParts}, Scrap: ${newScrapParts}`);
      
      // Actualizar las producciones sin cerrar el modal
      if (selectedWorkOrder) {
        const updatedProductions = await workOrdersService.getProductions(selectedWorkOrder.id);
        setProductions(updatedProductions || []);
        
        // Actualizar la producción seleccionada con los nuevos valores
        const updatedProduction = (updatedProductions || []).find((p: Production) => p.id === selectedProduction.id);
        if (updatedProduction) {
          setSelectedProduction(updatedProduction);
          // Actualizar los campos con los nuevos valores (ya sumados en el backend)
          setGoodParts(updatedProduction.goodParts?.toString() || "");
          setScrapParts(updatedProduction.scrapParts?.toString() || "0");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudieron registrar las piezas");
    } finally {
      setSubmitting(false);
    }
  };

  // Complete production
  const handleCompleteProduction = async () => {
    if (!selectedProduction) return;

    setSubmitting(true);
    try {
      await productionService.complete(
        selectedProduction.id,
        parseInt(goodParts) || 0,
        parseInt(scrapParts) || 0
      );
      toast.success("La producción ha sido completada");
      // Cerrar el modal al completar
      setRegisterOpen(false);
      setCompleteOpen(false);
      setGoodParts("");
      setScrapParts("0");
      if (selectedWorkOrder) {
        await fetchProductions(selectedWorkOrder.id);
      }
    } catch (error: any) {
      toast.error(error?.message || "No se pudo completar la producción");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!validating) {
      fetchWorkOrders();
      fetchData();
    }
  }, [validating]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getProductionStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">En Producción</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Pausada</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  const getQualityStatusBadge = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-500">Aprobado</Badge>;
      case "SCRAP":
        return <Badge className="bg-red-500">Scrap</Badge>;
      case "REWORK":
        return <Badge className="bg-yellow-500">Rework</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  // Legacy function for work order status
  const getWorkOrderStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500">En Producción</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completada</Badge>;
      case "on_hold":
        return <Badge className="bg-yellow-500">En Espera</Badge>;
      default:
        return <Badge className="bg-gray-500">Pendiente</Badge>;
    }
  };

  if (validating || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (    
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Órdenes de Trabajo</h1>
          <p className="text-muted-foreground">Selecciona una orden para registrar producción</p>
          {operator && (
            <p className="text-sm text-muted-foreground mt-1">Operador: {operator.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchWorkOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {workOrders.filter((wo) => wo.status === "draft").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">En Producción</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {workOrders.filter((wo) => wo.status === "in_progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">Completadas</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {workOrders.filter((wo) => wo.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Órdenes de Trabajo Asignadas</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay órdenes de trabajo asignadas
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{wo.productName}</h3>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(wo.priority)}`} />
                      {getWorkOrderStatusBadge(wo.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cliente: {wo.clientName} | Cantidad: {wo.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={wo.productionProgress ?? wo.progress} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{wo.productionProgress ?? wo.progress}%</span>
                      <span className="text-sm text-muted-foreground">
                        ({wo.completedProductionCount ?? 0}/{wo.productionCount ?? 0} procesos)
                      </span>
                    </div>
                    {/* Materiales requeridos */}
                    {wo.materials && wo.materials.length > 0 && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Package className="h-3 w-3" />
                          <span className="font-medium">Materiales:</span>
                          {!wo.allMaterialsAvailable && (
                            <Badge variant="destructive" className="ml-auto text-[10px] h-4">
                              Faltantes
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {wo.materials.slice(0, 4).map((mat) => (
                            <span
                              key={mat.id}
                              className={`px-1.5 py-0.5 rounded ${
                                mat.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                              title={`${mat.name}: requiere ${mat.requiredQuantity}, disponible ${mat.availableStock}`}
                            >
                              {mat.code}: {mat.availableStock}/{mat.requiredQuantity}
                            </span>
                          ))}
                          {wo.materials.length > 4 && (
                            <span className="text-muted-foreground">+{wo.materials.length - 4} más</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSelectWorkOrder(wo)}
                      disabled={wo.status === "completed"}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ver Producciones
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productions List - Show when a work order is selected */}
      {selectedWorkOrder && productions.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Producciones - {selectedWorkOrder.productName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productions
                .sort((a, b) => (a.productProcess?.sequence || 0) - (b.productProcess?.sequence || 0))
                .map((production, index) => {
                  const qualityCheck = canStartProduction(production);
                  const canWork = qualityCheck.canStart || production.status !== 'pending';
                  
                  return (
                    <div
                      key={production.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        production.status === 'in_progress' 
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30' 
                          : production.status === 'completed'
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/30'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{production.process?.name || `Proceso ${production.process_id}`}</h4>
                            {getProductionStatusBadge(production.status)}
                            {production.qualityStatus && getQualityStatusBadge(production.qualityStatus)}
                            {production.machine && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Máquina: {production.machine.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                            <span>Meta: {production.targetParts} piezas</span>
                            <span>Buenos: {production.goodParts || 0}</span>
                            <span>Scrap: {production.scrapParts || 0}</span>
                            {production.process?.requiresMachine && (
                              <span className="text-orange-600 text-xs">
                                {production.machine ? 'Máquina asignada' : 'Requiere máquina'}
                              </span>
                            )}
                          </div>
                          {!canWork && production.status === 'pending' && (
                            <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {qualityCheck.reason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {production.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenStartProduction(production)}
                            disabled={!qualityCheck.canStart}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {production.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenProductionDetail(production)}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Continuar
                          </Button>
                        )}
                        {production.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenProductionDetail(production)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Reanudar
                          </Button>
                        )}
                        {production.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenProductionDetail(production)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ver Detalle
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No productions message */}
      {selectedWorkOrder && productions.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay producciones asociadas a esta orden</p>
              <p className="text-sm mt-1">Las producciones se crean automáticamente al aprobar la orden</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Detail Dialog */}
      <Dialog open={registerOpen} onOpenChange={(open) => {
        setRegisterOpen(open);
        if (!open) {
          setSelectedProduction(null);
          setGoodParts("");
          setScrapParts("0");
          setPauseReason("");
        }
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduction?.status === 'pending' && "Iniciar Producción"}
              {selectedProduction?.status === 'in_progress' && "Producción en Curso"}
              {selectedProduction?.status === 'paused' && "Reanudar Producción"}
              {selectedProduction?.status === 'completed' && "Producción Completada"}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkOrder?.productName} - Proceso: {selectedProduction?.process?.name || 'N/A'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Production Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Secuencia</p>
                <p className="font-medium">{selectedProduction?.productProcess?.sequence || 1}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                {getProductionStatusBadge(selectedProduction?.status || 'pending')}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Calidad</p>
                {getQualityStatusBadge(selectedProduction?.qualityStatus)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Meta</p>
                <p className="font-medium">{selectedProduction?.targetParts || 0} piezas</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Máquina</p>
                {selectedProduction?.machine ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                    {selectedProduction.machine.name}
                  </Badge>
                ) : (
                  <p className="text-sm text-orange-600 mt-1">
                    {selectedProduction?.process?.requiresMachine ? 'Sin asignar - Seleccione una máquina' : 'No requiere máquina'}
                  </p>
                )}
              </div>
            </div>

            {/* Start Production - Select Machine (only if process requires it) */}
            {selectedProduction?.status === 'pending' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Mostrar máquina solo si el proceso la requiere */}
                  {selectedProduction?.process?.requiresMachine ? (
                    <div className="space-y-2">
                      <Label>Máquina *</Label>
                      <Select value={machineId} onValueChange={setMachineId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar máquina" />
                        </SelectTrigger>
                        <SelectContent>
                          {machines.map((mach) => (
                            <SelectItem key={mach.id} value={String(mach.id)}>
                              {mach.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    // Si no requiere máquina, aseguramos que machineId esté vacío
                    <input type="hidden" value="" onChange={() => setMachineId("")} />
                  )}
                </div>
              </div>
            )}

            {/* In Progress - Register Parts or Pause */}
            {selectedProduction?.status === 'in_progress' && (
              <div className="space-y-4">
                {/* Timer Visual */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400 text-center mb-1">Tiempo Transcurrido</p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-300 text-center font-mono">
                    {formatElapsedTime(elapsedTime)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Piezas Buenos *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementGoodParts}
                        disabled={submitting}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={goodParts}
                        onChange={(e) => setGoodParts(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementGoodParts}
                        disabled={submitting}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Scrap</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementScrapParts}
                        disabled={submitting}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={scrapParts}
                        onChange={(e) => setScrapParts(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementScrapParts}
                        disabled={submitting}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Razón de pausa (opcional)</Label>
                  <Input
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    placeholder="Razón si va a pausar..."
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Piezas registradas: Buenos {selectedProduction?.goodParts || 0}, Scrap {selectedProduction?.scrapParts || 0}
                </div>
              </div>
            )}

            {/* Paused - Resume or Complete */}
            {selectedProduction?.status === 'paused' && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Razón de pausa: {selectedProduction?.pauseReason || 'No especificada'}</p>
                  <p className="mt-2">Piezas registradas: Buenos {selectedProduction?.goodParts || 0}, Scrap {selectedProduction?.scrapParts || 0}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Piezas Buenos adicionales</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementGoodParts}
                        disabled={submitting}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={goodParts}
                        onChange={(e) => setGoodParts(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementGoodParts}
                        disabled={submitting}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Scrap adicional</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementScrapParts}
                        disabled={submitting}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={scrapParts}
                        onChange={(e) => setScrapParts(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementScrapParts}
                        disabled={submitting}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Completed - Show Summary */}
            {selectedProduction?.status === 'completed' && (
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Piezas Buenos:</span>
                  <span className="font-medium text-green-500">{selectedProduction?.goodParts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scrap:</span>
                  <span className="font-medium text-red-500">{selectedProduction?.scrapParts || 0}</span>
                </div>
                {selectedProduction?.startTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inició:</span>
                    <span className="font-medium">{new Date(selectedProduction.startTime).toLocaleString()}</span>
                  </div>
                )}
                {selectedProduction?.endTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finalizó:</span>
                    <span className="font-medium">{new Date(selectedProduction.endTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegisterOpen(false)}>
              Cerrar
            </Button>
            
            {/* Pending - Start Button */}
            {selectedProduction?.status === 'pending' && (
              <Button 
                onClick={() => handleStartProduction(selectedProduction)} 
                disabled={submitting || (selectedProduction?.process?.requiresMachine ? !machineId : false)}
              >
                {submitting ? "Iniciando..." : "Iniciar Producción"}
              </Button>
            )}

            {/* In Progress - Register/Pause Buttons */}
            {selectedProduction?.status === 'in_progress' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handlePauseProduction}
                  disabled={submitting}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pausar
                </Button>
                {(() => {
                  // const currentGoodParts = selectedProduction?.goodParts || 0;
                  const newParts = parseInt(goodParts) || 0;
                  const totalAfterRegister = newParts;
                  const targetParts = selectedProduction?.targetParts || 0;
                  const reachedTarget = totalAfterRegister >= targetParts;
                  
                  return (
                    <>
                      <Button 
                        onClick={handleRegisterParts}
                        disabled={submitting || !goodParts}
                      >
                        {submitting ? "Registrando..." : "Registrar Piezas"}
                      </Button>
                      {reachedTarget && (
                        <Button 
                          onClick={handleCompleteProduction}
                          disabled={submitting}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Paused - Resume/Complete Buttons */}
            {selectedProduction?.status === 'paused' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleResumeProduction(selectedProduction)}
                  disabled={submitting}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Reanudar
                </Button>
                <Button 
                  onClick={handleCompleteProduction}
                  disabled={submitting}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>    
  );
}
