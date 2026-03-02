"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2, Settings } from "lucide-react";
import { processTypesService, type ProcessType } from "@/lib/services";
import { useToast } from "@/components/erp/action-toast";
import { ConfirmDialog } from "@/components/erp/confirm-dialog";

const processTypeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  description: z.string().optional().default(""),
});

type ProcessTypeFormValues = z.infer<typeof processTypeSchema>;

export default function ProcessTypesPage() {
  const { showToast } = useToast();
  const [types, setTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcessType | null>(null);
  const [deletingItem, setDeletingItem] = useState<ProcessType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const form = useForm<ProcessTypeFormValues>({
    resolver: zodResolver(processTypeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await processTypesService.getAll();
      setTypes(data);
    } catch (error: any) {
      console.error("Error fetching process types:", error);
      showToast("error", "Error", "No se pudieron cargar los tipos de proceso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const filtered = types.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNewModal = () => {
    setEditingItem(null);
    setFormErrors({});
    form.reset({
      name: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProcessType) => {
    setEditingItem(item);
    setFormErrors({});
    form.reset({
      name: item.name,
      description: item.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (data: ProcessTypeFormValues) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        await processTypesService.update(editingItem.id, data);
        showToast("success", "Éxito", "Tipo de proceso actualizado correctamente");
      } else {
        await processTypesService.create(data);
        showToast("success", "Éxito", "Tipo de proceso creado correctamente");
      }
      setIsModalOpen(false);
      fetchTypes();
    } catch (error: any) {
      const errors = error?.errors;
      if (errors) {
        setFormErrors(errors);
        Object.entries(errors).forEach(([field, messages]) => {
          const msgs = messages as string[];
          if (msgs && msgs.length > 0) {
            form.setError(field as keyof ProcessTypeFormValues, {
              type: 'server',
              message: msgs[0],
            });
          }
        });
        const errorMessages = Object.entries(errors).map(([field, msgs]: [string, any]) => `${field}: ${(msgs as string[]).join(', ')}`);
        showToast("error", "Error de validación", errorMessages.join('\n'));
      } else {
        const errorMessage = error?.message || "Error desconocido";
        showToast("error", "Error", errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSubmitting(true);
    try {
      await processTypesService.delete(deletingItem.id);
      showToast("success", "Éxito", "Tipo de proceso eliminado correctamente");
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
    <ERPLayout title="Tipos de Proceso" subtitle="Catálogo de tipos de proceso">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tipos de Proceso</h1>
            <p className="text-muted-foreground">
              Catalogo de tipos de proceso para producción
            </p>
          </div>
          <Button onClick={openNewModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Tipo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tipos</p>
                  <p className="text-2xl font-bold text-foreground">{types.length}</p>
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
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">ID</TableHead>
                    <TableHead className="text-muted-foreground">Nombre</TableHead>
                    <TableHead className="text-muted-foreground">Descripcion</TableHead>
                    <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell className="font-mono text-sm text-primary">{item.id}</TableCell>
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[250px] truncate">{item.description || '-'}</TableCell>
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
                {editingItem ? "Editar Tipo de Proceso" : "Nuevo Tipo de Proceso"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Nombre *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          className="bg-secondary border-border" 
                          placeholder="Ej: Corrugado, Impresión, Troquelado"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          className="bg-secondary border-border" 
                          rows={3}
                          placeholder="Descripción del tipo de proceso..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!deletingItem}
          onOpenChange={(open) => !open && setDeletingItem(null)}
          title="Eliminar Tipo de Proceso"
          description={`¿Está seguro de eliminar el tipo de proceso "${deletingItem?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          onConfirm={handleDelete}
          variant="destructive"
        />
      </div>
    </ERPLayout>
  );
}
