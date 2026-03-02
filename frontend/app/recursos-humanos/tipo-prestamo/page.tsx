"use client";

import { useState, useEffect } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Wallet } from "lucide-react";
import { loanTypesService, type LoanType } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";

export default function LoanTypesPage() {
  const { showToast } = useToast();
  const [types, setTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LoanType | null>(null);
  const [deletingItem, setDeletingItem] = useState<LoanType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    maxAmount: 0,
    maxTermMonths: 1,
    interestRate: 0,
    requirements: "",
    status: "active" as "active" | "inactive",
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await loanTypesService.getAll();
      setTypes(data);
    } catch (error: any) {
      console.error("Error fetching loan types:", error);
      showToast("error", "Error", "No se pudieron cargar los tipos de préstamo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filtered = types.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      code: `PRE-${String(types.length + 1).padStart(3, "0")}`,
      name: "",
      description: "",
      maxAmount: 0,
      maxTermMonths: 1,
      interestRate: 0,
      requirements: "",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: LoanType) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      maxAmount: item.maxAmount,
      maxTermMonths: item.maxTermMonths,
      interestRate: item.interestRate,
      requirements: item.requirements || "",
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await loanTypesService.update(editingItem.id, formData);
        showToast("success", "Éxito", "Tipo de préstamo actualizado correctamente");
      } else {
        await loanTypesService.create(formData);
        showToast("success", "Éxito", "Tipo de préstamo creado correctamente");
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await loanTypesService.delete(deletingItem.id);
      showToast("success", "Éxito", "Tipo de préstamo eliminado correctamente");
      setDeletingItem(null);
      fetchTypes();
    } catch (error: any) {
      const errorMessage = error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ERPLayout title="Tipos de Préstamo" subtitle="Catálogo de tipos de préstamo disponibles">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tipos de Prestamo</h1>
            <p className="text-muted-foreground">
              Catalogo de tipos de prestamo disponibles
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Tipo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tipos</p>
                  <p className="text-2xl font-bold text-foreground">{types.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Wallet className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {types.filter((t) => t.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inactivos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {types.filter((t) => t.status === "inactive").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Catalogo de Tipos</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Codigo</TableHead>
                    <TableHead className="text-muted-foreground">Nombre</TableHead>
                    <TableHead className="text-muted-foreground text-right">Monto Max</TableHead>
                    <TableHead className="text-muted-foreground">Plazo Max</TableHead>
                    <TableHead className="text-muted-foreground text-right">Interes</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{item.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground max-w-[200px] truncate">{item.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {item.maxAmount > 0 ? `$${item.maxAmount.toLocaleString()}` : "Variable"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.maxTermMonths} meses</TableCell>
                      <TableCell className="text-right text-foreground">{item.interestRate}%</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingItem(item)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingItem ? "Editar Tipo de Prestamo" : "Nuevo Tipo de Prestamo"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Codigo</Label>
                  <Input value={formData.code} disabled className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Estado</Label>
                  <Select value={formData.status} onValueChange={(v: "active" | "inactive") => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nombre</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Descripcion</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-secondary border-border" rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Monto Maximo ($)</Label>
                  <Input type="number" value={formData.maxAmount} onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Plazo (meses)</Label>
                  <Input type="number" value={formData.maxTermMonths} onChange={(e) => setFormData({ ...formData, maxTermMonths: Number(e.target.value) })} className="bg-secondary border-border" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Interes (%)</Label>
                  <Input type="number" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })} className="bg-secondary border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Requisitos</Label>
                <Textarea value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} className="bg-secondary border-border" rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          title="Eliminar Tipo de Préstamo"
          description={`¿Está seguro de eliminar el tipo de préstamo "${deletingItem?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </ERPLayout>
  );
}
