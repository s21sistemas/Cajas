'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { ProductionOrder } from '../types';

interface RegisterPartsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  production: ProductionOrder | null;
  onSave: (goodParts: number, scrapParts: number) => void;
  saving: boolean;
}

export function RegisterPartsDialog({
  open,
  onOpenChange,
  production,
  onSave,
  saving,
}: RegisterPartsDialogProps) {
  const [goodParts, setGoodParts] = useState(0);
  const [scrapParts, setScrapParts] = useState(0);

  // Inicializar valores cuando se abre el diálogo
  useEffect(() => {
    if (production) {
      setGoodParts(production.goodParts || 0);
      setScrapParts(production.scrapParts || 0);
    }
  }, [production, open]);

  const handleSave = () => {
    onSave(goodParts, scrapParts);
  };

  const total = goodParts + scrapParts;
  const progress = production?.targetParts ? Math.round((goodParts / production.targetParts) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Producción - {production?.code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información actual */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Meta:</span>
              <span className="font-medium">{production?.targetParts || 0} piezas</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso:</span>
              <span className="font-medium">{progress}%</span>
            </div>
          </div>

          {/* Input piezas buenas */}
          <div>
            <Label htmlFor="goodParts">Piezas Buenas</Label>
            <Input
              id="goodParts"
              type="number"
              min="0"
              value={goodParts}
              onChange={(e) => setGoodParts(parseInt(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Piezas que pasaron control de calidad
            </p>
          </div>

          {/* Input piezas scrap */}
          <div>
            <Label htmlFor="scrapParts">Piezas Scrap (Defectuosas)</Label>
            <Input
              id="scrapParts"
              type="number"
              min="0"
              value={scrapParts}
              onChange={(e) => setScrapParts(parseInt(e.target.value) || 0)}
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Piezas rechazadas o defectuosas
            </p>
          </div>

          {/* Resumen */}
          <div className="bg-primary/10 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total registrado:</span>
              <span className="font-medium">{total} piezas</span>
            </div>
            {production && total > production.targetParts && (
              <div className="flex justify-between text-sm text-yellow-500">
                <span className="text-muted-foreground">Exceso:</span>
                <span className="font-medium">{total - production.targetParts} piezas</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
