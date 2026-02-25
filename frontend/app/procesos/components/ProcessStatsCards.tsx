"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Settings, Gauge, Clock } from "lucide-react";
import type { ProcessStats } from "@/lib/types";

interface ProcessStatsCardsProps {
  total: number;
  active: number;
  inactive: number;
  withMachine: number;
}

export function ProcessStatsCards({
  total,
  active,
  inactive,
  withMachine,
}: ProcessStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">{total}</p>
            </div>
            <Settings className="h-8 w-8 text-primary/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Activos</p>
              <p className="text-2xl font-bold text-green-500 mt-1">{active}</p>
            </div>
            <Gauge className="h-8 w-8 text-green-500/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Inactivos</p>
              <p className="text-2xl font-bold text-gray-500 mt-1">{inactive}</p>
            </div>
            <Settings className="h-8 w-8 text-gray-500/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Con Máquina</p>
              <p className="text-2xl font-bold text-blue-500 mt-1">{withMachine}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
