"use client";

import { useEffect, useState } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { KPICards, SecondaryKPIs } from "@/components/erp/dashboard/kpi-cards";
import { ProductionChart } from "@/components/erp/dashboard/production-chart";
import { MachineStatus } from "@/components/erp/dashboard/machine-status";
import { RecentActivity } from "@/components/erp/dashboard/recent-activity";
import { UtilizationChart } from "@/components/erp/dashboard/utilization-chart";
import {
  fetchDashboardKPIs,
  fetchProductionChartData,
  fetchMachines,
  fetchMachineUtilization,
  type DashboardKPIs,
  type ProductionChartData,
  type MachineUtilization,
} from "@/lib/adapters/dashboard.adapter";
import type { Machine } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[380px] bg-card" />
        <Skeleton className="h-[380px] bg-card" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [productionData, setProductionData] = useState<ProductionChartData[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [utilization, setUtilization] = useState<MachineUtilization[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [kpisData, chartData, machinesData, utilizationData] = await Promise.all([
          fetchDashboardKPIs(),
          fetchProductionChartData(),
          fetchMachines(),
          fetchMachineUtilization(),
        ]);
        
        if (isMounted) {
          setKpis(kpisData);
          setProductionData(chartData);
          setMachines(machinesData);
          setUtilization(utilizationData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProtectedRoute>
      <ERPLayout
        title="Dashboard"
        subtitle="Vista general del sistema de producción"
      >
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Main KPIs */}
          <KPICards data={kpis!} />
          
          {/* Secondary KPIs */}
          <SecondaryKPIs data={kpis!} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductionChart data={productionData} />
            <UtilizationChart data={utilization} />
          </div>

          {/* Status and Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MachineStatus machines={machines} utilization={utilization} />
            <RecentActivity />
          </div>
        </div>
      )}
      </ERPLayout>
    </ProtectedRoute>
  );
}
