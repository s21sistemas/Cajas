"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProductionChartData } from "@/lib/mock-data";

interface ProductionChartProps {
  data: ProductionChartData[];
}

export function ProductionChart({ data }: ProductionChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-card-foreground">
          Producción vs Meta (Últimos 15 días)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProduced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.45 0.18 250)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.45 0.18 250)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.2 160)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.005 260)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="oklch(0.50 0.01 260)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="oklch(0.50 0.01 260)" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid oklch(0.90 0.005 260)",
                  borderRadius: "8px",
                  color: "oklch(0.15 0.01 260)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ color: "oklch(0.50 0.01 260)" }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                formatter={(value) => <span style={{ color: "oklch(0.40 0.01 260)", fontSize: "12px" }}>{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="target"
                name="Meta"
                stroke="oklch(0.55 0.2 160)"
                fillOpacity={1}
                fill="url(#colorTarget)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Area
                type="monotone"
                dataKey="produced"
                name="Producido"
                stroke="oklch(0.45 0.18 250)"
                fillOpacity={1}
                fill="url(#colorProduced)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
