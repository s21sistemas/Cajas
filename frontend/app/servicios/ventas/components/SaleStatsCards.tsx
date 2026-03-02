"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, TrendingUp } from "lucide-react";

interface SaleStatsCardsProps {
  total: number;
  totalAmount: number;
  formatCurrency: (value: number | null | undefined) => string;
}

export function SaleStatsCards({
  total,
  totalAmount,
  formatCurrency,
}: SaleStatsCardsProps) {
  const average = total > 0 ? totalAmount / total : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Ventas</p>
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
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-muted-foreground">Total Vendido</p>
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
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(average)}</p>
              <p className="text-xs text-muted-foreground">Promedio por Venta</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
