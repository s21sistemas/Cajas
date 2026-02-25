import { Package } from 'lucide-react';

export function EmptyProductionList() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Package className="h-12 w-12 mb-4 opacity-50" />
      <p>No se encontraron órdenes de producción</p>
    </div>
  );
}
