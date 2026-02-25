import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, Route, CheckCircle } from "lucide-react";

interface DeliveryStatsCardsProps {
  total: number;
  pending: number;
  inTransit: number;
  completed: number;
}

export function DeliveryStatsCards({
  total,
  pending,
  inTransit,
  completed,
}: DeliveryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Entregas</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">{total}</p>
            </div>
            <Truck className="h-8 w-8 text-primary/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">En Tránsito</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{inTransit}</p>
            </div>
            <Route className="h-8 w-8 text-purple-400/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Completadas</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
