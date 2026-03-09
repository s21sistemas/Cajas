"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { workOrdersService } from "@/lib/services";
import type { WorkOrder } from "@/lib/types";

interface PipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder | null;
}

// Los posibles valores reales del status por si hay un typo/case issue
const STATUS_MAP: Record<string, { color: string; label: string }> = {
  "PENDING": { color: "bg-gray-500", label: "Pendiente" },
  "READY": { color: "bg-blue-500", label: "Listo" },
  "RUNNING": { color: "bg-green-500", label: "En Ejecución" },
  "PAUSED": { color: "bg-yellow-500", label: "Pausado" },
  "COMPLETED": { color: "bg-emerald-500", label: "Completado" },
};

export function PipelineDialog({ open, onOpenChange, workOrder }: PipelineDialogProps) {
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && workOrder) {
      loadPipeline();
    }
  }, [open, workOrder]);

  const loadPipeline = async () => {
    if (!workOrder) return;

    setLoading(true);
    try {
      const data = await workOrdersService.getPipelineStatus(workOrder.id);
      setPipelineStatus(data.data);
    } catch (err) {
      console.error("Error loading pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  // Si el status viene null/undefined o valor extraño, este helper ayuda a debuggear y mejora la robustez
  const getMesStatusColor = (status: string | null | undefined) => {
    const safeStatus = (typeof status === "string" ? status : "").trim().toUpperCase();
    return STATUS_MAP[safeStatus]?.color || "bg-gray-500";
  };

  const getMesStatusLabel = (status: string | null | undefined) => {
    const safeStatus = (typeof status === "string" ? status : "").trim().toUpperCase();
    return STATUS_MAP[safeStatus]?.label || (typeof status === "string" && status.length > 0 ? status : "Desconocido");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Pipeline de Producción - {workOrder?.code}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : pipelineStatus ? (
          
          <div className="space-y-4">
            {/* Resumen de estados */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">Pendientes: {pipelineStatus.pipelineStatus?.pending || 0}</Badge>
              <Badge variant="outline" className="bg-blue-100">Listos: {pipelineStatus.pipelineStatus?.ready || 0}</Badge>
              <Badge variant="outline" className="bg-green-100">En Ejecución: {pipelineStatus.pipelineStatus?.running || 0}</Badge>
              <Badge variant="outline" className="bg-yellow-100">Pausados: {pipelineStatus.pipelineStatus?.paused || 0}</Badge>
              <Badge variant="outline" className="bg-emerald-100">Completados: {pipelineStatus.pipelineStatus?.completed || 0}</Badge>
            </div>

            {/* Barra de progreso general */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso General</span>
                <span>
                  {pipelineStatus.pipelineStatus?.completed || 0} / {pipelineStatus.pipelineStatus?.totalProcesses || 0} procesos
                </span>
              </div>
              <Progress 
                value={pipelineStatus.pipelineStatus?.totalProcesses > 0 
                  ? ((pipelineStatus.pipelineStatus?.completed || 0) / pipelineStatus.pipelineStatus?.totalProcesses) * 100 
                  : 0} 
                className="h-3"
              />
            </div>

            {/* Lista de procesos */}
            {pipelineStatus.processes && pipelineStatus.processes.length > 0 ? (
              <div className="space-y-2">
                {pipelineStatus.processes.map((process: any, index: number) => (
                  <div
                    key={process.id || index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getMesStatusColor(process.mesStatus)}`} />
                      <div>
                        <p className="font-medium">{process.processName}</p>
                        <p className="text-xs text-muted-foreground">
                          {process.processType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getMesStatusColor(process.mesStatus)}>
                        {getMesStatusLabel(process.mesStatus)}
                      </Badge>
                      {process.plannedQuantity > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${Math.min((process.quantityProduced / process.plannedQuantity) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {process.quantityProduced} / {process.plannedQuantity}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            ({Math.max(process.plannedQuantity - process.quantityProduced, 0)} restante{process.plannedQuantity - process.quantityProduced !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay procesos configurados para esta orden
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se pudo cargar el pipeline
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
