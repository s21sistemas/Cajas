"use client";

import { useEffect, useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { productionService } from "@/lib/services/production.service";
import { clientsService } from "@/lib/services/clients.service";
import { salesService } from "@/lib/services/sales.service";
import type { Production } from "@/lib/types/production.types";
import {
  ProductionStats,
  ProductionCard,
  CreateProductionDialog,
  EditProductionDialog,
  DeleteProductionDialog,
  ActionDialogs,
  ProductionFilters,
  EmptyProductionList,
  RegisterPartsDialog,
} from "./components";
import type { CreateProductionForm, Process, Operator, Machine, WorkOrder, Product } from "./types";
import { DEFAULT_FORM } from "./types";

// Valores por defecto para datos mock (usados solo si falla el backend)
const DEFAULT_PROCESSES: Process[] = [
  { id: 1, name: "Corrugado", requiresMachine: true },
  { id: 2, name: "Impresion Flexografica", requiresMachine: true },
  { id: 3, name: "Troquelado", requiresMachine: true },
  { id: 4, name: "Pegado Manual", requiresMachine: false },
  { id: 5, name: "Pegado Automatico", requiresMachine: true },
  { id: 6, name: "Ensamble Manual", requiresMachine: false },
  { id: 7, name: "Ranurado (Slotter)", requiresMachine: true },
  { id: 8, name: "Inspeccion de Calidad", requiresMachine: false },
  { id: 9, name: "Empaque y Flejado", requiresMachine: false },
];

const DEFAULT_OPERATORS: Operator[] = [
  { id: 1, name: "Carlos Mendoza" },
  { id: 2, name: "Ana Rodriguez" },
  { id: 3, name: "Miguel Torres" },
  { id: 4, name: "Roberto Sanchez" },
  { id: 5, name: "Luisa Garcia" },
];

const DEFAULT_MACHINES: Machine[] = [
  { id: 1, name: "Corrugadora BHS" },
  { id: 2, name: "Flexo Ward 4 Tintas" },
  { id: 3, name: "Troqueladora Bobst" },
  { id: 4, name: "Pegadora Automatica" },
  { id: 5, name: "Ranuradora" },
];

export default function ProduccionPage() {
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<Production[]>([]);
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [machines, setMachines] = useState<Machine[]>(DEFAULT_MACHINES);
  const [operators, setOperators] = useState<Operator[]>(DEFAULT_OPERATORS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterSale, setFilterSale] = useState<string>("all");
  const [filterWorkOrder, setFilterWorkOrder] = useState<string>("all");
  const [filterProcess, setFilterProcess] = useState<string>("all");
  const [filterMachine, setFilterMachine] = useState<string>("all");
  const [filterOperator, setFilterOperator] = useState<string>("all");
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [sales, setSales] = useState<{ id: number; code: string }[]>([]);
  
  // Estados para carga bajo demanda
  const [loadingCreateData, setLoadingCreateData] = useState(false);
  const [loadingFiltersData, setLoadingFiltersData] = useState(false);
  const [createDataLoaded, setCreateDataLoaded] = useState(false);
  const [filtersDataLoaded, setFiltersDataLoaded] = useState(false);
  
  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRegisterPartsDialog, setShowRegisterPartsDialog] = useState(false);
  
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [pauseReason, setPauseReason] = useState("");
  const [saving, setSaving] = useState(false);
  // Loading por producción y acción - objeto con clave "productionId-accion"
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  
  const [form, setForm] = useState<CreateProductionForm>(DEFAULT_FORM);

  // Cargar productions al inicio y filtros en background (sin await para no bloquear)
  useEffect(() => {
    async function loadData() {
      try {
        // Cargar productions (necesario para la UI)
        const productionsData = await productionService.getAll().catch(() => []);
        setProductions(productionsData || []);
        
        // Cargar filtros en background (sin bloquear)
        // Se cargan aquí para que estén disponibles cuando se abran los dropdowns
        if (!filtersDataLoaded) {
          const [clientsData, salesData, workOrdersData] = await Promise.all([
            clientsService.selectList().catch(() => []),
            salesService.getSelectList().catch(() => []),
            productionService.getWorkOrders().catch(() => []),
          ]).catch(() => []);
          
          setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name })));
          setSales(salesData.map((s: any) => ({ id: s.id, code: s.code || s.invoice || `Venta-${s.id}` })));
          setWorkOrders((workOrdersData || []) as any);
          setFiltersDataLoaded(true);
        }
      } catch (error) {
        console.error("Error cargando productions:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cargar datos para el diálogo de creación (bajo demanda)
  // IMPORTANTE: Esta función se llama al hacer click en "Nueva Orden"
  // Carga: procesos, máquinas, operadores, órdenes de trabajo y productos
  const loadCreateData = async () => {
    if (createDataLoaded) return;
    setLoadingCreateData(true);
    try {
      // Cargar en paralelo todos los datos necesarios para el formulario de creación
      const [processesData, machinesData, operatorsData, workOrdersData, productsData, clientsData] = await Promise.all([
        productionService.getProcesses().catch(() => DEFAULT_PROCESSES as any),
        productionService.getMachines().catch(() => DEFAULT_MACHINES as any),
        productionService.getOperators().catch(() => DEFAULT_OPERATORS as any),
        productionService.getWorkOrders().catch(() => []),
        productionService.getProducts().catch(() => []),
        clientsService.selectList().catch(() => []),
      ]);
      
      setProcesses(processesData || DEFAULT_PROCESSES);
      setMachines(machinesData || DEFAULT_MACHINES);
      setOperators(operatorsData || DEFAULT_OPERATORS);
      setWorkOrders((workOrdersData || []) as any);
      setProducts((productsData || []) as any);
      // También cargar clients por si se necesita para autocompletar
      setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name })));
      setCreateDataLoaded(true);
    } catch (error) {
      console.error("Error cargando datos de creación:", error);
    } finally {
      setLoadingCreateData(false);
    }
  };

  // Cargar datos para filtros (bajo demanda) - incluye también workOrders para el filtro
  const loadFiltersData = async () => {
    if (filtersDataLoaded) return;
    setLoadingFiltersData(true);
    try {
      const [clientsData, salesData, workOrdersData] = await Promise.all([
        clientsService.selectList().catch(() => []),
        salesService.getSelectList().catch(() => []),
        productionService.getWorkOrders().catch(() => []),
      ]);
      
      setClients(clientsData.map((c: any) => ({ id: c.id, name: c.name })));
      setSales(salesData.map((s: any) => ({ id: s.id, code: s.code || s.invoice || `Venta-${s.id}` })));
      setWorkOrders((workOrdersData || []) as any);
      setFiltersDataLoaded(true);
    } catch (error) {
      console.error("Error cargando datos de filtros:", error);
    } finally {
      setLoadingFiltersData(false);
    }
  };

  // Recargar productions cuando cambian los filtros o la búsqueda
  useEffect(() => {
    let isCancelled = false;
    
    async function loadProductions() {
      // Siempre recargar cuando cambie algo (filtros o búsqueda)
      const hasFilters = filterStatus !== 'all' || filterClient !== 'all' || filterSale !== 'all' || filterWorkOrder !== 'all';
      const hasSearch = searchTerm.trim().length > 0;
      
      if (!hasFilters && !hasSearch) {
        // Sin filtros ni búsqueda, cargar todas las productions
        try {
          const productionsData = await productionService.getAll().catch(() => []);
          if (!isCancelled) {
            setProductions(productionsData || []);
          }
        } catch (error) {
          console.error("Error recargando producciones:", error);
        }
        return;
      }
      
      try {
        const filters: any = {};
        if (filterStatus !== 'all') filters.status = filterStatus;
        if (filterClient !== 'all') filters.client_id = Number(filterClient);
        if (filterSale !== 'all') filters.sale_id = Number(filterSale);
        if (filterWorkOrder !== 'all') filters.work_order_id = Number(filterWorkOrder);
        if (hasSearch) filters.search = searchTerm.trim();
        
        const productionsData = await productionService.getAll(filters).catch(() => []);
        if (!isCancelled) {
          setProductions(productionsData || []);
        }
      } catch (error) {
        console.error("Error recargando producciones:", error);
      }
    }
    
    // Solo recargar si ya se cargaron los datos iniciales
    if (!loading) {
      loadProductions();
    }
    
    return () => {
      isCancelled = true;
    };
  }, [filterStatus, filterClient, filterSale, filterWorkOrder, searchTerm, loading]);

  // Las productions ya vienen filtradas del backend (useEffect con filtros)
  // No necesitamos filtrado local adicional
  const filtered = productions;

  // Handlers de acciones
  async function handleCreate() {
    if (!form.processId) {
      toast.error("Selecciona un proceso");
      return;
    }
    
    // Validar que tenga product_id o work_order_id
    if (!form.productId && !form.workOrderId) {
      toast.error("Selecciona un producto o una orden de trabajo");
      return;
    }
    
    setSaving(true);
    try {
      const newProduction = await productionService.create({
        processId: form.processId,
        operatorId: form.operatorId ? form.operatorId : null,
        machineId: form.machineId ? form.machineId : null,
        productId: form.productId ? form.productId : null,
        targetParts: form.targetParts,
        notes: form.notes || undefined,
        startTime: new Date().toISOString(),
        workOrderId: form.workOrderId ? form.workOrderId : undefined,
        parentProductionId: form.parentProductionId ? form.parentProductionId : null,
      });
      
      setProductions([newProduction, ...productions]);
      setShowCreateDialog(false);
      setForm(DEFAULT_FORM);
      toast.success("Orden de producción creada");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo crear la orden";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(p: Production) {
    const actionKey = `${p.id}-start`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.start(p.id);
      setProductions(productions.map((prod) => (prod.id === p.id ? updated : prod)));
      toast.success("Producción iniciada");
    } catch (error: any) {
      const errorMessage = error?.message || "No se pudo iniciar la producción";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  async function handlePause() {
    if (!selectedProduction) return;
    const actionKey = `${selectedProduction.id}-pause`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.pause(selectedProduction.id, pauseReason);
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowPauseDialog(false);
      setPauseReason("");
      toast.success("Producción pausada");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo pausar";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  async function handleResume() {
    if (!selectedProduction) return;
    const actionKey = `${selectedProduction.id}-resume`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.resume(selectedProduction.id);
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowResumeDialog(false);
      toast.success("Producción reanudada");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo reanudar";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  async function handleComplete() {
    if (!selectedProduction) return;
    const actionKey = `${selectedProduction.id}-complete`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.complete(
        selectedProduction.id,
        selectedProduction.goodParts || 0,
        selectedProduction.scrapParts || 0
      );
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowCompleteDialog(false);
      toast.success("Producción completada");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo completar";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  async function handleCancel() {
    if (!selectedProduction) return;
    const actionKey = `${selectedProduction.id}-cancel`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.cancel(selectedProduction.id, "Cancelado por usuario");
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowCancelDialog(false);
      toast.success("Producción cancelada");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo cancelar";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  // Función para abrir diálogo de registrar piezas
  function openRegisterPartsDialog(p: Production) {
    setSelectedProduction(p);
    setShowRegisterPartsDialog(true);
  }

  // Handler para registrar piezas
  async function handleRegisterParts(goodParts: number, scrapParts: number) {
    if (!selectedProduction) return;
    const actionKey = `${selectedProduction.id}-registerParts`;
    setLoadingActions(prev => ({ ...prev, [actionKey]: true }));
    try {
      const updated = await productionService.registerParts(
        selectedProduction.id,
        goodParts,
        scrapParts
      );
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowRegisterPartsDialog(false);
      toast.success("Piezas registradas correctamente");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudieron registrar las piezas";
      toast.error(errorMessage);
    } finally {
      setLoadingActions(prev => ({ ...prev, [actionKey]: false }));
    }
  }

  // Funciones para abrir diálogos de edición y eliminación
  function openEditDialog(p: Production) {
    setSelectedProduction(p);
    setForm({
      processId: 0, // El proceso no se puede cambiar en edición
      machineId: p.machineId ? p.machineId : 0,
      operatorId: p.operatorId ? p.operatorId : 0,
      productId: 0,
      targetParts: p.targetParts || 0,
      notes: '',
      workOrderId: 0,
      parentProductionId: p.parentProductionId ? p.parentProductionId : 0,
    });
    setShowEditDialog(true);
  }

  function openDeleteDialog(p: Production) {
    setSelectedProduction(p);
    setShowDeleteDialog(true);
  }

  // Handler para editar
  async function handleEdit() {
    if (!selectedProduction) return;
    setSaving(true);
    try {
      const updated = await productionService.update(selectedProduction.id, {
        machineId: form.machineId ? form.machineId : null,
        operatorId: form.operatorId ? form.operatorId : null,
        targetParts: form.targetParts,
        notes: form.notes || null,
      });
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowEditDialog(false);
      setForm(DEFAULT_FORM);
      toast.success("Orden actualizada correctamente");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo actualizar la orden";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  // Handler para eliminar
  async function handleDelete() {
    if (!selectedProduction) return;
    setSaving(true);
    try {
      await productionService.delete(selectedProduction.id);
      setProductions(productions.filter((p) => p.id !== selectedProduction.id));
      setShowDeleteDialog(false);
      toast.success("Orden eliminada correctamente");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || "No se pudo eliminar la orden";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  // Funciones para abrir diálogos de acción
  function openPauseDialog(p: Production) {
    setSelectedProduction(p);
    setShowPauseDialog(true);
  }

  function openResumeDialog(p: Production) {
    setSelectedProduction(p);
    setShowResumeDialog(true);
  }

  function openCompleteDialog(p: Production) {
    setSelectedProduction(p);
    setShowCompleteDialog(true);
  }

  function openCancelDialog(p: Production) {
    setSelectedProduction(p);
    setShowCancelDialog(true);
  }

  // Loading state
  if (loading) {
    return (
      <ProtectedRoute>
        <ERPLayout title="Produccion" subtitle="Registro y seguimiento de produccion en tiempo real">
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 bg-card" />
              ))}
            </div>
            <Skeleton className="h-[400px] bg-card" />
          </div>
        </ERPLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ERPLayout title="Produccion" subtitle="Registro y seguimiento de produccion en tiempo real">
        <div className="space-y-6">
          {/* Stats */}
          <ProductionStats productions={productions} />

          {/* Filters */}
          <ProductionFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            onCreateClick={async () => {
              await loadCreateData();
              setShowCreateDialog(true);
            }}
            clients={clients}
            selectedClient={filterClient}
            onClientChange={(value) => setFilterClient(value)}
            sales={sales}
            selectedSale={filterSale}
            onSaleChange={(value) => setFilterSale(value)}
            workOrders={workOrders.map((wo: any) => ({ id: wo.id, code: wo.code }))}
            selectedWorkOrder={filterWorkOrder}
            onWorkOrderChange={(value) => setFilterWorkOrder(value)}
          />

          {/* Production Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProductionCard
                key={p.id}
                production={p}
                onStart={handleStart}
                onPause={openPauseDialog}
                onComplete={openCompleteDialog}
                onResume={openResumeDialog}
                onCancel={openCancelDialog}
                onRegisterParts={openRegisterPartsDialog}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                isLoadingAction={(action: string) => loadingActions[`${p.id}-${action}`] || false}
              />
            ))}
            {filtered.length === 0 && <EmptyProductionList />}
          </div>
        </div>

        {/* Dialogs */}
        <CreateProductionDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          form={form}
          onFormChange={setForm}
          processes={processes}
          machines={machines}
          operators={operators}
          workOrders={workOrders}
          products={products}
          onSubmit={handleCreate}
          saving={saving}
        />

        <ActionDialogs
          showPauseDialog={showPauseDialog}
          showResumeDialog={showResumeDialog}
          showCompleteDialog={showCompleteDialog}
          showCancelDialog={showCancelDialog}
          onPauseDialogChange={setShowPauseDialog}
          onResumeDialogChange={setShowResumeDialog}
          onCompleteDialogChange={setShowCompleteDialog}
          onCancelDialogChange={setShowCancelDialog}
          selectedProduction={selectedProduction}
          pauseReason={pauseReason}
          onPauseReasonChange={setPauseReason}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          onCancel={handleCancel}
          saving={saving}
        />

        <RegisterPartsDialog
          open={showRegisterPartsDialog}
          onOpenChange={setShowRegisterPartsDialog}
          production={selectedProduction}
          onSave={handleRegisterParts}
          saving={saving}
        />

        <EditProductionDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          form={form}
          onFormChange={setForm}
          machines={machines}
          operators={operators}
          requiresMachine={selectedProduction?.process?.requiresMachine ?? false}
          onSave={handleEdit}
          saving={saving}
        />

        <DeleteProductionDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          productionCode={selectedProduction?.code || null}
          onConfirm={handleDelete}
          saving={saving}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
