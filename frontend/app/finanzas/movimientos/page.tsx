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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Filter, DollarSign } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import { financeService } from "@/lib/services/finance.service";
import type { Movement } from "@/lib/types/finance.types";
import type { PaginatedResponse } from "@/lib/types/api.types";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovementsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split("T")[0],
    type: "income",
    category: "",
    description: "",
    reference: "",
    amount: 0,
    bank_account_id: "",
    balance: 0,
    status: "completed",
  });

  // Load accounts for the select
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await financeService.getBankAccounts();
        setAccounts(response.data || []);
      } catch (error) {
        console.error("Error loading accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  const { data: movementsResponse, loading, refetch } = useApiQuery<PaginatedResponse<Movement>>(
    () => financeService.getAllMovements(),
    {}
  );

  const movements = movementsResponse?.data || [];

  const filtered = movements.filter((m: Movement) => {
    const matchesSearch =
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase()) ||
      m.category?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const incomeMXN = movements
    .filter((m: Movement) => m.type === "income" && (m.bankAccount?.currency === 'MXN' || !m.bankAccount))
    .reduce((sum: number, m: Movement) => sum + (m.amount || 0), 0);
  const incomeUSD = movements
    .filter((m: Movement) => m.type === "income" && m.bankAccount?.currency === 'USD')
    .reduce((sum: number, m: Movement) => sum + (m.amount || 0), 0);
  const expenseMXN = movements
    .filter((m: Movement) => m.type === "expense" && (m.bankAccount?.currency === 'MXN' || !m.bankAccount))
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  const expenseUSD = movements
    .filter((m: Movement) => m.type === "expense" && m.bankAccount?.currency === 'USD')
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  const pendingMovements = movements.filter((m: Movement) => m.status === "pending").length;

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
    }).format(Math.abs(amount));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "income":
        return <ArrowDownRight className="h-4 w-4 text-green-400" />;
      case "expense":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-blue-400" />;
      default:
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-green-500/20 text-green-400">Ingreso</Badge>;
      case "expense":
        return <Badge className="bg-red-500/20 text-red-400">Gasto</Badge>;
      case "transfer":
        return <Badge className="bg-blue-500/20 text-blue-400">Transferencia</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400">Completado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pendiente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/20 text-red-400">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openNewModal = () => {
    setEditingMovement(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "income",
      category: "",
      description: "",
      reference: "",
      amount: 0,
      bank_account_id: "",
      balance: 0,
      status: "completed",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movement: Movement) => {
    setEditingMovement(movement);
    setFormData({
      date: movement.date,
      type: movement.type,
      category: movement.category,
      description: movement.description,
      reference: movement.reference,
      amount: movement.amount,
      bank_account_id: movement.bankAccountId?.toString() || "",
      balance: movement.balance,
      status: movement.status,
    });
    setIsModalOpen(true);
  };

  const handleBankChange = (bankId: string) => {
    const selectedAccount = accounts.find((a: any) => a.id.toString() === bankId);
    setFormData({
      ...formData,
      bank_account_id: bankId,
      balance: selectedAccount?.balance || 0,
    });
  };

  const handleSave = async () => {
    if (!formData.bank_account_id) {
      alert("Por favor selecciona una cuenta bancaria");
      return;
    }
    const dataToSend = {
      date: formData.date,
      type: formData.type,
      category: formData.category,
      description: formData.description,
      reference: formData.reference,
      amount: Number(formData.amount),
      bank_account_id: Number(formData.bank_account_id),
      balance: Number(formData.balance),
      status: formData.status,
    };
    
    if (editingMovement) {
      await financeService.updateMovement(editingMovement.id, dataToSend);
    } else {
      await financeService.createMovement(dataToSend);
    }
    await refetch();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    await financeService.deleteMovement(id);
    await refetch();
  };

  return (
    <ERPLayout title="Finanzas" subtitle="Movimientos y flujo de efectivo">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Movimientos Financieros</h1>
            <p className="text-muted-foreground">
              Registra y consulta los movimientos de las cuentas bancarias
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowDownRight className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <div className="flex flex-col">
                    {incomeMXN > 0 && (
                      <p className="text-xl font-bold text-green-400 break-all">{formatCurrency(incomeMXN, 'MXN')}</p>
                    )}
                    {incomeUSD > 0 && (
                      <p className="text-xl font-bold text-green-400 break-all">{formatCurrency(incomeUSD, 'USD')}</p>
                    )}
                    {incomeMXN === 0 && incomeUSD === 0 && (
                      <p className="text-xl font-bold text-green-400 break-all">{formatCurrency(0, 'MXN')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ArrowUpRight className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <div className="flex flex-col">
                    {expenseMXN > 0 && (
                      <p className="text-xl font-bold text-red-400 break-all">{formatCurrency(expenseMXN, 'MXN')}</p>
                    )}
                    {expenseUSD > 0 && (
                      <p className="text-xl font-bold text-red-400 break-all">{formatCurrency(expenseUSD, 'USD')}</p>
                    )}
                    {expenseMXN === 0 && expenseUSD === 0 && (
                      <p className="text-xl font-bold text-red-400 break-all">{formatCurrency(0, 'MXN')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
                  <DollarSign className={`h-5 w-5 ${(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Neto</p>
                  <div className="flex flex-col">
                    {incomeMXN - expenseMXN > 0 && (
                      <p className="text-xl font-bold text-blue-400 break-all">{formatCurrency(incomeMXN - expenseMXN, 'MXN')}</p>
                    )}
                    {incomeMXN - expenseMXN < 0 && (
                      <p className="text-xl font-bold text-red-400 break-all">-{formatCurrency(Math.abs(incomeMXN - expenseMXN), 'MXN')}</p>
                    )}
                    {incomeUSD - expenseUSD > 0 && (
                      <p className="text-xl font-bold text-blue-400 break-all">{formatCurrency(incomeUSD - expenseUSD, 'USD')}</p>
                    )}
                    {incomeUSD - expenseUSD < 0 && (
                      <p className="text-xl font-bold text-red-400 break-all">-{formatCurrency(Math.abs(incomeUSD - expenseUSD), 'USD')}</p>
                    )}
                    {(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) === 0 && (
                      <p className="text-xl font-bold text-muted-foreground break-all">{formatCurrency(0, 'MXN')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Filter className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                  <p className="text-2xl font-bold text-foreground">{pendingMovements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Historial de Movimientos</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar movimientos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary border-border"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="income">Ingresos</SelectItem>
                    <SelectItem value="expense">Gastos</SelectItem>
                    <SelectItem value="transfer">Transferencias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Banco</TableHead>
                    <TableHead className="text-muted-foreground">Cuenta</TableHead>
                    <TableHead className="text-muted-foreground">Referencia</TableHead>
                    <TableHead className="text-muted-foreground">Categoría</TableHead>
                    <TableHead className="text-muted-foreground">Descripción</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground text-right">Monto</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((movement: Movement) => (
                    <TableRow key={movement.id} className="border-border">
                      <TableCell className="text-muted-foreground">{movement.date}</TableCell>
                      <TableCell className="text-muted-foreground">{movement.bankAccount?.bank}</TableCell>
                      <TableCell className="text-muted-foreground">{movement.bankAccount?.clabe}</TableCell>
                      <TableCell className="font-mono text-sm text-primary">{movement.reference}</TableCell>
                      <TableCell className="text-muted-foreground">{movement.category}</TableCell>
                      <TableCell className="text-foreground">{movement.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(movement.type)}
                          {getTypeBadge(movement.type)}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${movement.type === "income" ? "text-green-400" : "text-red-400"}`}>
                        {movement.type === "expense" ? "-" : "+"}{formatCurrency(movement.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(movement.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(movement)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(movement.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingMovement ? "Editar Movimiento" : "Nuevo Movimiento"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Cuenta Bancaria</Label>
                  <Select
                    value={formData.bank_account_id?.toString()}
                    onValueChange={handleBankChange}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Seleccionar cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account: any) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.bank} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Fecha</Label>
                  <Input
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: "income" | "expense" | "transfer") => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Ingreso</SelectItem>
                      <SelectItem value="expense">Gasto</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Categoría</Label>
                  <Input
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="Ej: Ventas, Nómina"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Referencia</Label>
                  <Input
                    value={formData.reference || ""}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="Ej: FAC-2024-001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Descripción</Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="Descripción del movimiento"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Monto</Label>
                  <Input
                    type="number"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="bg-secondary border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: "completed" | "pending" | "cancelled") => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
