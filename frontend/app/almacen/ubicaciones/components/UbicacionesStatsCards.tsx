"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Package, Layers, TrendingUp } from "lucide-react";

interface UbicacionesStatsCardsProps {
  total: number;
  totalCapacity: number;
  totalOccupancy: number;
  averageOccupancy: number;
}

export function UbicacionesStatsCards({ 
  total, 
  totalCapacity, 
  totalOccupancy, 
  averageOccupancy 
}: UbicacionesStatsCardsProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-MX").format(value || 0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{total}</p>
              <p className="text-xs text-muted-foreground">Total Ubicaciones</p>
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
              <p className="text-xl font-bold text-foreground truncate">{formatNumber(totalCapacity)}</p>
              <p className="text-xs text-muted-foreground">Capacidad Total</p>
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
              <p className="text-xl font-bold text-foreground truncate">{formatNumber(totalOccupancy)}</p>
              <p className="text-xs text-muted-foreground">Ocupación Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${averageOccupancy >= 80 ? 'bg-red-500/10' : averageOccupancy >= 50 ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
              <TrendingUp className={`h-5 w-5 ${averageOccupancy >= 80 ? 'text-red-500' : averageOccupancy >= 50 ? 'text-yellow-500' : 'text-green-500'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xl font-bold truncate ${averageOccupancy >= 80 ? 'text-red-500' : averageOccupancy >= 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                {averageOccupancy.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Ocupación Promedio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
