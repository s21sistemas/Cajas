"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2, MapPin } from "lucide-react";

interface BranchStatsCardsProps {
  total: number;
  active: number;
  inactive: number;
  cities: number;
}

export function BranchStatsCards({ total, active, inactive, cities }: BranchStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Sucursales</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{active}</p>
              <p className="text-xs text-muted-foreground">Activas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/10">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inactive}</p>
              <p className="text-xs text-muted-foreground">Inactivas</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cities}</p>
              <p className="text-xs text-muted-foreground">Ciudades</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
