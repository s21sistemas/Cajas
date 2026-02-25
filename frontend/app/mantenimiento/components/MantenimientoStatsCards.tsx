"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Calendar, Clock, CheckCircle2, DollarSign } from "lucide-react";

interface MantenimientoStatsCardsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalCost: number;
}

const formatCurrency = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0";
  }
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
};

export function MantenimientoStatsCards({ total, pending, inProgress, completed, totalCost }: MantenimientoStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Ordenes
          </CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{total}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendientes
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{pending}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            En Progreso
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{inProgress}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completadas
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{completed}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Costo Total
          </CardTitle>
          <DollarSign className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalCost)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
