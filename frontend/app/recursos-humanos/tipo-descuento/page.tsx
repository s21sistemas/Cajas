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
import { Plus, Search, Edit, Trash2, Tags } from "lucide-react";

interface DiscountType {
  id: string;
  code: string;
  name: string;
  description: string;
  category: "legal" | "voluntary" | "company";
  status: "active" | "inactive";
}

const mockTypes: DiscountType[] = [
  { id: "1", code: "DSC-001", name: "Prestamo Personal", description: "Descuento por prestamo otorgado por la empresa", category: "company", status: "active" },
  { id: "2", code: "DSC-002", name: "INFONAVIT", description: "Retencion para credito de vivienda INFONAVIT", category: "legal", status: "active" },
  { id: "3", code: "DSC-003", name: "FONACOT", description: "Descuento por credito FONACOT", category: "legal", status: "active" },
  { id: "4", code: "DSC-004", name: "Pension Alimenticia", description: "Retencion por orden judicial", category: "legal", status: "active" },
  { id: "5", code: "DSC-005", name: "Caja de Ahorro", description: "Aportacion voluntaria a caja de ahorro", category: "voluntary", status: "active" },
  { id: "6", code: "DSC-006", name: "Seguro de Vida", description: "Prima de seguro de vida adicional", category: "voluntary", status: "inactive" },
];

export default function DiscountTypesPage() {
  const [types, setTypes] = useState<DiscountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountType | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "company" as const,
    status: "active" as const,
  });

  useEffect(() => {
    const loadData = async () => {
      await new Promise((r) => setTimeout(r, 300));
      setTypes(mockTypes);
      setLoading(false);
    };
    loadData();
  }, []);

  const filtered = types.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  );

  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      code: `DSC-${String(types.length + 1).padStart(3, "0")}`,
      name: "",
      description: "",
      category: "company",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: DiscountType) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description,
      category: item.category,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      setTypes(types.map((t) => (t.id === editingItem.id ? { ...t, ...formData } : t)));
    } else {
      const newItem: DiscountType = {
        id: String(types.length + 1),
        ...formData,
      };
      setTypes([...types, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setTypes(types.filter((t) => t.id !== id));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "legal":
        return <Badge className="bg-blue-500/20 text-blue-400">Legal</Badge>;
      case "voluntary":
        return <Badge className="bg-green-500/20 text-green-400">Voluntario</Badge>;
      case "company":
        return <Badge className="bg-purple-500/20 text-purple-400">Empresa</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  return (
    <ERPLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tipos de Descuento</h1>
            <p className="text-muted-foreground">
              Catalogo de tipos de descuento para nomina
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Tags className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Legales</p>
                  <p className="text-2xl font-bold text-foreground">
                    {types.filter((t) => t.category === "legal").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Tags className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voluntarios</p>
                  <p className="text-2xl font-bold text-foreground">
                    {types.filter((t) => t.category === "voluntary").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Tags className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="text-2xl font-bold text-foreground">
                    {types.filter((t) => t.category === "company").length}
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
                    <TableHead className="text-muted-foreground">Descripcion</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{item.code}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[250px] truncate">{item.description}</TableCell>
                      <TableCell>{getCategoryBadge(item.category)}</TableCell>
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
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
                {editingItem ? "Editar Tipo de Descuento" : "Nuevo Tipo de Descuento"}
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
                <Label className="text-foreground">Categoria</Label>
                <Select value={formData.category} onValueChange={(v: "legal" | "voluntary" | "company") => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="voluntary">Voluntario</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Descripcion</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-secondary border-border" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
