'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, RefreshCcw, Clock, Package, AlertCircle } from 'lucide-react';
import { qualityService, QUALITY_DECISIONS, QualityEvaluation } from '@/lib/services/quality.service';
import { ERPLayout } from '@/components/erp/erp-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { QualityEvaluationDialog } from './components/QualityEvaluationDialog';

interface PendingProduction {
  id: number;
  code: string;
  work_order_id: number;
  work_order_process_id: number;
  process?: {
    name: string;
  };
  work_order?: {
    product_name: string;
  };
  operator?: {
    name: string;
  };
  good_parts: number;
  scrap_parts: number;
  quality_status: string;
  created_at: string;
}

export default function QualityPage() {
  const [pendingProductions, setPendingProductions] = useState<PendingProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduction, setSelectedProduction] = useState<PendingProduction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPendingEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await qualityService.getPendingEvaluations();
      setPendingProductions(data?.data || data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching pending evaluations:', err);
      setError(err?.message || 'Error al cargar evaluaciones pendientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingEvaluations();
  }, [fetchPendingEvaluations]);

  const getDecisionBadge = (decision: string | null) => {
    if (!decision) return <Badge variant="outline">Pendiente</Badge>;
    
    const config = QUALITY_DECISIONS[decision as keyof typeof QUALITY_DECISIONS];
    if (!config) return <Badge variant="outline">{decision}</Badge>;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const stats = {
    pending: pendingProductions.filter(p => !p.quality_status || p.quality_status === 'PENDING').length,
    total: pendingProductions.length,
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Control de Calidad" subtitle="Evaluación de calidad de producción">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Control de Calidad</h1>
            <Button onClick={fetchPendingEvaluations} variant="outline">
              Actualizar
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total en Evaluación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              {stats.total}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Productions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Producciones Pendientes de Evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingProductions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay producciones pendientes de evaluación
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Proceso</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead className="text-right">Buenas</TableHead>
                  <TableHead className="text-right">Scrap</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {pendingProductions.map((production) => (
                    <TableRow key={production.id}>
                      <TableCell className="font-medium">{production.code}</TableCell>
                      <TableCell>{production.process?.name || '-'}</TableCell>
                      <TableCell>{production.work_order?.product_name || '-'}</TableCell>
                      <TableCell>{production.operator?.name || '-'}</TableCell>
                      <TableCell className="text-right">{production.good_parts}</TableCell>
                      <TableCell className="text-right">{production.scrap_parts}</TableCell>
                      <TableCell>{getDecisionBadge(production.quality_status)}</TableCell>
                      <TableCell>
                        {new Date(production.created_at).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedProduction(production);
                            setDialogOpen(true);
                          }}
                        >
                          Evaluar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </div>
      </ERPLayout>

      {/* Dialog de evaluación de calidad */}
      <QualityEvaluationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        production={selectedProduction as any}
        onEvaluated={fetchPendingEvaluations}
      />
    </ProtectedRoute>
  );
}
