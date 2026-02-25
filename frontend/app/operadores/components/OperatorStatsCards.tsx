"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, UserCheck, UserX } from "lucide-react";

interface OperatorStatsCardsProps {
  total: number;
  active: number;
}

export function OperatorStatsCards({ total, active }: OperatorStatsCardsProps) {
  const inactive = total - active;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{total}</p>
              <p className="text-xs text-muted-foreground">Total Operadores</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{active}</p>
              <p className="text-xs text-muted-foreground">Operadores Activos</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-500/10">
              <UserX className="h-5 w-5 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-foreground truncate">{inactive}</p>
              <p className="text-xs text-muted-foreground">Operadores Inactivos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
