"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Sale } from "@/lib/types/service-order.types";

interface SaleViewDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (value: number | null | undefined) => string;
}

const statusVariants: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paid: "bg-green-500/20 text-green-400 border-green-500/30",
  overdue: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  overdue: "Vencida",
  cancelled: "Cancelada",
};

// Función helper para formatear fecha para visualización
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

export function SaleViewDialog({
  sale,
  open,
  onOpenChange,
  formatCurrency,
}: SaleViewDialogProps) {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalle de Venta</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Factura</p>
              <p className="font-medium text-foreground">{sale.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{sale.clientName || '-'}</p>
            </div>
          </div>
          {(sale.quoteRef || sale.quoteId) && (
            <div className="grid grid-cols-2 gap-4">
              {sale.quoteRef && (
                <div>
                  <p className="text-sm text-muted-foreground">Ref. Cotización</p>
                  <p className="font-medium text-foreground">{sale.quoteRef}</p>
                </div>
              )}
              {sale.quoteId && (
                <div>
                  <p className="text-sm text-muted-foreground">ID Cotización</p>
                  <p className="font-medium text-foreground">{sale.quoteId}</p>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="font-medium text-foreground">{formatCurrency(sale.subtotal) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IVA ({sale.taxRate || 16}%)</p>
              <p className="font-medium text-foreground">{formatCurrency(sale.tax) || '-'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium text-foreground">{formatCurrency(sale.total) || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge className={statusVariants[sale.status]}>
                {statusLabels[sale.status]}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Pago</p>
              <p className="font-medium text-foreground">
                {sale.paymentType === 'credito' ? 'Crédito' : 'Contado'}
              </p>
            </div>
            {sale.paymentType === 'credito' ? (
              <div>
                <p className="text-sm text-muted-foreground">Días de Crédito</p>
                <p className="font-medium text-foreground">{sale.creditDays}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">Método de Pago</p>
                <p className="font-medium text-foreground">{sale.paymentMethod || '-'}</p>
              </div>
            )}
          </div>
          {sale.paymentType === 'credito' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-medium text-foreground">{formatDate(sale.dueDate)}</p>
              </div>
            </div>
          )}

          {/* Sale Items */}
          {(sale as any).items && (sale as any).items.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Productos</p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium">Producto</th>
                      <th className="px-2 py-1 text-right font-medium">Cant.</th>
                      <th className="px-2 py-1 text-right font-medium">P.Unit</th>
                      <th className="px-2 py-1 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sale as any).items.map((item: any, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-2 py-1">
                          {item.description || item.product?.name || '-'}
                          {item.part_number && <span className="text-muted-foreground text-xs"> ({item.part_number})</span>}
                        </td>
                        <td className="px-2 py-1 text-right">{item.quantity}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-2 py-1 text-right">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
