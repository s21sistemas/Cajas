"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/use-api-query";
import { hrService, employeesService } from "@/lib/services";
import type { VacationRequest, CreateVacationRequestDto, Employee } from "@/lib/types/hr.types";
import type { PaginatedResponse } from "@/lib/types/api.types";
import { VacationTable } from "./components/VacationTable";
import { VacationFormDialog } from "./components/VacationFormDialog";
import { Plus, Calendar, Clock, Check, Users } from "lucide-react";

export default function VacationsPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VacationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load vacation requests
  const { data: vacationsResponse, loading, refetch } = useApiQuery<PaginatedResponse<VacationRequest>>(
    () => hrService.getVacationRequests({ perPage: 100 }),
    {}
  );

  // Load employees for dropdown
  const { data: employeesResponse } = useApiQuery<any>(
    () => employeesService.getAll({ per_page: 100 }),
    { enabled: true }
  );

  const vacations = vacationsResponse?.data || [];
  const employees: any[] = employeesResponse?.data || [];

  // Stats
  const pendingCount = vacations.filter((v) => v.status === "pending").length;
  const approvedCount = vacations.filter((v) => v.status === "approved").length;
  const totalDays = vacations.reduce((sum, v) => sum + (v.days || 0), 0);

  const openNewModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: VacationRequest) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateVacationRequestDto) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await hrService.updateVacationRequest(editingItem.id, data);
      } else {
        await hrService.createVacationRequest(data);
      }
      await refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving vacation request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await hrService.approveVacationRequest(id, "Admin");
      await refetch();
    } catch (error) {
      console.error("Error approving vacation:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await hrService.rejectVacationRequest(id, "Rechazado por administración");
      await refetch();
    } catch (error) {
      console.error("Error rejecting vacation:", error);
    }
  };

  return (
    <ERPLayout title="Recursos Humanos" subtitle="Gestión de vacaciones y permisos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vacaciones y Permisos</h1>
            <p className="text-muted-foreground">
              Gestiona las solicitudes de vacaciones del personal
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Solicitud
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{vacations.length}</p>
                  <p className="text-xs text-muted-foreground">Total Solicitudes</p>
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
                  <p className="text-xl font-bold text-foreground truncate">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Aprobadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-foreground truncate">{totalDays}</p>
                  <p className="text-xs text-muted-foreground">Días Solicitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <VacationTable
              data={vacations}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={openEditModal}
            />
          </CardContent>
        </Card>

        <VacationFormDialog
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
