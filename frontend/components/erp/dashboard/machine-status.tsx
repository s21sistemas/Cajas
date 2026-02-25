"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Machine, MachineUtilization } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface MachineStatusProps {
  machines: Machine[];
  utilization: MachineUtilization[];
}

const statusConfig = {
  running: { label: "Activa", color: "bg-success text-success-foreground" },
  available: { label: "Disponible", color: "bg-primary text-primary-foreground" },
  maintenance: { label: "Mantenimiento", color: "bg-warning text-warning-foreground" },
  offline: { label: "Apagada", color: "bg-muted text-muted-foreground" },
};

export function MachineStatus({ machines, utilization }: MachineStatusProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Estado de Máquinas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {machines.slice(0, 5).map((machine) => {
            const util = utilization.find((u) => u.machineId === machine.id);
            const status = statusConfig[machine.status as keyof typeof statusConfig] || statusConfig.offline;
            
            return (
              <div key={machine.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-card-foreground truncate">
                      {machine.code}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] px-1.5 py-0", status.color)}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {machine.name}
                  </p>
                </div>
                <div className="w-24 text-right">
                  <div className="text-sm font-semibold text-card-foreground">
                    {util?.utilization ?? 0}%
                  </div>
                  <Progress 
                    value={util?.utilization ?? 0} 
                    className="h-1.5 mt-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
