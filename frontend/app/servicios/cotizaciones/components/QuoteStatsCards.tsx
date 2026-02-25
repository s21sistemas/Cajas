"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Send, CheckCircle, DollarSign } from "lucide-react";

interface QuoteStatsCardsProps {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  rejected: number;
  totalValue: number;
  formatCurrency: (value: number) => string;
}

export function QuoteStatsCards({
  total,
  draft,
  sent,
  approved,
  rejected,
  totalValue,
  formatCurrency,
}: QuoteStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Cotizaciones
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{total}</div>
          <p className="text-xs text-muted-foreground">
            {draft} borrador{draft !== 1 ? "es" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Enviadas
          </CardTitle>
          <Send className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{sent}</div>
          <p className="text-xs text-muted-foreground">
            Pendientes de respuesta
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Aprobadas
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{approved}</div>
          <p className="text-xs text-muted-foreground">
            {rejected} rechazada{rejected !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor Aprobado
          </CardTitle>
          <DollarSign className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total en cotizaciones aprobadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
