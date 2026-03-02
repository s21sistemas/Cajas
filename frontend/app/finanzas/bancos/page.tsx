"use client";

import { useState } from "react";
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
import { Plus, Search, Edit, Trash2, Landmark, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import { financeService } from "@/lib/services/finance.service";
import type { BankAccount } from "@/lib/types/finance.types";
import type { PaginatedResponse } from "@/lib/types/api.types";
import { Skeleton } from "@/components/ui/skeleton";

const accountFields = [
  { name: "bank", label: "Banco", type: "select", required: true, options: [
    { value: "BBVA", label: "BBVA" },
    { value: "Santander", label: "Santander" },
    { value: "Banorte", label: "Banorte" },
    { value: "HSBC", label: "HSBC" },
    { value: "Citibanamex", label: "Citibanamex" },
    { value: "Scotiabank", label: "Scotiabank" },
  ]},
  { name: "name", label: "Nombre de Cuenta", type: "text", required: true, placeholder: "Ej: Cuenta Principal" },
  { name: "accountNumber", label: "Número de Cuenta", type: "text", required: true, placeholder: "10 dígitos" },
  { name: "clabe", label: "CLABE", type: "text", required: false, placeholder: "18 dígitos" },
  { name: "type", label: "Tipo de Cuenta", type: "select", required: true, options: [
    { value: "checking", label: "Cheques" },
    { value: "savings", label: "Ahorro" },
    { value: "credit", label: "Crédito" },
  ]},
  { name: "currency", label: "Moneda", type: "select", required: true, options: [
    { value: "MXN", label: "Pesos (MXN)" },
    { value: "USD", label: "Dólares (USD)" },
  ]},
  { name: "balance", label: "Saldo Inicial", type: "number", required: true },
  { name: "status", label: "Estado", type: "select", required: true, options: [
    { value: "active", label: "Activa" },
    { value: "inactive", label: "Inactiva" },
    { value: "blocked", label: "Bloqueada" },
  ]},
];

export default function BanksPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState<Partial<BankAccount>>({
    bank: "",
    name: "",
    accountNumber: "",
    clabe: "",
    type: "checking",
    currency: "MXN",
    balance: 0,
    status: "active",
  });

  const { data: accountsResponse, loading, refetch } = useApiQuery<PaginatedResponse<BankAccount>>(
    () => financeService.getBankAccounts(),
    {}
  );

  const accounts = accountsResponse?.data || [];

  const filtered = accounts.filter(
    (account: BankAccount) =>
      account.bank?.toLowerCase().includes(search.toLowerCase()) ||
      account.name?.toLowerCase().includes(search.toLowerCase()) ||
      account.accountNumber?.includes(search)
  );

  const totalBalanceMXN = accounts.filter(acc => acc.currency === 'MXN').reduce((sum: number, acc: BankAccount) => sum + (Number(acc.balance) || 0), 0);
  const totalBalanceUSD = accounts.filter(acc => acc.currency === 'USD').reduce((sum: number, acc: BankAccount) => sum + (Number(acc.balance) || 0), 0);
  const totalAvailableMXN = accounts.filter(acc => acc.currency === 'MXN').reduce((sum: number, acc: BankAccount) => sum + (Number(acc.availableBalance) || 0), 0);
  const totalAvailableUSD = accounts.filter(acc => acc.currency === 'USD').reduce((sum: number, acc: BankAccount) => sum + (Number(acc.availableBalance) || 0), 0);
  const activeAccounts = accounts.filter((acc: BankAccount) => acc.status === "active").length;

  const formatCurrency = (amount: number, currency: string = "MXN") => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Landmark className="h-4 w-4" />;
      case "savings":
        return <TrendingUp className="h-4 w-4" />;
      case "credit":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Landmark className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "checking":
        return <Badge className="bg-blue-500/20 text-blue-400">Cheques</Badge>;
      case "savings":
        return <Badge className="bg-green-500/20 text-green-400">Ahorro</Badge>;
      case "credit":
        return <Badge className="bg-purple-500/20 text-purple-400">Crédito</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Activa</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-500/20 text-yellow-400">Inactiva</Badge>;
      case "blocked":
        return <Badge className="bg-red-500/20 text-red-400">Bloqueada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const openNewModal = () => {
    setEditingAccount(null);
    setFormData({
      bank: "",
      name: "",
      accountNumber: "",
      clabe: "",
      type: "checking",
      currency: "MXN",
      balance: 0,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      bank: account.bank,
      name: account.name,
      accountNumber: account.accountNumber,
      clabe: account.clabe,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
      status: account.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingAccount) {
      await financeService.updateBankAccount(editingAccount.id, formData);
    } else {
      await financeService.createBankAccount(formData);
    }
    await refetch();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    await financeService.deleteBankAccount(id);
    await refetch();
  };

  return (
    <ERPLayout title="Finanzas" subtitle="Gestión de bancos y movimientos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cuentas Bancarias</h1>
            <p className="text-muted-foreground">
              Administra las cuentas bancarias de la empresa
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cuenta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cuentas</p>
                  <p className="text-2xl font-bold text-foreground">{accounts.length}</p>
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
                  <p className="text-sm text-muted-foreground">Saldo Total</p>
                  <div className="flex flex-col">
                    {totalBalanceMXN > 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalBalanceMXN)} MXN</p>
                    )}
                    {totalBalanceUSD > 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalBalanceUSD)} USD</p>
                    )}
                    {totalBalanceMXN === 0 && totalBalanceUSD === 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(0)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Disponible</p>
                  <div className="flex flex-col">
                    {totalAvailableMXN > 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalAvailableMXN)} MXN</p>
                    )}
                    {totalAvailableUSD > 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalAvailableUSD)} USD</p>
                    )}
                    {totalAvailableMXN === 0 && totalAvailableUSD === 0 && (
                      <p className="text-xl font-bold text-foreground truncate">{formatCurrency(0)}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Edit className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activas</p>
                  <p className="text-2xl font-bold text-foreground">{activeAccounts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Listado de Cuentas</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cuentas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Banco</TableHead>
                    <TableHead className="text-muted-foreground">Nombre</TableHead>
                    <TableHead className="text-muted-foreground">Cuenta</TableHead>
                    <TableHead className="text-muted-foreground">CLABE</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground">Moneda</TableHead>
                    <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((account: BankAccount) => (
                    <TableRow key={account.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{account.bank}</TableCell>
                      <TableCell className="text-foreground">{account.name}</TableCell>
                      <TableCell className="font-mono text-sm text-primary">{account.accountNumber}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{account.clabe || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(account.type)}
                          {getTypeBadge(account.type)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{account.currency}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {formatCurrency(Number(account.balance) || 0, account.currency || "MXN")}
                      </TableCell>
                      <TableCell>{getStatusBadge(account.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(account)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
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
                {editingAccount ? "Editar Cuenta Bancaria" : "Nueva Cuenta Bancaria"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Banco</Label>
                  <Select value={formData.bank} onValueChange={(v) => setFormData({ ...formData, bank: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BBVA">BBVA</SelectItem>
                      <SelectItem value="Santander">Santander</SelectItem>
                      <SelectItem value="Banorte">Banorte</SelectItem>
                      <SelectItem value="HSBC">HSBC</SelectItem>
                      <SelectItem value="Citibanamex">Citibanamex</SelectItem>
                      <SelectItem value="Scotiabank">Scotiabank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Nombre</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="Ej: Cuenta Principal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Número de Cuenta</Label>
                  <Input
                    value={formData.accountNumber || ""}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="10 dígitos"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">CLABE</Label>
                  <Input
                    value={formData.clabe || ""}
                    onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                    className="bg-secondary border-border"
                    placeholder="18 dígitos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Tipo</Label>
                  <Select value={formData.type} onValueChange={(v: "checking" | "savings" | "credit") => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Cheques</SelectItem>
                      <SelectItem value="savings">Ahorro</SelectItem>
                      <SelectItem value="credit">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Moneda</Label>
                  <Select value={formData.currency} onValueChange={(v: "MXN" | "USD") => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Saldo</Label>
                  <Input
                    type="number"
                    value={formData.balance || 0}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                    className="bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado</Label>
                <Select value={formData.status} onValueChange={(v: "active" | "inactive" | "blocked") => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activa</SelectItem>
                    <SelectItem value="inactive">Inactiva</SelectItem>
                    <SelectItem value="blocked">Bloqueada</SelectItem>
                  </SelectContent>
                </Select>
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
