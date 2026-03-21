"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { loansService, employeesService } from "@/lib/services";
import type { Loan, CreateLoanDto, UpdateLoanDto } from "@/lib/services/loans.service";
import type { PaginatedResponse } from "@/lib/types/api.types";
import { LoanTable } from "./components/LoanTable";
import { LoanFormDialog } from "./components/LoanFormDialog";
import { Plus, Wallet, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function LoansPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Loan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load loans from API
  const { data: loansResponse, loading, refetch } = useApiQuery<PaginatedResponse<Loan>>(
    () => loansService.getAll({ perPage: 100 }),
    { enabled: true }
  );

  // Load employees for dropdown
  const { data: employeesResponse } = useApiQuery<any>(
    () => employeesService.getSelectList(),
    { enabled: true }
  );

  const loans: Loan[] = loansResponse?.data || [];
  const employees: any[] = employeesResponse || [];

  // Stats
  const totalLoaned = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalBalance = loans.reduce((sum, l) => sum + l.balance, 0);
  const activeLoans = loans.filter((l) => l.status === "active").length;

  const openNewModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Loan) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateLoanDto | UpdateLoanDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await loansService.update(editingItem.id, data as UpdateLoanDto);
      } else {
        await loansService.create(data as CreateLoanDto);
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving loan:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <ERPLayout title="Préstamos" subtitle="Gestiona los préstamos al personal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Préstamos</h1>
            <p className="text-muted-foreground">
              Gestiona los préstamos al personal
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Préstamo
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{loans.length}</p>
                  <p className="text-xs text-muted-foreground">Total Préstamos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalLoaned)}</p>
                  <p className="text-xs text-muted-foreground">Total Otorgado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalBalance)}</p>
                  <p className="text-xs text-muted-foreground">Por Cobrar</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{activeLoans}</p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <LoanTable
              data={loans}
              loading={loading}
              onEdit={openEditModal}
            />
          </CardContent>
        </Card>

        <LoanFormDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editingItem={editingItem}
          employees={employees}
          onSave={handleSave}
          loading={submitting}
        />
      </div>
    </ERPLayout>
  );
}
