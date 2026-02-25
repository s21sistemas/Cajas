"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

interface ClientStatsCardsProps {
  total: number;
  active: number;
  totalCredit: number;
  totalBalance: number;
  formatCurrency: (value: number | null) => string;
}

export function ClientStatsCards({ total, active, totalCredit, totalBalance, formatCurrency }: ClientStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{total}</p>
              <p className="text-xs text-muted-foreground">Total Clientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{active}</p>
              <p className="text-xs text-muted-foreground">Clientes Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalCredit)}</p>
              <p className="text-xs text-muted-foreground">Crédito Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Building2 className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-foreground truncate">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground">Saldo Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}