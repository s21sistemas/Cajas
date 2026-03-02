"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock, Play, CheckCircle } from "lucide-react";
import type { WorkOrder } from "@/lib/types";

interface WorkOrderStatsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderStats({ workOrders }: WorkOrderStatsProps) {
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter((o) => o.status === "pending").length,
    inProgress: workOrders.filter((o) => o.status === "in_progress").length,
    completed: workOrders.filter((o) => o.status === "completed").length,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Órdenes</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-primary/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
              <p className="text-2xl font-bold text-gray-400 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-400/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">En Proceso</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
            </div>
            <Play className="h-8 w-8 text-blue-400/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Completadas</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
