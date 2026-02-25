"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Layers, TrendingUp } from "lucide-react";

interface ProductStatsCardsProps {
  total: number;
  active: number;
  lowStock: number;
}

export function ProductStatsCards({ total, active, lowStock }: ProductStatsCardsProps) {
  // Ensure we have valid numbers, default to 0 if undefined/null
  const safeTotal = typeof total === 'number' && !isNaN(total) ? total : 0;
  const safeActive = typeof active === 'number' && !isNaN(active) ? active : 0;
  const safeLowStock = typeof lowStock === 'number' && !isNaN(lowStock) ? lowStock : 0;
  const inactive = safeTotal - safeActive;
  
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
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeActive}</p>
              <p className="text-xs text-muted-foreground">Productos Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Layers className="h-5 w-5 text-amber-500" />
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
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{inactive}</p>
              <p className="text-xs text-muted-foreground">Inactivos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
