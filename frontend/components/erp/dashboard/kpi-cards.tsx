"use client";

import React from "react"

import { ArrowUp, ArrowDown, Factory, Gauge, AlertTriangle, Cpu, Users, Package, Wrench, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardKPIs } from "@/lib/mock-data";

interface KPICardsProps {
  data: DashboardKPIs;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  suffix?: string;
}

// Helper function to format numbers with 2 decimal places
function formatNumber(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toFixed(decimals);
}

// Helper function to format large numbers with K, M suffixes or line break
function formatLargeNumber(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toLocaleString();
}

// Helper function to format change percentage
function formatChange(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function KPICard({ title, value, change, changeLabel, icon, iconBg = "bg-primary/10", suffix }: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline gap-1 mt-1 flex-wrap">
              <span className="text-2xl font-bold text-card-foreground">{value}</span>
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive ? (
                  <ArrowUp className="h-3 w-3 text-success" />
                ) : isNegative ? (
                  <ArrowDown className="h-3 w-3 text-destructive" />
                ) : null}
                <span className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
                )}>
                  {formatChange(change)}
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Producción Total"
        value={formatLargeNumber(data.totalProduction)}
        change={data.productionChange}
        changeLabel="vs. mes anterior"
        icon={<Factory className="h-5 w-5 text-primary" />}
        iconBg="bg-primary/10"
        suffix="piezas"
      />
      <KPICard
        title="Eficiencia"
        value={formatNumber(data.efficiency)}
        change={data.efficiencyChange}
        changeLabel="vs. semana anterior"
        icon={<Gauge className="h-5 w-5 text-success" />}
        iconBg="bg-success/10"
        suffix="%"
      />
      <KPICard
        title="Tasa de Scrap"
        value={formatNumber(data.scrapRate)}
        change={data.scrapRateChange}
        changeLabel="vs. semana anterior"
        icon={<AlertTriangle className="h-5 w-5 text-warning" />}
        iconBg="bg-warning/10"
        suffix="%"
      />
      <KPICard
        title="Alertas Críticas"
        value={data.criticalAlerts}
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        iconBg="bg-destructive/10"
      />
    </div>
  );
}

export function SecondaryKPIs({ data }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Cpu className="h-6 w-6 text-success mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.machinesRunning}</span>
          <span className="text-xs text-muted-foreground">Máquinas Activas</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Cpu className="h-6 w-6 text-muted-foreground mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.machinesAvailable}</span>
          <span className="text-xs text-muted-foreground">Disponibles</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Wrench className="h-6 w-6 text-warning mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.machinesMaintenance}</span>
          <span className="text-xs text-muted-foreground">En Mantenimiento</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Users className="h-6 w-6 text-primary mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.activeOperators}</span>
          <span className="text-xs text-muted-foreground">Operadores Activos</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Package className="h-6 w-6 text-destructive mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.lowStockItems}</span>
          <span className="text-xs text-muted-foreground">Stock Bajo</span>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <ClipboardCheck className="h-6 w-6 text-success mb-2" />
          <span className="text-2xl font-bold text-card-foreground">{data.completedOrders}</span>
          <span className="text-xs text-muted-foreground">Órdenes Completadas</span>
        </CardContent>
      </Card>
    </div>
  );
}
