"use client";

import { useEffect, useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/erp/action-toast";
import { productionService } from "@/lib/services/production.service";
import type { ProductionOrder } from "@/lib/types/production.types";
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
import type { CreateProductionForm, Process, Operator, Machine, WorkOrder } from "./types";
import { DEFAULT_FORM } from "./types";

// Valores por defecto para datos mock (usados solo si falla el backend)
const DEFAULT_PROCESSES: Process[] = [
  { id: "1", name: "Corrugado", requiresMachine: true },
  { id: "2", name: "Impresion Flexografica", requiresMachine: true },
  { id: "3", name: "Troquelado", requiresMachine: true },
  { id: "4", name: "Pegado Manual", requiresMachine: false },
  { id: "5", name: "Pegado Automatico", requiresMachine: true },
  { id: "6", name: "Ensamble Manual", requiresMachine: false },
  { id: "7", name: "Ranurado (Slotter)", requiresMachine: true },
  { id: "8", name: "Inspeccion de Calidad", requiresMachine: false },
  { id: "9", name: "Empaque y Flejado", requiresMachine: false },
];

const DEFAULT_OPERATORS: Operator[] = [
  { id: "1", name: "Carlos Mendoza" },
  { id: "2", name: "Ana Rodriguez" },
  { id: "3", name: "Miguel Torres" },
  { id: "4", name: "Roberto Sanchez" },
  { id: "5", name: "Luisa Garcia" },
];

const DEFAULT_MACHINES: Machine[] = [
  { id: "1", name: "Corrugadora BHS" },
  { id: "2", name: "Flexo Ward 4 Tintas" },
  { id: "3", name: "Troqueladora Bobst" },
  { id: "4", name: "Pegadora Automatica" },
  { id: "5", name: "Ranuradora" },
];

export default function ProduccionPage() {
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<ProductionOrder[]>([]);
  const [processes, setProcesses] = useState<Process[]>(DEFAULT_PROCESSES);
  const [machines, setMachines] = useState<Machine[]>(DEFAULT_MACHINES);
  const [operators, setOperators] = useState<Operator[]>(DEFAULT_OPERATORS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Dialogs state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRegisterPartsDialog, setShowRegisterPartsDialog] = useState(false);
  
  const [selectedProduction, setSelectedProduction] = useState<ProductionOrder | null>(null);
  const [pauseReason, setPauseReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  const [form, setForm] = useState<CreateProductionForm>(DEFAULT_FORM);
  const { showToast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        const [productionsData, processesData, machinesData, operatorsData, workOrdersData] = await Promise.all([
          productionService.getAll().catch(() => []),
          productionService.getProcesses().catch(() => DEFAULT_PROCESSES as any),
          productionService.getMachines().catch(() => DEFAULT_MACHINES as any),
          productionService.getOperators().catch(() => DEFAULT_OPERATORS as any),
          productionService.getWorkOrders().catch(() => []),
        ]);
        
        setProductions(productionsData || []);
        setProcesses(processesData || DEFAULT_PROCESSES);
        setMachines(machinesData || DEFAULT_MACHINES);
        setOperators(operatorsData || DEFAULT_OPERATORS);
        setWorkOrders(workOrdersData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtrar producciones
  const filtered = productions.filter((p) => {
    const matchSearch =
      p.processName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Handlers de acciones
  async function handleCreate() {
    if (!form.processId) {
      showToast("error", "Error", "Selecciona un proceso");
      return;
    }
    setSaving(true);
    try {
      const newProduction = await productionService.create({
        processId: parseInt(form.processId),
        operatorId: form.operatorId ? parseInt(form.operatorId) : null,
        machineId: form.machineId ? parseInt(form.machineId) : null,
        targetParts: form.targetParts,
        notes: form.notes || undefined,
        startTime: new Date().toISOString(),
        workOrderId: form.workOrderId ? parseInt(form.workOrderId) : null,
      });
      
      setProductions([newProduction, ...productions]);
      setShowCreateDialog(false);
      setForm(DEFAULT_FORM);
      showToast("success", "Éxito", "Orden de producción creada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo crear la orden");
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(p: ProductionOrder) {
    setLoadingAction('start');
    try {
      const updated = await productionService.start(parseInt(p.id));
      setProductions(productions.map((prod) => (prod.id === p.id ? updated : prod)));
      showToast("success", "Éxito", "Producción iniciada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo iniciar la producción");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePause() {
    if (!selectedProduction) return;
    setLoadingAction('pause');
    try {
      const updated = await productionService.pause(parseInt(selectedProduction.id), pauseReason);
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowPauseDialog(false);
      setPauseReason("");
      showToast("success", "Éxito", "Producción pausada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo pausar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleResume() {
    if (!selectedProduction) return;
    setLoadingAction('resume');
    try {
      const updated = await productionService.resume(parseInt(selectedProduction.id));
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowResumeDialog(false);
      showToast("success", "Éxito", "Producción reanudada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo reanudar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleComplete() {
    if (!selectedProduction) return;
    setLoadingAction('complete');
    try {
      const updated = await productionService.complete(
        parseInt(selectedProduction.id),
        selectedProduction.goodParts || 0,
        selectedProduction.scrapParts || 0
      );
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowCompleteDialog(false);
      showToast("success", "Éxito", "Producción completada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo completar");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleCancel() {
    if (!selectedProduction) return;
    setLoadingAction('cancel');
    try {
      const updated = await productionService.cancel(parseInt(selectedProduction.id), "Cancelado por usuario");
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowCancelDialog(false);
      showToast("success", "Éxito", "Producción cancelada");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo cancelar");
    } finally {
      setLoadingAction(null);
    }
  }

  // Función para abrir diálogo de registrar piezas
  function openRegisterPartsDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setShowRegisterPartsDialog(true);
  }

  // Handler para registrar piezas
  async function handleRegisterParts(goodParts: number, scrapParts: number) {
    if (!selectedProduction) return;
    setLoadingAction('registerParts');
    try {
      const updated = await productionService.registerParts(
        parseInt(selectedProduction.id),
        goodParts,
        scrapParts
      );
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowRegisterPartsDialog(false);
      showToast("success", "Éxito", "Piezas registradas correctamente");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudieron registrar las piezas");
    } finally {
      setLoadingAction(null);
    }
  }

  // Funciones para abrir diálogos de edición y eliminación
  function openEditDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setForm({
      processId: String(p.id),
      machineId: undefined,
      operatorId: undefined,
      targetParts: p.targetParts,
      notes: '',
      workOrderId: undefined,
    });
    setShowEditDialog(true);
  }

  function openDeleteDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setShowDeleteDialog(true);
  }

  // Handler para editar
  async function handleEdit() {
    if (!selectedProduction) return;
    setSaving(true);
    try {
      const updated = await productionService.update(parseInt(selectedProduction.id), {
        targetParts: form.targetParts,
        notes: form.notes || undefined,
      });
      setProductions(productions.map((p) => (p.id === selectedProduction.id ? updated : p)));
      setShowEditDialog(false);
      setForm(DEFAULT_FORM);
      showToast("success", "Éxito", "Orden actualizada correctamente");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo actualizar la orden");
    } finally {
      setSaving(false);
    }
  }

  // Handler para eliminar
  async function handleDelete() {
    if (!selectedProduction) return;
    setSaving(true);
    try {
      await productionService.delete(parseInt(selectedProduction.id));
      setProductions(productions.filter((p) => p.id !== selectedProduction.id));
      setShowDeleteDialog(false);
      showToast("success", "Éxito", "Orden eliminada correctamente");
    } catch (error) {
      console.error("Error:", error);
      showToast("error", "Error", "No se pudo eliminar la orden");
    } finally {
      setSaving(false);
    }
  }

  // Funciones para abrir diálogos de acción
  function openPauseDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setShowPauseDialog(true);
  }

  function openResumeDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setShowResumeDialog(true);
  }

  function openCompleteDialog(p: ProductionOrder) {
    setSelectedProduction(p);
    setShowCompleteDialog(true);
  }

  function openCancelDialog(p: ProductionOrder) {
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
            onCreateClick={() => setShowCreateDialog(true)}
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
                loadingAction={loadingAction}
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
