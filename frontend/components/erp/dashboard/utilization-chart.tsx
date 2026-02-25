"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MachineUtilization } from "@/lib/mock-data";

interface UtilizationChartProps {
  data: MachineUtilization[];
}

export function UtilizationChart({ data }: UtilizationChartProps) {
  const getBarColor = (utilization: number) => {
    if (utilization >= 85) return "oklch(0.45 0.18 250)";
    if (utilization >= 70) return "oklch(0.55 0.2 160)";
    return "oklch(0.55 0.22 25)";
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Utilizacion por Maquina
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.005 260)" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="oklch(0.50 0.01 260)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="category"
                dataKey="machineName"
                stroke="oklch(0.50 0.01 260)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid oklch(0.90 0.005 260)",
                  borderRadius: "8px",
                  color: "oklch(0.15 0.01 260)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value: number) => [`${value}%`, "Utilizacion"]}
                labelStyle={{ color: "oklch(0.50 0.01 260)" }}
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.utilization)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.45 0.18 250)" }} />
            <span className="text-xs text-muted-foreground">{">=85% Optimo"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.55 0.2 160)" }} />
            <span className="text-xs text-muted-foreground">70-84% Aceptable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "oklch(0.55 0.22 25)" }} />
            <span className="text-xs text-muted-foreground">{"<70% Bajo"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
