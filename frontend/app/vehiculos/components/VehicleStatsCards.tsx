import { Card, CardContent } from "@/components/ui/card";
import { Car, Truck } from "lucide-react";

interface VehicleStatsCardsProps {
  total: number;
  available: number;
  assigned: number;
}

export function VehicleStatsCards({ total, available, assigned }: VehicleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Total Vehículos</p>
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
              <p className="text-xs text-muted-foreground font-medium uppercase">Disponibles</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{available}</p>
            </div>
            <Car className="h-8 w-8 text-green-400/30" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Asignados</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{assigned}</p>
            </div>
            <Car className="h-8 w-8 text-blue-400/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
