"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, Palmtree, DollarSign, Building2 } from "lucide-react";

interface EmployeeStatsCardsProps {
  total: number;
  active: number;
  vacation: number;
  totalSalary: number;
}

export function EmployeeStatsCards({ total, active, vacation, totalSalary }: EmployeeStatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{total}</p>
              <p className="text-xs text-muted-foreground">Total Empleados</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-green-500 truncate">{active}</p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Palmtree className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-yellow-500 truncate">{vacation}</p>
              <p className="text-xs text-muted-foreground">Vacaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Building2 className="h-5 w-5 text-chart-2" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">8</p>
              <p className="text-xs text-muted-foreground">Departamentos</p>
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
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalSalary)}</p>
              <p className="text-xs text-muted-foreground">Nómina Mensual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
