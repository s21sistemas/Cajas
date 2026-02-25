"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Quote, QuoteStatus } from "@/lib/types";

interface QuoteViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  formatCurrency: (value: number) => string;
  formatDate: (dateStr: string) => string;
}

const getStatusBadge = (status: QuoteStatus) => {
  const variants: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    expired: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };
  const labels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviada",
    approved: "Aprobada",
    rejected: "Rechazada",
    expired: "Expirada",
  };
  return <Badge className={variants[status]}>{labels[status]}</Badge>;
};

export function QuoteViewDialog({
  open,
  onOpenChange,
  quote,
  formatCurrency,
  formatDate,
}: QuoteViewDialogProps) {
  if (!quote) return null;

  const items = (quote as any).items || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalle de Cotización</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          {/* Información general */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Código</label>
              <p className="font-mono font-medium">{quote.code}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Estado</label>
              <div>{getStatusBadge(quote.status)}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cliente</label>
              <p className="font-medium">{quote.client?.name || (quote as any).clientName || "N/A"}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Título</label>
              <p className="font-medium">{quote.title}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Válido hasta</label>
              <p className="font-medium">{formatDate((quote as any).validUntil)}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Creado por</label>
              <p className="font-medium">{quote.createdBy}</p>
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div>
            <h4 className="font-semibold mb-3">Productos ({items.length})</h4>
            {items.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left whitespace-nowrap">Unidad</th>
                      <th className="px-3 py-2 text-left whitespace-nowrap">No. Parte</th>
                      <th className="px-3 py-2 text-left">Descripción</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap">Cantidad</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap">Precio Unit.</th>
                      <th className="px-3 py-2 text-right whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.unit || "-"}</td>
                        <td className="px-3 py-2">{item.partNumber || item.part_number || "-"}</td>
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice || item.unit_price)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No hay productos en esta cotización.
              </p>
            )}
          </div>

          <Separator />

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
