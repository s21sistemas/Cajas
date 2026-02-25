"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface DisabilityStatsCardsProps {
  total: number;
  active: number;
  pending: number;
  totalDays: number;
}

export function DisabilityStatsCards({ total, active, pending, totalDays }: DisabilityStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{total}</p>
              <p className="text-xs text-muted-foreground">Total Registros</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-green-500 truncate">{active}</p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-yellow-500 truncate">{pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{totalDays}</p>
              <p className="text-xs text-muted-foreground">Días Totales</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
