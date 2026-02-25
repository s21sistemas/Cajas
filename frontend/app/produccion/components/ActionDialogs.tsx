'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProductionOrder, ProductionStatus } from '../types';

// Tipos de diálogos de acción
export type ActionDialogType = 'pause' | 'resume' | 'complete' | 'cancel';

interface ActionDialogsProps {
  // Estado de cada diálogo
  showPauseDialog: boolean;
  showResumeDialog: boolean;
  showCompleteDialog: boolean;
  showCancelDialog: boolean;
  // Funciones para cambiar estado
  onPauseDialogChange: (open: boolean) => void;
  onResumeDialogChange: (open: boolean) => void;
  onCompleteDialogChange: (open: boolean) => void;
  onCancelDialogChange: (open: boolean) => void;
  // Producción seleccionada
  selectedProduction: ProductionOrder | null;
  // Razón de pausa
  pauseReason: string;
  onPauseReasonChange: (reason: string) => void;
  // Handlers
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onCancel: () => void;
  // Estado de guardado
  saving: boolean;
}

const PAUSE_REASONS = [
  'Falta de material',
  'Cambio de suaje/troquel',
  'Ajuste de maquina',
  'Pausa programada',
  'Inspeccion de calidad',
  'Cambio de tinta',
  'Limpieza de equipo',
  'Problema tecnico',
  'Otro',
];

export function ActionDialogs({
  showPauseDialog,
  showResumeDialog,
  showCompleteDialog,
  showCancelDialog,
  onPauseDialogChange,
  onResumeDialogChange,
  onCompleteDialogChange,
  onCancelDialogChange,
  selectedProduction,
  pauseReason,
  onPauseReasonChange,
  onPause,
  onResume,
  onComplete,
  onCancel,
  saving,
}: ActionDialogsProps) {
  return (
    <>
      {/* Pause Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={onPauseDialogChange}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Pausar Producción</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona el motivo de la pausa para {selectedProduction?.code}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Select value={pauseReason} onValueChange={onPauseReasonChange}>
            <AlertDialogTrigger asChild>
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
            </AlertDialogTrigger>
            <SelectContent>
              {PAUSE_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onPauseDialogChange(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onPause} disabled={!pauseReason || saving}>
              Pausar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Dialog */}
      <AlertDialog open={showResumeDialog} onOpenChange={onResumeDialogChange}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Reanudar Producción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas reanudar la producción de {selectedProduction?.code}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onResumeDialogChange(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onResume} disabled={saving}>
              Reanudar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={onCompleteDialogChange}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Completar Producción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Deseas marcar como completada la producción de {selectedProduction?.code}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onCompleteDialogChange(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onComplete} disabled={saving}>
              Completar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={onCancelDialogChange}>
        <AlertDialogContent className="bg-card border-border text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Producción</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar la producción de {selectedProduction?.code}? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onCancelDialogChange(false)}>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancel}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
