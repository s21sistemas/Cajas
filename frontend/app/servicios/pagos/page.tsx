'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { salesService, financeService, suppliersService, accountStatementsService, purchaseOrdersService } from '@/lib/services';
import { DollarSign, Plus, Loader2, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ERPLayout } from '@/components/erp/erp-layout';

interface Payment {
  id: number;
  code: string;
  type: 'receivable' | 'payable';
  amount: number;
  paymentMethod: string;
  reference: string;
  paymentDate: string;
  status: string;
  clientName?: string;
  supplierName?: string;
  saleCode?: string;
  purchase_order_code?: string;
}

interface Sale {
  id: number;
  code: string;
  clientName: string;
  total: number;
  paid?: number;
  balance?: number;
  status: string;
  paymentType: string;
  creditDays: number;
  dueDate: string | null;
  accountStatement?: {
    amount: number;
    paid: number;
    balance: number;
  };
}

interface PurchaseOrder {
  id: number;
  code: string;
  supplierName: string;
  total: number;
  paid?: number;
  balance?: number;
  status: string;
  paymentType: string;
  creditDays: number;
  dueDate: string | null;
}

interface BankAccount {
  id: number;
  bank: string;
  name: string;
  account_number: string;
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('receivables');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'receivable' | 'payable'>('receivable');
  const [selectedItem, setSelectedItem] = useState<Sale | PurchaseOrder | null>(null);
  const dataFetchedRef = useRef(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'Transferencia',
    bank_account_id: '',
    reference: '',
    payment_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    
    const fetchData = async () => {
      setLoadingSales(true);
      setLoadingOrders(true);
      setLoadingBanks(true);
      setLoadingPayments(true);
      
      try {
        const [salesRes, ordersRes, banksRes, accountRes, supplierRes]: any = await Promise.all([
          salesService.getAll({ per_page: 100 }),
          purchaseOrdersService.getAll({ per_page: 100 }),
          financeService.getBankAccountsSelectList(),
          accountStatementsService.getAll({ per_page: 100 }),
          suppliersService.getStatements({ per_page: 100 }),
        ]);
        
        const salesData = salesRes?.data || [];
        const creditSales = salesData
          .filter((s: Sale) => s.status === "pending")
          .map((s: Sale) => {
            const paid = Number(s.accountStatement?.paid || 0);
            const total = Number(s.total || 0);

            return {
              ...s,
              paid,
              balance: Number(s.accountStatement?.balance ?? (total - paid)),
            };
          });

        setSales(creditSales);
        
        const ordersData = ordersRes?.data || [];
        const creditOrders = ordersData.filter((o: PurchaseOrder) => 
          (o.status === 'approved' || o.status === 'ordered' || o.status === 'partial')
        ).map((o: PurchaseOrder) => ({
          ...o,
          balance: o.balance ?? (o.total - (o.paid ?? 0)),
        }));
        setPurchaseOrders(creditOrders);
        
        const banks = Array.isArray(banksRes) ? banksRes : (banksRes?.data || []);
        setBankAccounts(banks);
        
        const allPayments: Payment[] = [];
        
        accountRes?.data?.forEach((item: any) => {
          console.log(item);
          if (item.payments?.length > 0) {
            item.payments.forEach((p: any) => {
              allPayments.push({
                id: p.id,
                code: p.code || `PAGO-${p.id}`,
                type: 'receivable',
                amount: p.amount,
                paymentMethod: p.paymentMethod,
                reference: p.reference || '',
                paymentDate: p.paymentDate,
                status: p.status || 'completed',
                clientName: item.clientName || item.client_name,
                saleCode: item.code,
              });
            });
          }
        });
        
        supplierRes?.data?.forEach((item: any) => {
          if (item.payments?.length > 0) {
            item.payments.forEach((p: any) => {
              console.log(p);
              allPayments.push({
                id: p.id,
                code: p.code || `PAGO-${p.id}`,
                type: 'payable',
                amount: p.amount,
                paymentMethod: p.paymentMethod,
                reference: p.reference || '',
                paymentDate: p.paymentDate,
                status: p.status || 'completed',
                supplierName: item.supplierName || item.supplier_name,
                purchase_order_code: item.code || item.invoice_number,
              });
            });
          }
        });
        
        allPayments.sort((a, b) => 
          new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        );
        setPayments(allPayments);
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingSales(false);
        setLoadingOrders(false);
        setLoadingBanks(false);
        setLoadingPayments(false);
      }
    };
    
    fetchData();
  }, []);

  const openPaymentModal = (type: 'receivable' | 'payable', item: Sale | PurchaseOrder) => {
    setPaymentType(type);
    setSelectedItem(item);
    setPaymentForm({
      amount: item.balance || item.total,
      payment_method: 'Transferencia',
      bank_account_id: '',
      reference: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleCreatePayment = async () => {
    if (!selectedItem) return;
    
    setSaving(true);
    try {
      if (paymentType === 'receivable') {
        await salesService.recordPayment(selectedItem.id, {
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          bank_account_id: Number(paymentForm.bank_account_id),
          reference: paymentForm.reference,
          payment_date: paymentForm.payment_date,
        });
      } else {
        await purchaseOrdersService.recordPayment(selectedItem.id, {
          amount: Number(paymentForm.amount),
          payment_method: paymentForm.payment_method,
          bank_account_id: Number(paymentForm.bank_account_id),
          reference: paymentForm.reference,
          payment_date: paymentForm.payment_date,
        });
      }
      
      setModalOpen(false);
      setSelectedItem(null);
      setPaymentForm({
        amount: 0,
        payment_method: 'Transferencia',
        bank_account_id: '',
        reference: '',
        payment_date: new Date().toISOString().split('T')[0],
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  const totalReceivables = sales.reduce((sum, s) => Number(sum) + (Number(s.balance) || 0), 0);
  const totalPayables = purchaseOrders.reduce((sum, o) => Number(sum) + (Number(o.balance) || 0), 0);
  const totalReceived = payments.filter(p => p.type === 'receivable').reduce((sum, p) => Number(sum) + Number(p.amount), 0);
  const totalPaid = payments.filter(p => p.type === 'payable').reduce((sum, p) => Number(sum) + Number(p.amount), 0);

  return (
    <ERPLayout title="Pagos" subtitle="Gestión de cobros y pagos">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
            <p className="text-muted-foreground">Gestión de cobros y pagos a proveedores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Cobrar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-red-400" />
                <span className="text-2xl font-bold text-red-400">{formatCurrency(totalReceivables)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Por Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-orange-400" />
                <span className="text-2xl font-bold text-orange-400">{formatCurrency(totalPayables)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cobrado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500">{formatCurrency(totalReceived)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pagado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold text-blue-500">{formatCurrency(totalPaid)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="receivables" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Cuentas por Cobrar
            </TabsTrigger>
            <TabsTrigger value="payables" className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4" />
              Cuentas por Pagar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receivables" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cuentas por Cobrar</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSales ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay cuentas por cobrar
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Venta</TableHead>
                        <TableHead className="text-muted-foreground">Cliente</TableHead>
                        <TableHead className="text-right text-muted-foreground">Total</TableHead>
                        <TableHead className="text-right text-muted-foreground">Pagado</TableHead>
                        <TableHead className="text-right text-muted-foreground">Saldo</TableHead>
                        <TableHead className="text-muted-foreground">Fecha Solicitud</TableHead>
                        <TableHead className="text-muted-foreground">Vencimiento</TableHead>
                        <TableHead className="text-muted-foreground">Días</TableHead>
                        <TableHead className="text-muted-foreground">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((sale: any) => {
                        const daysUntil = sale.creditDays;
                        return (
                          <TableRow key={sale.id} className="border-border">
                            <TableCell className="font-medium">{sale.code}</TableCell>
                            <TableCell>{sale.clientName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                            <TableCell className="text-right text-green-400">{formatCurrency(sale.paid || 0)}</TableCell>
                            <TableCell className="text-right font-medium text-red-400">{formatCurrency(sale.balance)}</TableCell>
                            <TableCell>{formatDate(sale.createdAt)}</TableCell>
                            <TableCell>{formatDate(sale.dueDate)}</TableCell>
                            <TableCell>
                              {daysUntil !== null && (
                                <Badge className={daysUntil < 0 ? "bg-red-500/20 text-red-400" : daysUntil <= 7 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}>
                                  {daysUntil < 0 ? `${Math.abs(daysUntil)} días vencido` : `${daysUntil} días`}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => openPaymentModal('receivable', sale)}>
                                <Plus className="h-4 w-4 mr-1" /> Cobrar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payables" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Cuentas por Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : purchaseOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay cuentas por pagar
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Orden</TableHead>
                        <TableHead className="text-muted-foreground">Proveedor</TableHead>
                        <TableHead className="text-right text-muted-foreground">Total</TableHead>
                        <TableHead className="text-right text-muted-foreground">Pagado</TableHead>
                        <TableHead className="text-right text-muted-foreground">Saldo</TableHead>
                        <TableHead className="text-muted-foreground">Vencimiento</TableHead>
                        <TableHead className="text-muted-foreground">Días</TableHead>
                        <TableHead className="text-muted-foreground">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrders.map((order: any) => {
                        const daysUntil = order.creditDays;
                        return (
                          <TableRow key={order.id} className="border-border">
                            <TableCell className="font-medium">{order.code}</TableCell>
                            <TableCell>{order.supplierName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                            <TableCell className="text-right text-green-400">{formatCurrency(order.paid || 0)}</TableCell>
                            <TableCell className="text-right font-medium text-red-400">{formatCurrency(order.balance)}</TableCell>
                            <TableCell>{formatDate(order.dueDate)}</TableCell>
                            <TableCell>
                              {daysUntil !== null && (
                                <Badge className={daysUntil < 0 ? "bg-red-500/20 text-red-400" : daysUntil <= 7 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}>
                                  {daysUntil < 0 ? `${Math.abs(daysUntil)} días vencido` : `${daysUntil} días`}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => openPaymentModal('payable', order)}>
                                <Plus className="h-4 w-4 mr-1" /> Pagar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
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
                        <TableHead className="text-muted-foreground">Tipo</TableHead>
                        <TableHead className="text-muted-foreground">Cliente/Proveedor</TableHead>
                        <TableHead className="text-right text-muted-foreground">Monto</TableHead>
                        <TableHead className="text-muted-foreground">Método</TableHead>
                        <TableHead className="text-muted-foreground">Fecha</TableHead>
                        <TableHead className="text-muted-foreground">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} className="border-border">
                          <TableCell className="font-medium">{payment.code}</TableCell>
                          <TableCell>
                            <Badge variant={payment.type === 'receivable' ? 'default' : 'secondary'}>
                              {payment.type === 'receivable' ? 'Cobro' : 'Pago'}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.clientName || payment.supplierName || '-'}</TableCell>
                          <TableCell className={`text-right font-medium ${payment.type === 'receivable' ? 'text-green-400' : 'text-blue-400'}`}>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {paymentType === 'receivable' ? 'Registrar Cobro' : 'Registrar Pago'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedItem && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">{paymentType === 'receivable' ? selectedItem.code : (selectedItem as any).code}</p>
                  <p className="text-sm text-muted-foreground">
                    {paymentType === 'receivable' ? (selectedItem as any).client_name : (selectedItem as any).supplier_name}
                  </p>
                  <p className="text-lg font-bold text-green-500 mt-1">
                    {formatCurrency((selectedItem as any).balance || (selectedItem as any).total)}
                  </p>
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
                        {bank.bank} - {bank.name}
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
                {paymentType === 'receivable' ? 'Registrar Cobro' : 'Registrar Pago'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
