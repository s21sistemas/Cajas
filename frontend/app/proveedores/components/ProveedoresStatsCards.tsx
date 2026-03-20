"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock } from "lucide-react";

interface ProveedoresStatsCardsProps {
  total: number;
  active: number;
  totalBalance: number;
  avgLeadTime: number;
}

const formatCurrency = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(0);
  }
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
};

export function ProveedoresStatsCards({ total, active, totalBalance, avgLeadTime }: ProveedoresStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Proveedores
          </CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{total}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Proveedores Activos
          </CardTitle>
          <Truck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{active}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cuentas por Pagar
          </CardTitle>
          <Truck className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalBalance)}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tiempo de Entrega Promedio
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{avgLeadTime} días</div>
        </CardContent>
      </Card>
    </div>
  );
}
