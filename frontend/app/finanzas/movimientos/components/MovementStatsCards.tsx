"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Filter, DollarSign } from "lucide-react";
import type { Movement } from "@/lib/types/finance.types";

interface MovementStatsCardsProps {
  movements: Movement[];
  formatCurrency: (amount: number, currency?: string) => string;
}

export function MovementStatsCards({ movements, formatCurrency }: MovementStatsCardsProps) {
  const incomeMXN = movements
    .filter((m: Movement) => m.type === "income" && (m.bankAccount?.currency === 'MXN' || !m.bankAccount))
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  
  const incomeUSD = movements
    .filter((m: Movement) => m.type === "income" && m.bankAccount?.currency === 'USD')
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  
  const expenseMXN = movements
    .filter((m: Movement) => m.type === "expense" && (m.bankAccount?.currency === 'MXN' || !m.bankAccount))
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  
  const expenseUSD = movements
    .filter((m: Movement) => m.type === "expense" && m.bankAccount?.currency === 'USD')
    .reduce((sum: number, m: Movement) => sum + Math.abs(m.amount || 0), 0);
  
  const pendingMovements = movements.filter((m: Movement) => m.status === "pending").length;

  return (
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
              <ArrowLeftRight className={`h-5 w-5 ${(incomeMXN + incomeUSD) - (expenseMXN + expenseUSD) >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
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
  );
}
