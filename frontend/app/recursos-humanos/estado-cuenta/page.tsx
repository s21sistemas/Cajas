"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { hrService } from "@/lib/services";

// Interfaz local para mostrar datos de cuenta de empleado
interface EmployeeAccountDisplay {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  baseSalary: number;
  loans: number;
  discounts: number;
  overtime: number;
  guards: number;
  netBalance: number;
}

export default function HRAccountPage() {
  const [accounts, setAccounts] = useState<EmployeeAccountDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await hrService.getEmployeeAccounts();
        console.log(response);
        // Transformar los datos del endpoint al formato requerido
        const transformedAccounts: EmployeeAccountDisplay[] = response.map((account: any) => ({
          id: account.id,
          employeeId: account.employeeId,
          employeeName: account.employeeName,
          department: account.department,
          baseSalary: parseFloat(account.baseSalary) || 0,
          loans: parseFloat(account.loans) || 0,
          discounts: parseFloat(account.discounts) || 0,
          overtime: parseFloat(account.overtime) || 0,
          guards: parseFloat(account.guards) || 0,
          netBalance: parseFloat(account.netBalance) || 0,
        }));
        setAccounts(transformedAccounts);
      } catch (error) {
        console.error("Error loading employee accounts:", error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const departments = [...new Set(accounts.map((a) => a.department))];

  const filtered = accounts.filter((a) => {
    const employeeName = a.employeeName || '';
    const matchesSearch = employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter === "all" || a.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const totalLoans = accounts.reduce((sum, a) => sum + a.loans, 0);
  const totalDiscounts = accounts.reduce((sum, a) => sum + a.discounts, 0);
  const totalExtras = accounts.reduce((sum, a) => sum + a.overtime + a.guards, 0);

  return (
    <ERPLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta - Empleados</h1>
            <p className="text-muted-foreground">
              Resumen de saldos y movimientos por empleado
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={() => {
              // Exportar a CSV
              const headers = ['Empleado', 'Departamento', 'Salario Base', 'Préstamos', 'Descuentos', 'Tiempo Extra', 'Guardias', 'Balance Neto'];
              const rows = filtered.map(a => [
                a.employeeName,
                a.department,
                a.baseSalary,
                a.loans,
                a.discounts,
                a.overtime,
                a.guards,
                a.netBalance
              ]);
              
              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `estado_cuenta_${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empleados</p>
                  <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prestamos Activos</p>
                  <p className="text-2xl font-bold text-red-400">${totalLoans.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descuentos Fijos</p>
                  <p className="text-2xl font-bold text-yellow-400">${totalDiscounts.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Extras Pendientes</p>
                  <p className="text-2xl font-bold text-green-400">${totalExtras.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-foreground">Estado de Cuenta por Empleado</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Empleado</TableHead>
                    <TableHead className="text-muted-foreground">Departamento</TableHead>
                    <TableHead className="text-muted-foreground text-right">Salario Base</TableHead>
                    <TableHead className="text-muted-foreground text-right">Prestamos</TableHead>
                    <TableHead className="text-muted-foreground text-right">Descuentos</TableHead>
                    <TableHead className="text-muted-foreground text-right">T. Extra</TableHead>
                    <TableHead className="text-muted-foreground text-right">Bonos</TableHead>
                    <TableHead className="text-muted-foreground text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((account) => (
                    <TableRow key={account.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{account.employeeName}</TableCell>
                      <TableCell className="text-muted-foreground">{account.department}</TableCell>
                      <TableCell className="text-right text-foreground">${account.baseSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-red-400">
                        {account.loans > 0 ? `-$${account.loans.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-yellow-400">
                        {account.discounts > 0 ? `-$${account.discounts.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-green-400">
                        {account.overtime > 0 ? `+$${account.overtime.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-green-400">
                        {account.guards > 0 ? `+$${account.guards.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={account.netBalance >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                          {account.netBalance >= 0 ? "+" : ""}${account.netBalance.toLocaleString()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ERPLayout>
  );
}
