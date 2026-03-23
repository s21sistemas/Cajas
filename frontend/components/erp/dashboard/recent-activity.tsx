"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Factory, Wrench, Package, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { machinesService } from "@/lib/services";

interface Activity {
  id: string;
  type: "production" | "maintenance" | "inventory" | "machine" | "alert" | "completed";
  title: string;
  description: string;
  time: string;
  timestamp: string;
}

const typeConfig = {
  production: { icon: Factory, color: "text-primary", bgColor: "bg-primary/10" },
  maintenance: { icon: Wrench, color: "text-warning", bgColor: "bg-warning/10" },
  inventory: { icon: Package, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  machine: { icon: Activity, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  alert: { icon: AlertTriangle, color: "text-destructive", bgColor: "bg-destructive/10" },
  completed: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await machinesService.getActivities();
        const data = (response as any).data || response || [];
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
        // Datos de fallback
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, []);

  if (loading) {
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
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay actividades recientes
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Las actividades aparecerán aquí cuando se registren
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = typeConfig[activity.type] || typeConfig.completed;
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
        )}
      </CardContent>
    </Card>
  );
}
