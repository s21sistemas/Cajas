'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { productionService } from '@/lib/services/production.service';

// Tipos para estados MES
type ProcessMesStatus = 'PENDING' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

// Labels para estados MES
const MES_STATUS_LABELS: Record<ProcessMesStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-gray-500' },
  READY: { label: 'Listo', color: 'bg-blue-500' },
  RUNNING: { label: 'En Ejecución', color: 'bg-green-500' },
  PAUSED: { label: 'Pausado', color: 'bg-yellow-500' },
  COMPLETED: { label: 'Completado', color: 'bg-emerald-600' },
};

interface PipelineStatus {
  total_processes: number;
  pending: number;
  ready: number;
  running: number;
  paused: number;
  completed: number;
  total_produced: number;
  total_scrap: number;
  yield: number;
  scrap_rate: number;
  efficiency: number;
}

interface PipelineStatusCardProps {
  workOrderId: number;
  refreshTrigger?: number;
}

export function PipelineStatusCard({ workOrderId, refreshTrigger }: PipelineStatusCardProps) {
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus | null>(null);
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipelineStatus = async () => {
      if (!workOrderId) return;
      
      try {
        setLoading(true);
        const data = await productionService.getPipelineStatus(workOrderId);
        setPipelineStatus(data.pipeline_status);
        setProcesses(data.processes || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching pipeline status:', err);
        setError(err?.message || 'Error al cargar estado del pipeline');
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineStatus();
  }, [workOrderId, refreshTrigger]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4 text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!pipelineStatus) {
    return null;
  }

  const getStatusConfig = (status: ProcessMesStatus) => {
    return MES_STATUS_LABELS[status] || { label: status, color: 'bg-gray-500' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estado del Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de estados */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-gray-100">
            Pendientes: {pipelineStatus.pending}
          </Badge>
          <Badge variant="outline" className="bg-blue-100">
            Listos: {pipelineStatus.ready}
          </Badge>
          <Badge variant="outline" className="bg-green-100">
            En Ejecución: {pipelineStatus.running}
          </Badge>
          <Badge variant="outline" className="bg-yellow-100">
            Pausados: {pipelineStatus.paused}
          </Badge>
          <Badge variant="outline" className="bg-emerald-100">
            Completados: {pipelineStatus.completed}
          </Badge>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-secondary rounded">
            <div className="text-muted-foreground">Producidas</div>
            <div className="font-bold text-lg">{pipelineStatus.total_produced}</div>
          </div>
          <div className="text-center p-2 bg-secondary rounded">
            <div className="text-muted-foreground">Scrap</div>
            <div className="font-bold text-lg text-red-500">{pipelineStatus.total_scrap}</div>
          </div>
          <div className="text-center p-2 bg-secondary rounded">
            <div className="text-muted-foreground">Eficiencia</div>
            <div className="font-bold text-lg">{pipelineStatus.efficiency}%</div>
          </div>
        </div>

        {/* Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>
              {pipelineStatus.completed}/{pipelineStatus.total_processes} procesos
            </span>
          </div>
          <Progress 
            value={(pipelineStatus.completed / pipelineStatus.total_processes) * 100} 
            className="h-2"
          />
        </div>

        {/* Lista de procesos */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Procesos</h4>
          {processes.map((process, index) => {
            const statusConfig = getStatusConfig(process.mes_status);
            const progressPercent = process.planned_quantity > 0 
              ? (process.completed_quantity / process.planned_quantity) * 100 
              : 0;
            
            return (
              <div key={process.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{process.process_name || `Proceso ${index + 1}`}</div>
                    <div className="text-xs text-muted-foreground">
                      {process.completed_quantity} / {process.planned_quantity} unidades
                    </div>
                  </div>
                  <Badge className={`${statusConfig.color} text-white`}>
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <Progress value={progressPercent} className="h-1" />
                
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Scrap: {process.scrap_quantity}</span>
                  <span>Disponibles: {process.available_quantity}</span>
                  {process.metrics && (
                    <>
                      <span>Yield: {process.metrics.yield}%</span>
                      <span>Efic.: {process.metrics.efficiency}%</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
