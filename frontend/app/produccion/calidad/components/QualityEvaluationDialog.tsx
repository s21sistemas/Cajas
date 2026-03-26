'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import type { Production } from '@/lib/types/production.types';
import { qualityService, QUALITY_DECISIONS, QualityEvaluationRequest } from '@/lib/services/quality.service';

interface QualityEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  production: Production | null;
  onEvaluated: () => void;
}

export function QualityEvaluationDialog({
  open,
  onOpenChange,
  production,
  onEvaluated,
}: QualityEvaluationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'SCRAP' | 'REWORK' | null>(null);
  const [quantityApproved, setQuantityApproved] = useState(0);
  const [quantityScrap, setQuantityScrap] = useState(0);
  const [quantityRework, setQuantityRework] = useState(0);
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when opening
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && production) {
      setDecision(null);
      setQuantityApproved(production.goodParts || 0);
      setQuantityScrap(0);
      setQuantityRework(0);
      setObservations('');
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleDecisionChange = (value: string) => {
    const newDecision = value as 'APPROVED' | 'SCRAP' | 'REWORK';
    setDecision(newDecision);
    
    // Reset quantities based on decision
    const total = production?.goodParts || 0;
    if (newDecision === 'APPROVED') {
      setQuantityApproved(total);
      setQuantityScrap(0);
      setQuantityRework(0);
    } else if (newDecision === 'SCRAP') {
      setQuantityApproved(0);
      setQuantityScrap(total);
      setQuantityRework(0);
    } else if (newDecision === 'REWORK') {
      setQuantityApproved(0);
      setQuantityScrap(0);
      setQuantityRework(total);
    }
  };

  const handleSubmit = async () => {
    if (!decision || !production) return;

    const totalDistributed = quantityApproved + quantityScrap + quantityRework;
    const totalAvailable = production.goodParts || 0;

    if (totalDistributed !== totalAvailable) {
      setError(`Las cantidades deben sumar ${totalAvailable}. Actualmente suma ${totalDistributed}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const evaluationData: QualityEvaluationRequest = {
        production_id: Number(production.id),
        work_order_process_id: Number((production as any).workOrderProcessId || 0),
        quantity_evaluated: totalAvailable,
        decision,
        quantity_approved: quantityApproved,
        quantity_scrap: quantityScrap,
        quantity_rework: quantityRework,
        observations: observations || undefined,
      };

      await qualityService.evaluate(evaluationData);
      onEvaluated();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Error al registrar la evaluación');
    } finally {
      setLoading(false);
    }
  };

  const totalAvailable = production?.goodParts || 0;
  const totalDistributed = quantityApproved + quantityScrap + quantityRework;
  const isValid = decision && totalDistributed === totalAvailable;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle>Evaluación de Calidad - {production?.code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información de producción */}
          <Card className="bg-secondary/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Piezas Buenas:</span>
                  <p className="font-medium">{production?.goodParts || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Piezas Scrap:</span>
                  <p className="font-medium">{production?.scrapParts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decisión de calidad */}
          <div>
            <Label className="mb-2 block">Decisión de Calidad</Label>
            <RadioGroup
              value={decision || ''}
              onValueChange={handleDecisionChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="APPROVED" id="approved" />
                <Label htmlFor="approved" className="flex items-center gap-1 cursor-pointer">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Aprobado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SCRAP" id="scrap" />
                <Label htmlFor="scrap" className="flex items-center gap-1 cursor-pointer">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Scrap
                </Label>
              </div>
              {/* <div className="flex items-center space-x-2">
                <RadioGroupItem value="REWORK" id="rework" />
                <Label htmlFor="rework" className="flex items-center gap-1 cursor-pointer">
                  <RefreshCcw className="h-4 w-4 text-yellow-500" />
                  Reproceso
                </Label>
              </div> */}
            </RadioGroup>
          </div>

          {/* Cantidades por decisión */}
          {decision && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="qtyApproved">Cant. Aprobada</Label>
                <Input
                  id="qtyApproved"
                  type="number"
                  min={0}
                  max={totalAvailable}
                  value={quantityApproved}
                  onChange={(e) => setQuantityApproved(parseInt(e.target.value) || 0)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="qtyScrap">Cant. Scrap</Label>
                <Input
                  id="qtyScrap"
                  type="number"
                  min={0}
                  max={totalAvailable}
                  value={quantityScrap}
                  onChange={(e) => setQuantityScrap(parseInt(e.target.value) || 0)}
                  className="bg-secondary border-border"
                />
              </div>
              {/* <div>
                <Label htmlFor="qtyRework">Cant. Reproceso</Label>
                <Input
                  id="qtyRework"
                  type="number"
                  min={0}
                  max={totalAvailable}
                  value={quantityRework}
                  onChange={(e) => setQuantityRework(parseInt(e.target.value) || 0)}
                  className="bg-secondary border-border"
                />
              </div> */}
            </div>
          )}

          {/* Validación de cantidades */}
          <div className="flex items-center gap-2">
            {totalDistributed === totalAvailable ? (
              <span className="text-green-500 text-sm flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Cantidades correctas
              </span>
            ) : (
              <span className="text-yellow-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                Faltan {totalAvailable - totalDistributed} unidades por asignar
              </span>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas sobre la evaluación de calidad..."
              className="bg-secondary border-border"
              rows={3}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Evaluación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
