"use client";

import { useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { loanPaymentsService, loansService } from "@/lib/services";
import type { LoanPayment, CreateLoanPaymentDto, UpdateLoanPaymentDto } from "@/lib/services/loan-payments.service";
import type { Loan } from "@/lib/services/loans.service";
import type { PaginatedResponse } from "@/lib/types/api.types";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentFormDialog } from "./components/PaymentFormDialog";
import { Plus, CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function PaymentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LoanPayment | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load payments from API
  const { data: paymentsResponse, loading, refetch } = useApiQuery<PaginatedResponse<LoanPayment>>(
    () => loanPaymentsService.getAll({ perPage: 100 }),
    { enabled: true }
  );

  // Load loans for dropdown
  const { data: loansResponse } = useApiQuery<any>(
    () => loansService.getAll({ perPage: 100, status: "active" }),
    { enabled: true }
  );

  const payments: LoanPayment[] = paymentsResponse?.data || [];
  const loans: any[] = loansResponse?.data || [];

  // Helper functions
  const getLoanDescription = (loanId: number) => {
    const loan = loans.find((l) => l.id === loanId);
    if (loan) {
      return `${loan.type} - $${loan.amount?.toLocaleString()}`;
    }
    return `Préstamo #${loanId}`;
  };

  const getEmployeeName = (loanId: number) => {
    const loan = loans.find((l) => l.id === loanId);
    return loan?.employee_name || "N/A";
  };

  // Stats
  const totalApplied = payments
    .filter((p) => p.status === "applied")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonth = new Date().toISOString().split("T")[0].slice(0, 7);
  const thisMonthTotal = payments
    .filter((p) => p.date?.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const openNewModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LoanPayment) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateLoanPaymentDto | UpdateLoanPaymentDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await loanPaymentsService.update(editingItem.id, data as UpdateLoanPaymentDto);
      } else {
        await loanPaymentsService.create(data as CreateLoanPaymentDto);
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ERPLayout title="Abonos" subtitle="Registro de pagos a préstamos del personal">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Abonos a Préstamos</h1>
            <p className="text-muted-foreground">
              Registro de pagos a préstamos del personal
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Abono
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{payments.length}</p>
                  <p className="text-xs text-muted-foreground">Total Abonos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-green-500 truncate">{formatCurrency(totalApplied)}</p>
                  <p className="text-xs text-muted-foreground">Aplicados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Calendar className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{formatCurrency(totalPending)}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
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
                  <p className="text-xl font-bold text-foreground truncate">{formatCurrency(thisMonthTotal)}</p>
                  <p className="text-xs text-muted-foreground">Este Mes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <PaymentTable
              data={payments}
              loading={loading}
              onEdit={openEditModal}
              getEmployeeName={getEmployeeName}
              getLoanDescription={getLoanDescription}
            />
          </CardContent>
        </Card>

        <PaymentFormDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          editingItem={editingItem}
          loans={loans}
          onSave={handleSave}
          loading={submitting}
        />
      </div>
    </ERPLayout>
  );
}
