"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productsService } from "@/lib/services";
import { materialsService } from "@/lib/services";
import { processesService } from "@/lib/services/processes.service";
import { useToast } from "@/components/erp/action-toast";
import type { Product, Material, Process } from "@/lib/types";
import { Search, GripVertical } from "lucide-react";

interface ProductConfigDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductConfigDialog({ product, open, onOpenChange }: ProductConfigDialogProps) {
  const { showToast } = useToast();
  
  // Materiales del producto
  const [materials, setMaterials] = useState<any[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [materialSearch, setMaterialSearch] = useState("");
  
  // Procesos del producto
  const [processes, setProcesses] = useState<any[]>([]);
  const [availableProcesses, setAvailableProcesses] = useState<Process[]>([]);
  const [processSearch, setProcessSearch] = useState("");

  // Estados de carga
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [addingProcess, setAddingProcess] = useState(false);
  
  // Estado para agregar material
  const [newMaterialId, setNewMaterialId] = useState<string>("");
  const [newMaterialQuantity, setNewMaterialQuantity] = useState<string>("1");
  
  // Estado para agregar proceso - usar proceso existente
  const [newProcessId, setNewProcessId] = useState<string>("");
  const [newProcessSequence, setNewProcessSequence] = useState<string>("1");

  // Filtrar materiales por búsqueda
  const filteredMaterials = availableMaterials.filter(m => 
    m.name.toLowerCase().includes(materialSearch.toLowerCase()) ||
    (m.code && m.code.toLowerCase().includes(materialSearch.toLowerCase()))
  );

  // Filtrar procesos por búsqueda
  const filteredProcesses = availableProcesses.filter(p => 
    p.name.toLowerCase().includes(processSearch.toLowerCase())
  );

  // Cargar detalles del producto
  useEffect(() => {
    if (product && open) {
      setLoadingDetails(true);
      Promise.all([
        productsService.getParts(product.id),
        productsService.getProcesses(product.id),
        materialsService.selectList(),
        processesService.selectList(),
      ]).then((results) => {
        const materialsRes = results[0] as any;
        const processesRes = results[1] as any;
        const materialsListRes = results[2] as any;
        const processesListRes = results[3] as any;
        
        // Ordenar procesos por secuencia
        const processesData = Array.isArray(processesRes) 
          ? processesRes 
          : (processesRes?.data || []);
        const sortedProcesses = [...processesData].sort((a, b) => a.sequence - b.sequence);
        
        const materialsData = Array.isArray(materialsRes) ? materialsRes : (materialsRes?.data || []);
        
        setMaterials(materialsData);
        setProcesses(sortedProcesses);
        
        let materialsList: Material[] = [];
        if (Array.isArray(materialsListRes)) {
          materialsList = materialsListRes;
        } else if (materialsListRes?.data && Array.isArray(materialsListRes.data)) {
          materialsList = materialsListRes.data;
        } else if (materialsListRes?.data?.data && Array.isArray(materialsListRes.data.data)) {
          materialsList = materialsListRes.data.data;
        }
        setAvailableMaterials(materialsList);

        let processesList: Process[] = [];
        if (Array.isArray(processesListRes)) {
          processesList = processesListRes;
        } else if (processesListRes?.data && Array.isArray(processesListRes.data)) {
          processesList = processesListRes.data;
        } else if (processesListRes?.data?.data && Array.isArray(processesListRes.data.data)) {
          processesList = processesListRes.data.data;
        }
        setAvailableProcesses(processesList);
        
        setNewMaterialId("");
        setNewMaterialQuantity("1");
        setMaterialSearch("");
        setNewProcessId("");
        setNewProcessSequence(String(sortedProcesses.length + 1));
        setProcessSearch("");
      }).catch(() => {
        showToast("error", "Error", "No se pudieron cargar los detalles del producto");
      }).finally(() => {
        setLoadingDetails(false);
      });
    }
  }, [product, open]);

  // Agregar material
  const handleAddMaterial = async () => {
    if (!product || !newMaterialId || !newMaterialQuantity) return;
    
    setAddingMaterial(true);
    try {
      await productsService.addPart(product.id, Number(newMaterialId), Number(newMaterialQuantity));
      // Refresh materials list
      const materialsRes: any = await productsService.getParts(product.id);
      const materialsData = Array.isArray(materialsRes) ? materialsRes : (materialsRes?.data || []);
      setMaterials(materialsData);
      setNewMaterialId("");
      setNewMaterialQuantity("1");
      setMaterialSearch("");
      showToast("success", "Material agregado", "El material se ha agregado correctamente");
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo agregar el material");
    } finally {
      setAddingMaterial(false);
    }
  };

  // Eliminar material
  const handleRemoveMaterial = async (materialId: number) => {
    if (!product) return;
    
    try {
      await productsService.removePart(product.id, materialId);
      // Refresh materials list
      const materialsRes: any = await productsService.getParts(product.id);
      const materialsData = Array.isArray(materialsRes) ? materialsRes : (materialsRes?.data || []);
      setMaterials(materialsData);
      showToast("success", "Material eliminado", "El material se ha eliminado correctamente");
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo eliminar el material");
    }
  };

  // Agregar proceso desde lista existente
  const handleAddProcess = async () => {
    if (!product || !newProcessId) return;
    
    // Encontrar el proceso seleccionado
    const selectedProcess = availableProcesses.find(p => p.id === Number(newProcessId));
    if (!selectedProcess) return;
    
    setAddingProcess(true);
    try {
      const newProcess = await productsService.addProcess(product.id, {
        name: selectedProcess.name,
        process_id: Number(newProcessId),
        sequence: Number(newProcessSequence),
        estimated_time_min: selectedProcess.estimatedTimeMin || undefined,
      });
      
      // Refresh processes list
      const processesRes: any = await productsService.getProcesses(product.id);
      const processesData = Array.isArray(processesRes) ? processesRes : (processesRes?.data || []);
      const sortedProcesses = [...processesData].sort((a, b) => a.sequence - b.sequence);
      setProcesses(sortedProcesses);
      
      setNewProcessId("");
      setNewProcessSequence(String(sortedProcesses.length + 1));
      setProcessSearch("");
      showToast("success", "Proceso agregado", "El proceso se ha agregado correctamente");
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo agregar el proceso");
    } finally {
      setAddingProcess(false);
    }
  };

  // Eliminar proceso
  const handleRemoveProcess = async (procId: number) => {
    if (!product) return;
    
    try {
      await productsService.removeProcess(product.id, procId);
      // Refresh and reorder
      const processesRes: any = await productsService.getProcesses(product.id);
      const processesData = Array.isArray(processesRes) ? processesRes : (processesRes?.data || []);
      const sortedProcesses = [...processesData].sort((a, b) => a.sequence - b.sequence);
      setProcesses(sortedProcesses);
      showToast("success", "Proceso eliminado", "El proceso se ha eliminado correctamente");
    } catch (error: any) {
      showToast("error", "Error", error?.message || "No se pudo eliminar el proceso");
    }
  };

  // Reordenar procesos (mover arriba)
  const handleMoveProcessUp = async (index: number) => {
    if (index === 0 || !product) return;
    
    const newProcesses = [...processes];
    const temp = newProcesses[index].sequence;
    newProcesses[index].sequence = newProcesses[index - 1].sequence;
    newProcesses[index - 1].sequence = temp;
    
    // Reordenar array
    newProcesses.sort((a, b) => a.sequence - b.sequence);
    setProcesses(newProcesses);
    
    // Aquí podrías llamar al backend para actualizar las secuencias
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar: {product.name}</DialogTitle>
          <DialogDescription>
            Agregue materiales (lista de materiales) y procesos de elaboración para este producto.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="materials">Materiales ({materials.length})</TabsTrigger>
            <TabsTrigger value="processes">Procesos ({processes.length})</TabsTrigger>
          </TabsList>
          
          {/* Tab de Materiales */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Material</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar material..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="pl-8 mb-2"
                  />
                </div>
                <Select value={newMaterialId} onValueChange={setNewMaterialId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredMaterials.map(material => (
                      <SelectItem key={material.id} value={String(material.id)}>
                        {material.name} ({material.code || 'sin código'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label>Cantidad</Label>
                <Input 
                  type="number" 
                  value={newMaterialQuantity} 
                  onChange={(e) => setNewMaterialQuantity(e.target.value)}
                  min="0.001"
                  step="0.001"
                />
              </div>
              <Button 
                onClick={handleAddMaterial}
                disabled={!newMaterialId || !newMaterialQuantity || addingMaterial}
              >
                {addingMaterial ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetails ? (
                    <TableRow key="loading-materials">
                      <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                    </TableRow>
                  ) : materials.length === 0 ? (
                    <TableRow key="empty-materials">
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay materiales configurados
                      </TableCell>
                    </TableRow>
                  ) : (
                    materials.map(material => (
                      <TableRow key={material.id}>
                        <TableCell>{material.part?.code || material.materialId || '-'}</TableCell>
                        <TableCell>{material.part?.name || material.material?.name || '-'}</TableCell>
                        <TableCell>{material.part?.description || material.material?.description || '-'}</TableCell>
                        <TableCell className="text-right">{material.quantity}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveMaterial(material.partId || material.materialId)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Tab de Procesos */}
          <TabsContent value="processes" className="space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Proceso</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar proceso..."
                    value={processSearch}
                    onChange={(e) => setProcessSearch(e.target.value)}
                    className="pl-8 mb-2"
                  />
                </div>
                <Select value={newProcessId} onValueChange={setNewProcessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proceso" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {filteredProcesses.map(proc => (
                      <SelectItem key={proc.id} value={String(proc.id)}>
                        {proc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20">
                <Label>Secuencia</Label>
                <Input 
                  type="number" 
                  value={newProcessSequence} 
                  onChange={(e) => setNewProcessSequence(e.target.value)}
                  min="1"
                />
              </div>
              <Button 
                onClick={handleAddProcess}
                disabled={!newProcessId || addingProcess}
              >
                {addingProcess ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Orden</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Tiempo (min)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingDetails ? (
                    <TableRow key="loading">
                      <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                    </TableRow>
                  ) : processes.length === 0 ? (
                    <TableRow key="empty">
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay procesos configurados
                      </TableCell>
                    </TableRow>
                  ) : (
                    processes.map((proc, index) => (
                      <TableRow key={proc.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <span className="font-medium">{proc.sequence}</span>
                          </div>
                        </TableCell>
                        <TableCell>{proc.name}</TableCell>
                        <TableCell className="capitalize">{proc.processType || '-'}</TableCell>
                        <TableCell className="text-right">{proc.estimatedTimeMin || '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveProcess(proc.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
