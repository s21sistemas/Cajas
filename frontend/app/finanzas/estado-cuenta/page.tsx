"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { financeService } from "@/lib/services/finance.service";
import type { BankAccount, Movement } from "@/lib/types/finance.types";
import type { PaginatedResponse } from "@/lib/types/api.types";

// Helper function to format currency with 2 decimal places
const formatCurrency = (amount: number): string => {
  const num = Number(amount) || 0;
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export default function FinanceAccountPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Movement[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [selectedBank, setSelectedBank] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  useEffect(() => {
    const loadData = async () => {
      try {
        const accountsResponse = await financeService.getBankAccounts();
        setAccounts(accountsResponse.data || []);
      } catch (error) {
        console.error("Error loading accounts:", error);
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const params: any = {};
        if (selectedBank !== "all") {
          params.bankAccountId = selectedBank;
        }
        const response = await financeService.getMovements(params);
        setTransactions(response.data || []);
      } catch (error) {
        console.error("Error loading transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };
    loadTransactions();
  }, [selectedBank, selectedPeriod]);

  const filtered = transactions.filter(
    (t) => selectedBank === "all" || t.bankAccountId?.toString() === selectedBank
  );

  const totalBalanceMXN = accounts.filter(acc => acc.currency === 'MXN').reduce((sum: number, acc) => sum + (Number(acc.balance) || 0), 0);
  const totalBalanceUSD = accounts.filter(acc => acc.currency === 'USD').reduce((sum: number, acc) => sum + (Number(acc.balance) || 0), 0);
  
  // Ingresos y Egresos separados por moneda
  const incomeMXN = filtered.filter((t) => t.type === "income" && (t.bankAccount?.currency === 'MXN' || !t.bankAccount)).reduce((sum: number, t) => sum + (Number(t.amount) || 0), 0);
  const incomeUSD = filtered.filter((t) => t.type === "income" && t.bankAccount?.currency === 'USD').reduce((sum: number, t) => sum + (Number(t.amount) || 0), 0);
  const expenseMXN = filtered.filter((t) => t.type === "expense" && (t.bankAccount?.currency === 'MXN' || !t.bankAccount)).reduce((sum: number, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);
  const expenseUSD = filtered.filter((t) => t.type === "expense" && t.bankAccount?.currency === 'USD').reduce((sum: number, t) => sum + (Math.abs(Number(t.amount)) || 0), 0);

  const getBankName = (transaction: any) => {
    if (transaction.bank) return transaction.bank;
    if (transaction.bankAccount) return transaction.bankAccount.bank;
    return transaction.bankAccountId?.toString() || "General";
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "income":
        return <Badge className="bg-green-500/20 text-green-400">Ingreso</Badge>;
      case "expense":
        return <Badge className="bg-red-500/20 text-red-400">Egreso</Badge>;
      case "transfer":
        return <Badge className="bg-blue-500/20 text-blue-400">Transferencia</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <ERPLayout title="Estado de Cuenta" subtitle="Resumen de cuentas bancarias">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estado de Cuenta Bancario</h1>
            <p className="text-muted-foreground">
              Resumen consolidado de tus cuentas bancarias
            </p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Total</p>
                  <div className="flex flex-col">
                    {totalBalanceMXN > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-foreground break-all">${formatCurrency(totalBalanceMXN)} MXN</p>
                    </div>
                    )}
                    {totalBalanceUSD > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-foreground break-all">${formatCurrency(totalBalanceUSD)} USD</p>
                    </div>
                    )}
                    {totalBalanceMXN === 0 && totalBalanceUSD === 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-foreground break-all">$0.00</p>
                    </div>
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
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <div className="flex flex-col">
                    {incomeMXN > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-green-400 break-all">${formatCurrency(incomeMXN)} MXN</p>
                    </div>
                    )}
                    {incomeUSD > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-green-400 break-all">${formatCurrency(incomeUSD)} USD</p>
                    </div>
                    )}
                    {incomeMXN === 0 && incomeUSD === 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-green-400 break-all">$0.00</p>
                    </div>
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
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Egresos</p>
                  <div className="flex flex-col">
                    {expenseMXN > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-red-400 break-all">${formatCurrency(expenseMXN)} MXN</p>
                    </div>
                    )}
                    {expenseUSD > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-red-400 break-all">${formatCurrency(expenseUSD)} USD</p>
                    </div>
                    )}
                    {expenseMXN === 0 && expenseUSD === 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-red-400 break-all">$0.00</p>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Flujo Neto</p>
                  <div className="flex flex-col">
                    {incomeMXN - expenseMXN > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-green-400 break-all">${formatCurrency(incomeMXN - expenseMXN)} MXN</p>
                    </div>
                    )}
                    {incomeMXN - expenseMXN < 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-red-400 break-all">${formatCurrency(Math.abs(incomeMXN - expenseMXN))} MXN</p>
                    </div>
                    )}
                    {incomeUSD - expenseUSD > 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-green-400 break-all">${formatCurrency(incomeUSD - expenseUSD)} USD</p>
                    </div>
                    )}
                    {incomeUSD - expenseUSD < 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-red-400 break-all">${formatCurrency(Math.abs(incomeUSD - expenseUSD))} USD</p>
                    </div>
                    )}
                    {(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) === 0 && (
                      <div className="min-w-0 flex-1">
                      <p className="text-xl font-bold text-muted-foreground break-all">$0.00</p>
                    </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingAccounts ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            accounts.map((account) => (
              <Card key={account.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground">****{account.accountNumber?.slice(-4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground break-all">${formatCurrency(account.balance || 0)}</p>
                      <p className="text-xs text-muted-foreground">{account.currency}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-foreground">Movimientos Bancarios</CardTitle>
              <div className="flex items-center gap-3">
                <Select value={selectedBank} onValueChange={setSelectedBank}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue placeholder="Banco" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Banorte">Banorte</SelectItem>
                    <SelectItem value="BBVA">BBVA</SelectItem>
                    <SelectItem value="Santander">Santander</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40 bg-secondary border-border">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mes</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingTransactions ? (
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
                    <TableHead className="text-muted-foreground">Referencia</TableHead>
                    <TableHead className="text-muted-foreground">Descripcion</TableHead>
                    <TableHead className="text-muted-foreground">Banco</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Tipo</TableHead>
                    <TableHead className="text-muted-foreground text-right">Monto</TableHead>
                    <TableHead className="text-muted-foreground text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell className="font-mono text-sm text-primary">{transaction.reference}</TableCell>
                      <TableCell className="font-medium text-foreground max-w-[250px] truncate">{transaction.description}</TableCell>
                      <TableCell className="text-muted-foreground">{getBankName(transaction)}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.category}</TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-400' : transaction.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right text-foreground">${formatCurrency(transaction.balance)}</TableCell>
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
