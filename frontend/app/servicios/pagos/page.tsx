'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { salesService, financeService } from '@/lib/services';
import { CreditCard, DollarSign, Plus, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ERPLayout } from '@/components/erp/erp-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface Payment {
  id: number;
  code: string;
  sale_id: number;
  sale?: {
    code: string;
    client_name: string;
    total: number;
  };
  bank_account_id: number;
  bank_account?: {
    name: string;
    account_number: string;
  };
  amount: number;
  payment_method: string;
  reference: string;
  payment_date: string;
  status: string;
  created_at: string;
}

interface Sale {
  id: number;
  code: string;
  client_name: string;
  total: number;
  status: string;
  payment_type: string;
  paid?: number;
}

interface BankAccount {
  id: number;
  bank: string;
  name: string;
  account_number: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const dataFetchedRef = useRef(false);

  // Fetch all data in one effect
  useEffect(() => {
    // Prevent multiple fetches
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    
    const fetchData = async () => {
      setLoadingSales(true);
      setLoadingBanks(true);
      setLoadingPayments(true);
      
      try {
        // Fetch sales and bank accounts in parallel
        const [salesRes, banksRes]: any = await Promise.all([
          salesService.getAll({ per_page: 100 }),
          financeService.getBankAccountsSelectList()
        ]);
        
        const salesData = salesRes?.data || [];
        setSales(salesData);
        
        const banks = Array.isArray(banksRes) ? banksRes : (banksRes?.data || []);
        setBankAccounts(banks);
        
        // Fetch payments for pending/credit sales only
        const pendingSales = salesData.filter(
          (s: Sale) => s.status === 'pending' || s.payment_type === 'credit'
        );
        
        const allPayments: Payment[] = [];
        for (const sale of pendingSales) {
          try {
            const paymentsRes: any = await salesService.getPayments(sale.id);
            const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.payments || paymentsRes?.data || []);
            if (paymentsData.length > 0) {
              allPayments.push(...paymentsData.map((p: any) => ({
                ...p,
                sale: {
                  code: sale.code,
                  client_name: sale.client_name,
                  total: sale.total
                }
              })));
            }
          } catch (e) {
            console.error('Error fetching payments for sale', sale.id, e);
          }
        }
        setPayments(allPayments);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingSales(false);
        setLoadingBanks(false);
        setLoadingPayments(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array - fetch only once on mount

  const pendingSales = sales.filter(
    (s) => s.status === 'pending' || s.payment_type === 'credit'
  );

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'Transferencia',
    bank_account_id: '',
    reference: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const handleCreatePayment = async () => {
    if (!selectedSale) return;
    
    setSaving(true);
    try {
      await salesService.recordPayment(selectedSale.id, {
        amount: Number(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        bank_account_id: Number(paymentForm.bank_account_id),
        reference: paymentForm.reference,
        payment_date: paymentForm.payment_date,
      });
      
      setModalOpen(false);
      setSelectedSale(null);
      setPaymentForm({
        amount: 0,
        payment_method: 'Transferencia',
        bank_account_id: '',
        reference: '',
        payment_date: new Date().toISOString().split('T')[0],
      });
      
      // Refresh data without page reload
      const refreshData = async () => {
        try {
          setLoadingPayments(true);
          
          // Refresh sales
          const salesRes: any = await salesService.getAll({ per_page: 100 });
          const salesData = salesRes?.data || [];
          setSales(salesData);
          
          // Refresh payments
          const pendingSales = salesData.filter(
            (s: Sale) => s.status === 'pending' || s.payment_type === 'credit'
          );
          
          const allPayments: Payment[] = [];
          for (const sale of pendingSales) {
            try {
              const paymentsRes: any = await salesService.getPayments(sale.id);
              const paymentsData = Array.isArray(paymentsRes) ? paymentsRes : (paymentsRes?.payments || paymentsRes?.data || []);
              if (paymentsData.length > 0) {
                allPayments.push(...paymentsData.map((p: any) => ({
                  ...p,
                  sale: {
                    code: sale.code,
                    client_name: sale.client_name,
                    total: sale.total
                  }
                })));
              }
            } catch (e) {
              console.error('Error fetching payments for sale', sale.id, e);
            }
          }
          setPayments(allPayments);
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setLoadingPayments(false);
        }
      };
      
      refreshData();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setSaving(false);
    }
  };

  const openPaymentModal = (sale: any) => {
    setSelectedSale(sale);
    setPaymentForm({
      amount: sale.total,
      payment_method: 'Transferencia',
      bank_account_id: '',
      reference: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="h-3 w-3 mr-1" /> Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingSales.reduce((sum, s) => sum + (s.total - (s.paid || 0)), 0);

  return (
    <ProtectedRoute>
      <ERPLayout title="Pagos" subtitle="Gestión de pagos recibidos">
        <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagos de Ventas</h1>
          <p className="text-muted-foreground">Gestión de pagos recibidos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Recibido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{formatCurrency(totalReceived)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendiente por Cobrar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">{formatCurrency(totalPending)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{payments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Historial de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pagos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Código</TableHead>
                  <TableHead className="text-muted-foreground">Venta</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Monto</TableHead>
                  <TableHead className="text-muted-foreground">Método</TableHead>
                  <TableHead className="text-muted-foreground">Fecha</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-border">
                    <TableCell className="font-medium">{payment.code}</TableCell>
                    <TableCell>{payment.sale?.code || payment.sale_id}</TableCell>
                    <TableCell>{payment.sale?.client_name || '-'}</TableCell>
                    <TableCell className="font-medium text-green-500">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Sales */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Ventas Pendientes por Cobrar</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSales ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay ventas pendientes
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Venta</TableHead>
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Total</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSales.map((sale: any) => (
                  <TableRow key={sale.id} className="border-border">
                    <TableCell className="font-medium">{sale.code}</TableCell>
                    <TableCell>{sale.client_name}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(sale.total)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.payment_type === 'credit' ? 'outline' : 'default'}>
                        {sale.payment_type === 'credit' ? 'Crédito' : 'Contado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openPaymentModal(sale)}>
                        <Plus className="h-4 w-4 mr-1" /> Registrar Pago
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedSale && (
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">{selectedSale.code}</p>
                <p className="text-sm text-muted-foreground">{selectedSale.client_name}</p>
                <p className="text-lg font-bold text-green-500 mt-1">{formatCurrency(selectedSale.total)}</p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={0.01}
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_method">Método de Pago</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_account">Cuenta Bancaria</Label>
              <Select
                value={paymentForm.bank_account_id}
                onValueChange={(value) => setPaymentForm({ ...paymentForm, bank_account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((bank: any) => (
                    <SelectItem key={bank.id} value={bank.id.toString()}>
                      {bank.bank} - {bank.name} - {bank.accountNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reference">Referencia</Label>
              <Input
                id="reference"
                value={paymentForm.reference}
                onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                placeholder="Número de referencia"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_date">Fecha de Pago</Label>
              <Input
                id="payment_date"
                type="date"
                value={paymentForm.payment_date}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePayment} disabled={saving || !paymentForm.bank_account_id}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Registrar Pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ERPLayout>
    </ProtectedRoute>
  );
}
