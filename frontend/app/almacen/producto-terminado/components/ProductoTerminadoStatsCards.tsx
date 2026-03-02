"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

interface ProductoTerminadoStatsCardsProps {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  byWarehouse: Record<string, number>;
}

export function ProductoTerminadoStatsCards({ 
  totalItems, 
  totalValue, 
  lowStockItems,
  byWarehouse 
}: ProductoTerminadoStatsCardsProps) {
  const safeTotal = typeof totalItems === 'number' && !isNaN(totalItems) ? totalItems : 0;
  const safeValue = typeof totalValue === 'number' && !isNaN(totalValue) ? totalValue : 0;
  const safeLowStock = typeof lowStockItems === 'number' && !isNaN(lowStockItems) ? lowStockItems : 0;

  // Get main warehouse count
  const mainWarehouse = Object.entries(byWarehouse || {}).length > 0 
    ? Object.entries(byWarehouse).sort((a, b) => b[1] - a[1])[0]
    : null;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeTotal}</p>
              <p className="text-xs text-muted-foreground">Total Productos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{formatCurrency(safeValue)}</p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeLowStock}</p>
              <p className="text-xs text-muted-foreground">Stock Bajo</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">
                {mainWarehouse ? mainWarehouse[1] : 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {mainWarehouse ? mainWarehouse[0] : 'Sin almacén'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
