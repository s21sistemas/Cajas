import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Check, XCircle, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductionOrder } from '../types';

interface ProductionStatsProps {
  productions: ProductionOrder[];
}

export function ProductionStats({ productions }: ProductionStatsProps) {
  const stats = {
    pending: productions.filter((p) => p.status === 'pending').length,
    inProgress: productions.filter((p) => p.status === 'in_progress').length,
    paused: productions.filter((p) => p.status === 'paused').length,
    completed: productions.filter((p) => p.status === 'completed').length,
    cancelled: productions.filter((p) => p.status === 'cancelled').length,
    goodParts: productions.reduce((acc, p) => acc + (p.goodParts || 0), 0),
    scrapParts: productions.reduce((acc, p) => acc + (p.scrapParts || 0), 0),
  };

  const statItems = [
    { label: 'En Proceso', value: stats.inProgress, icon: Play, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pausadas', value: stats.paused, icon: Pause, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'Completadas', value: stats.completed, icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Canceladas', value: stats.cancelled, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
    { label: 'Pzas Buenas', value: stats.goodParts.toLocaleString(), icon: Package, color: 'text-chart-2', bg: 'bg-chart-2/10' },
    { label: 'Scrap', value: stats.scrapParts, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((s) => (
        <Card key={s.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg', s.bg)}>
                <s.icon className={cn('h-5 w-5', s.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-card-foreground">{s.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
