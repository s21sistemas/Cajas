"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  FileText,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  Printer,
} from "lucide-react";

const overtimeData = [
  { month: "Ene", hours: 45 },
  { month: "Feb", hours: 52 },
  { month: "Mar", hours: 38 },
  { month: "Abr", hours: 61 },
  { month: "May", hours: 55 },
  { month: "Jun", hours: 48 },
];

const absenceData = [
  { name: "Justificadas", value: 12, color: "#22c55e" },
  { name: "Injustificadas", value: 5, color: "#ef4444" },
  { name: "Retardos", value: 8, color: "#eab308" },
];

const payrollData = [
  { month: "Ene", nomina: 450000, extras: 28000 },
  { month: "Feb", nomina: 455000, extras: 32000 },
  { month: "Mar", nomina: 448000, extras: 25000 },
  { month: "Abr", nomina: 462000, extras: 41000 },
  { month: "May", nomina: 460000, extras: 38000 },
  { month: "Jun", nomina: 465000, extras: 35000 },
];

const departmentData = [
  { dept: "Produccion", employees: 15, salary: 320000 },
  { dept: "Ingenieria", employees: 8, salary: 280000 },
  { dept: "Calidad", employees: 5, salary: 125000 },
  { dept: "Mantenimiento", employees: 6, salary: 132000 },
  { dept: "Almacen", employees: 4, salary: 72000 },
  { dept: "Administracion", employees: 7, salary: 245000 },
];

export default function HRReportsPage() {
  const [period, setPeriod] = useState("month");
  const [reportType, setReportType] = useState("all");

  return (
    <ERPLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reportes de Recursos Humanos</h1>
            <p className="text-muted-foreground">
              Analisis y estadisticas del personal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Empleados</p>
                  <p className="text-2xl font-bold text-foreground">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nomina Mensual</p>
                  <p className="text-2xl font-bold text-foreground">$465,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Extra</p>
                  <p className="text-2xl font-bold text-foreground">48h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rotacion</p>
                  <p className="text-2xl font-bold text-foreground">2.1%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Horas Extra por Mes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overtimeData}>
                    <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" />
                    <YAxis stroke="currentColor" className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribucion de Faltas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={absenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {absenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tendencia de Nomina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollData}>
                  <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Line type="monotone" dataKey="nomina" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} name="Nomina Base" />
                  <Line type="monotone" dataKey="extras" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} name="Extras" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Resumen por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <XAxis type="number" stroke="currentColor" className="text-muted-foreground" />
                  <YAxis dataKey="dept" type="category" stroke="currentColor" className="text-muted-foreground" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "salary" ? `$${value.toLocaleString()}` : value,
                      name === "salary" ? "Costo Nomina" : "Empleados",
                    ]}
                  />
                  <Bar dataKey="employees" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Empleados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
