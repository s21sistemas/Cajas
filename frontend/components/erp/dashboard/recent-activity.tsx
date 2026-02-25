"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Factory, Wrench, Package, AlertTriangle, CheckCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "production" | "maintenance" | "inventory" | "alert" | "completed";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "production",
    title: "Producción iniciada",
    description: "OT-2024-148 - Caja Corrugada 40x30x20",
    time: "Hace 15 min",
  },
  {
    id: "2",
    type: "alert",
    title: "Stock bajo detectado",
    description: "Papel Kraft 200g - 8 rollos",
    time: "Hace 32 min",
  },
  {
    id: "3",
    type: "completed",
    title: "Orden completada",
    description: "OT-2024-145 - 120 piezas buenas",
    time: "Hace 1 hora",
  },
  {
    id: "4",
    type: "maintenance",
    title: "Mantenimiento iniciado",
    description: "MAQ-004 - Reparacion sistema encolado",
    time: "Hace 2 horas",
  },
  {
    id: "5",
    type: "inventory",
    title: "Entrada de material",
    description: "Barra Acero 4140 - 50 unidades",
    time: "Hace 3 horas",
  },
  {
    id: "6",
    type: "production",
    title: "Cambio de turno",
    description: "Turno mañana → Turno tarde",
    time: "Hace 4 horas",
  },
];

const typeConfig = {
  production: { icon: Factory, color: "text-primary", bgColor: "bg-primary/10" },
  maintenance: { icon: Wrench, color: "text-warning", bgColor: "bg-warning/10" },
  inventory: { icon: Package, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  alert: { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
  completed: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
};

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Actividad Reciente
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            Hoy
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
