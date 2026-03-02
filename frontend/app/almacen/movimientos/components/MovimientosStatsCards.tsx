"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Clock } from "lucide-react";

interface MovimientosStatsCardsProps {
  totalIn: number;
  totalOut: number;
  transfers: number;
  pending: number;
}

export function MovimientosStatsCards({ 
  totalIn, 
  totalOut, 
  transfers,
  pending 
}: MovimientosStatsCardsProps) {
  const safeIn = typeof totalIn === 'number' && !isNaN(totalIn) ? totalIn : 0;
  const safeOut = typeof totalOut === 'number' && !isNaN(totalOut) ? totalOut : 0;
  const safeTransfers = typeof transfers === 'number' && !isNaN(transfers) ? transfers : 0;
  const safePending = typeof pending === 'number' && !isNaN(pending) ? pending : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <ArrowDownToLine className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeIn}</p>
              <p className="text-xs text-muted-foreground">Entradas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <ArrowUpFromLine className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeOut}</p>
              <p className="text-xs text-muted-foreground">Salidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ArrowRightLeft className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safeTransfers}</p>
              <p className="text-xs text-muted-foreground">Transferencias</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{safePending}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
