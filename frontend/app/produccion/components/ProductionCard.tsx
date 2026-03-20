import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Check, XCircle, Filter, PackagePlus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionStatus } from '../types';
import type { Production } from "@/lib/types/production.types";

interface ProductionCardProps {
  production: Production;
  onStart: (p: Production) => void;
  onPause: (p: Production) => void;
  onComplete: (p: Production) => void;
  onResume: (p: Production) => void;
  onCancel: (p: Production) => void;
  onRegisterParts: (p: Production) => void;
  onEdit: (p: Production) => void;
  onDelete: (p: Production) => void;
  // Función para verificar si una acción específica está cargando para esta producción
  isLoadingAction?: (action: string) => boolean;
}

const STATUS_CONFIG: Record<ProductionStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'En Proceso', color: 'bg-primary/20 text-primary' },
  paused: { label: 'Pausado', color: 'bg-yellow-500/20 text-yellow-500' },
  completed: { label: 'Completado', color: 'bg-green-500/20 text-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/20 text-destructive' },
};

export function ProductionCard({
  production,
  onStart,
  onPause,
  onComplete,
  onResume,
  onCancel,
  onRegisterParts,
  onEdit,
  onDelete,
  isLoadingAction = () => false,
}: ProductionCardProps) {
  const progress = production.targetParts
    ? Math.min(100, Math.round(((production.goodParts || 0) / production.targetParts) * 100))
    : 0;

  const isEditable = production.status === 'pending' || production.status === 'paused';
  const isDeletable = production.status !== 'completed';

  // Funciones helper para verificar estado de carga
  const isStarting = isLoadingAction('start');
  const isPausing = isLoadingAction('pause');
  const isCompleting = isLoadingAction('complete');
  const isResuming = isLoadingAction('resume');
  const isCancelling = isLoadingAction('cancel');
  const isRegisteringParts = isLoadingAction('registerParts');
  const isAnyLoading = isStarting || isPausing || isCompleting || isResuming || isCancelling || isRegisteringParts;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-muted-foreground">{production.code}</p>
              {isEditable && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => onEdit(production)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {isDeletable && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => onDelete(production)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <CardTitle className="text-lg mt-1">{production.process?.name}</CardTitle>
            {(production.workOrder?.code || production.workOrderId) && (
              <p className="text-sm text-muted-foreground">OT: {production.workOrder?.code || production.workOrderId}</p>
            )}
            {(production as any).productName && (
              <p className="text-sm text-muted-foreground">Producto: {production.product?.name}</p>
            )}
            {(production as any).clientName && (
              <p className="text-sm text-muted-foreground">Cliente: {production.client?.name}</p>
            )}
            {(production as any).sale && (
              <p className="text-sm text-muted-foreground">Venta: {(production as any).sale?.code}</p>
            )}
          </div>
          <Badge className={cn('text-xs', STATUS_CONFIG[production.status || 'pending']?.color || 'bg-muted text-muted-foreground')}>
            {STATUS_CONFIG[production.status || 'pending']?.label || production.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/50 rounded p-2">
            <p className="text-xs text-muted-foreground">Meta</p>
            <p className="font-bold">{production.targetParts}</p>
          </div>
          <div className="bg-green-500/10 rounded p-2">
            <p className="text-xs text-muted-foreground">Buenas</p>
            <p className="font-bold text-green-600">{production.goodParts}</p>
          </div>
          <div className="bg-destructive/10 rounded p-2">
            <p className="text-xs text-muted-foreground">Scrap</p>
            <p className="font-bold text-destructive">{production.scrapParts}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>{production.process?.requiresMachine ? production.machine?.name || 'Sin asignar' : 'Manual'}</span>
          <span className="mx-1">•</span>
          <span>{production.operator?.name || 'Sin operador'}</span>
        </div>
        
        {/* Estado de Calidad */}
        {production.qualityStatus && production.qualityStatus !== 'PENDING' && (
          <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
            production.qualityStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
            production.qualityStatus === 'SCRAP' ? 'bg-red-100 text-red-700' :
            production.qualityStatus === 'REWORK' ? 'bg-yellow-100 text-yellow-700' : ''
          }`}>
            {production.qualityStatus === 'APPROVED' && '✓ Aprobado por Calidad'}
            {production.qualityStatus === 'SCRAP' && '✗ Scrap'}
            {production.qualityStatus === 'REWORK' && '↻ Rework'}
          </div>
        )}
        
        {/* Indicador de proceso padre */}
        {production.parentProductionId && production.parentProcess?.qualityStatus !== 'APPROVED' && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <span className="i-lucide-link" />
            Proceso encadenado (debe esperar aprobación del anterior)
          </div>
        )}
        
        {/* Acciones principales */}
        <div className="flex flex-col gap-2 pt-2">
          {production.status === 'pending' && (
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onStart(production)} disabled={isAnyLoading}>
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {production.status === 'in_progress' && (
            <div className="grid grid-cols-3 gap-2">
              <Button size="icon" variant="outline" onClick={() => onPause(production)} disabled={isAnyLoading} title="Pausar">
                {isPausing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" className="bg-green-600 hover:bg-green-700" onClick={() => onComplete(production)} disabled={isAnyLoading} title="Completar">
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="secondary" onClick={() => onRegisterParts(production)} disabled={isAnyLoading} title="Registrar Piezas">
                {isRegisteringParts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PackagePlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
          
          {production.status === 'paused' && (
            <>
              <div className="grid grid-cols-2 gap-2 justify-items-center">
                <Button size="icon" onClick={() => onResume(production)} disabled={isAnyLoading} title="Reanudar">
                  {isResuming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onCancel(production)} disabled={isAnyLoading} title="Cancelar">
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => onRegisterParts(production)} disabled={isAnyLoading}>
                {isRegisteringParts ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PackagePlus className="h-4 w-4 mr-2" />
                )}
                {isRegisteringParts ? 'Registrando...' : 'Registrar Piezas'}
              </Button>
            </>
          )}
          
          {production.status === 'completed' && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Producción finalizada
            </div>
          )}
          
          {production.status === 'cancelled' && (
            <div className="text-center text-sm text-muted-foreground py-2">
              Producción cancelada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
