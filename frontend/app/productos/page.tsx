
"use client";

import { useState, useEffect, useRef } from "react";
import { ERPLayout } from "@/components/erp/erp-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { productsService } from "@/lib/services";

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
}
import { useToast } from "@/components/erp/action-toast"; 
import { ConfirmDialog } from "@/components/erp/confirm-dialog";
import { ProductStatsCards } from "./components/ProductStatsCards";
import { ProductTable } from "./components/ProductTable";
import { ProductFormDialog } from "./components/ProductFormDialog";
import { ProductViewDialog } from "./components/ProductViewDialog";
import { ProductConfigDialog } from "./components/ProductConfigDialog";
import type { Product, CreateProductDto } from "@/lib/types";

export default function ProductosPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Refs para controlar llamadas
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Función para obtener estadísticas
  const fetchStats = async () => {
    try {
      const statsData = await productsService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  // Función para obtener productos con paginación
  const fetchProducts = async (searchValue: string, page: number = 1) => {    
    setLoading(true);
    
    try {
      const params: any = { page };
      if (searchValue && searchValue.trim()) {
        params.search = searchValue.trim();
      }
      
      const response = await productsService.getAll(params);
      
      const data = Array.isArray(response?.data) ? response.data : [];
      setProducts(data);
      setCurrentPage(response?.currentPage || 1);
      setLastPage(response?.lastPage || 1);
      setTotalProducts(response?.total || 0);
    } catch (error: any) {
      showToast("error", "Error al cargar productos", error?.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial - solo una vez
  useEffect(() => {
    fetchProducts("");
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    // Skip en el montaje inicial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset a página 1 al buscar
      fetchProducts(search, 1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Cambio de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchProducts(search, newPage);
    }
  };

  const handleSubmit = async (data: CreateProductDto) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await productsService.update(Number(editingProduct.id), data);
        showToast("success", "Producto actualizado", "");
      } else {
        await productsService.create(data);
        showToast("success", "Producto creado", "");
      }
      setModalOpen(false);
      setEditingProduct(null);
      fetchProducts(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setSubmitting(true);
    try {
      await productsService.delete(Number(deletingProduct.id));
      showToast("success", "Producto eliminado", "");
      setDeletingProduct(null);
      fetchProducts(search, currentPage);
      fetchStats();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido";
      showToast("error", "Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN' 
    }).format(value);
  };

  return (
    <ProtectedRoute>
      <ERPLayout title="Productos" subtitle="Catálogo de productos terminados">
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Productos</h1>
              <p className="text-muted-foreground">Catálogo de productos terminados</p>
            </div>
            <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>

          <ProductStatsCards
            total={stats.total}
            active={stats.active}
          />

          <ProductTable
            products={products}
            search={search}
            onSearchChange={setSearch}
            onView={setViewingProduct}
            onEdit={openEditModal}
            onDelete={setDeletingProduct}
            onConfigure={setConfiguringProduct}
            formatCurrency={formatCurrency}
            loading={loading}
          />

          {/* Paginación */}
          {totalProducts > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {products.length} de {totalProducts} productos
              </p>
              {lastPage > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-3">
                    Página {currentPage} de {lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage || loading}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <ProductFormDialog
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) setEditingProduct(null); }}
          editingProduct={editingProduct}
          onSubmit={handleSubmit}
          loading={submitting}
        />

        <ProductViewDialog
          product={viewingProduct}
          open={!!viewingProduct}
          onOpenChange={() => setViewingProduct(null)}
          formatCurrency={formatCurrency}
        />

        <ProductConfigDialog
          product={configuringProduct}
          open={!!configuringProduct}
          onOpenChange={() => setConfiguringProduct(null)}
        />

        <ConfirmDialog
          open={!!deletingProduct}
          onOpenChange={() => setDeletingProduct(null)}
          title="Eliminar Producto"
          description={`¿Estás seguro de eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </ERPLayout>
    </ProtectedRoute>
  );
}
