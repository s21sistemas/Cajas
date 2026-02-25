## System context: Frontend (Next.js) - Manufacturing ERP UI (cajas de cartón) + CRM + ERP

Este folder (`frontend/`) es la **interfaz web** del sistema. Está construida con **Next.js (App Router)** y está **preparada para consumir APIs del backend Laravel**.

### Stack Tecnológico

- **Framework**: Next.js 16 (App Router), React 19
- **UI/Estilos**: TailwindCSS, componentes Radix (`@radix-ui/*`), utilidades `clsx` + `tailwind-merge`
- **HTTP Client**: Axios con interceptores personalizados
- **Form/validación**: `react-hook-form`, `zod`
- **Gráficas/KPIs**: `recharts`
- **Notificaciones UI**: `sonner` y toasts internos
- **Iconos**: `lucide-react`

---

## Arquitectura del Frontend

### Estructura de Directorios

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   │   └── login/         # Página de login
│   ├── productos/         # Catálogo de productos
│   ├── maquinas/         # Máquinas
│   ├── procesos/         # Procesos
│   ├── ordenes-trabajo/  # Órdenes de trabajo
│   ├── clientes/         # Clientes CRM
│   ├── proveedores/       # Proveedores
│   ├── recursos-humanos/ # Empleados
│   ├── ordenes-compra/   # Órdenes de compra
│   ├── servicios/        # Órdenes de servicio
│   ├── finanzas/          # Finanzas
│   ├── mantenimiento/     # Mantenimiento
│   └── ...
├── components/
│   ├── ui/              # Componentes base shadcn/ui
│   ├── erp/             # Componentes ERP (Layout, Sidebar, Header)
│   └── auth/            # Componentes de autenticación
├── contexts/            # React Contexts (Auth)
├── hooks/               # Hooks personalizados
├── lib/
│   ├── api.ts           # Cliente API centralizado
│   ├── services/        # Servicios API
│   └── types/           # Tipos TypeScript
```

---

## Cliente API (`lib/api.ts`)

El cliente API está completamente implementado y maneja:

### Características del Cliente API

1. **Transformación Automática de Datos**
   - Request: `camelCase` → `snake_case`
   - Response: `snake_case` → `camelCase`

2. **Autenticación**
   - Token Bearer almacenado en localStorage
   - Header de autorización agregado automáticamente

3. **Manejo de Errores**
   - Errores con formato: `{ message, errors, status }`
   - Errores de red y servidor manejados

### Configuración

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,  // http://localhost:8000/api
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});
```

### Tipos del Cliente API

```typescript
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}
```

---

## Servicios API (`lib/services/`)

### Servicios Disponibles

| Servicio | Archivo | Descripción |
|----------|---------|-------------|
| `productsService` | `products.service.ts` | CRUD productos + stats + low-stock |
| `machinesService` | `machines.service.ts` | CRUD máquinas |
| `processesService` | `processes.service.ts` | CRUD procesos |
| `operatorsService` | `operators.service.ts` | CRUD operadores |
| `clientsService` | `clients.service.ts` | CRM completo (clientes, sucursales, cotizaciones, ventas) |
| `suppliersService` | `suppliers.service.ts` | CRUD proveedores + stats |
| `employeesService` | `employees.service.ts` | CRUD empleados + stats + departments |
| `hrService` | `hr.service.ts` | Recursos humanos |
| `workOrdersService` | `work-orders.service.ts` | CRUD órdenes de trabajo + stats |
| `purchaseOrdersService` | `purchase-orders.service.ts` | CRUD órdenes de compra + stats |
| `serviceOrdersService` | `service-orders.service.ts` | CRUD órdenes de servicio |
| `maintenanceService` | `maintenance.service.ts` | CRUD mantenimiento |
| `inventoryService` | `inventory.service.ts` | Inventario y almacén |
| `financeService` | `finance.service.ts` | Finanzas y bancos |

### Ejemplo de Uso

```typescript
import { productsService } from '@/lib/services';

// Obtener productos paginados
const response = await productsService.getAll({
  page: 1,
  perPage: 15,
  search: 'caja',
  status: 'active'
});

// Crear producto
const product = await productsService.create({
  code: 'CAJ-001',
  name: 'Caja corrugada 20x20',
  price: 15.50,
  stock: 100
});

// Obtener estadísticas
const stats = await productsService.getStats();
// Retorna: { total: 50, active: 45, inactive: 5, lowStock: 3 }
```

---

## Tipos TypeScript (`lib/types/`)

### Tipos de Datos

| Tipo | Descripción |
|------|-------------|
| `Product` | Producto con código, nombre, precio, stock, estado |
| `Client` | Cliente con datos fiscales, límite de crédito, saldo |
| `Supplier` | Proveedor con RFC, rating, balance |
| `Employee` | Empleado con puesto, departamento, salario |
| `WorkOrder` | Orden de trabajo con progreso, prioridad |
| `PurchaseOrder` | Orden de compra con totales, estado |
| `ServiceOrder` | Orden de servicio con tipo, prioridad |
| `Machine` | Máquina con tipo, ejes, estado |

### Interfaces de Paginación

```typescript
interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

interface Product extends BaseEntity {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number | null;
  cost: number | null;
  unit: string | null;
  stock: number;
  minStock: number;
  status: ProductStatus;
}
```

---

## Arquitectura UI

### Layout Principal

- **`components/erp/erp-layout.tsx`**: Compone Sidebar + Header + Main
- **`components/erp/sidebar.tsx`**: Navegación por módulos
- **`components/erp/header.tsx`**: Usuario, logout, notificaciones

### Patrón de Componentes de Página

```typescript
// page.tsx típico
export default function ProductsPage() {
  // 1. Estado para filtros
  const [filters, setFilters] = useState<ProductFilters>({});

  // 2. Query para datos
  const { data, loading, refetch } = useApiQuery(
    () => productsService.getAll(filters),
    { enabled: true }
  );

  // 3. Mutation para crear/editar/eliminar
  const { mutate: createProduct } = useApiMutation(
    (data) => productsService.create(data),
    {
      onSuccess: () => {
        showToast('success', 'Éxito', 'Producto creado');
        refetch();
      },
      onError: (err) => {
        showToast('error', 'Error', err.message);
      }
    }
  );

  // 4. Render de UI con Table, Cards, Filters...
}
```

---

## Módulos y Rutas

### Producción (cajas de cartón)

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/productos` | Catálogo de productos | `productsService` |
| `/maquinas` | Catálogo de máquinas | `machinesService` |
| `/procesos` | Gestión de procesos | `processesService` |
| `/ordenes-trabajo` | Órdenes de producción | `workOrdersService` |

### Inventario / Almacén

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/almacen/materia-prima` | Materias primas | `inventoryService` |
| `/almacen/producto-terminado` | Producto terminado | `productsService` |
| `/almacen/movimientos` | Movimientos de inventario | `inventoryService` |

### Comercial (CRM)

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/clientes` | Catálogo de clientes | `clientsService` |
| `/servicios/cotizaciones` | Cotizaciones | `clientsService` |
| `/servicios/ordenes` | Órdenes de servicio | `serviceOrdersService` |
| `/servicios/ventas` | Ventas | `clientsService` |

### Compras

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/proveedores` | Catálogo de proveedores | `suppliersService` |
| `/ordenes-compra` | Órdenes de compra | `purchaseOrdersService` |

### Recursos Humanos

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/recursos-humanos` | Empleados | `employeesService` |
| `/recursos-humanos/ausencias` | Control de ausencias | `hrService` |
| `/recursos-humanos/vacaciones` | Solicitudes de vacaciones | `hrService` |

### Finanzas

| Ruta | Descripción | Servicio |
|------|-------------|----------|
| `/finanzas/bancos` | Cuentas bancarias | `financeService` |
| `/finanzas/movimientos` | Movimientos | `financeService` |

---

## Convenciones de Datos

### Transformación Automática

El cliente API transforma automáticamente:

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| `startDate` | `start_date` |
| `creditLimit` | `credit_limit` |
| `minStock` | `min_stock` |
| `totalPayroll` | `total_payroll` |
| `lowStockCount` | `low_stock_count` |

### Estados (Enums)

```typescript
// Producto
ProductStatus: 'diseño' | 'en_producción' | 'completado' | 'descontinuado'

// Cliente
ClientStatus: 'active' | 'inactive' | 'blocked'

// Orden de trabajo
WorkOrderStatus: 'draft' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
Priority: 'low' | 'medium' | 'high' | 'urgent'
```

---

## Autenticación

### Context de Auth

```typescript
// contexts/auth.context.tsx
const {
  user,           // Usuario actual
  loading,        // Estado de carga
  login,          // Función de login
  logout,         // Función de logout
  isAuthenticated,// Boolean
  hasPermission,  // Verificar permisos
} = useAuth();
```

### Login

```typescript
await authApi.login({ email, password });
// Guarda token en localStorage
// Redirecciona al dashboard
```

### Permisos

Los permisos se verifican con Spatie Permission:

```typescript
hasPermission('products.create') // ¿Puede crear productos?
hasPermission('clients.edit')    // ¿Puede editar clientes?
```

---

## Integración con Backend

### URLs del Backend

- **Desarrollo**: `http://localhost:8000/api`
- **Producción**: `https://api.example.com/api`

### Endpoints Esperados

Cada recurso debe exponer:

```
GET    /{recurso}           # Listar (paginado)
POST   /{recurso}          # Crear
GET    /{recurso}/{id}     # Ver detalle
PUT    /{recurso}/{id}     # Actualizar
DELETE /{recurso}/{id}     # Eliminar
GET    /{recurso}/stats     # Estadísticas (opcional)
```

### Formato de Respuesta Paginada

```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 5,
  "per_page": 15,
  "total": 75,
  "from": 1,
  "to": 15
}
```

---

## Cómo Usar Este Contexto

### Para Trabajar en Frontend

1. **Nueva funcionalidad**:
   - Usar servicios existentes en `lib/services/`
   - Definir tipos en `lib/types/`
   - Usar hooks `useApiQuery` y `useApiMutation`
   - Usar `showToast` para notificaciones

2. **Nuevo módulo**:
   - Crear servicio en `lib/services/{modulo}.service.ts`
   - Crear tipos en `lib/types/{modulo}.types.ts`
   - Exportar en `lib/services/index.ts`

3. **Backend cambiado**:
   - El frontend espera snake_case del backend
   - El cliente API transforma automáticamente
   - Solo ajustar tipos si el backend cambia estructura

### Para Integrar con Backend

1. Verificar que backend expone endpoints REST
2. Verificar que endpoints usan paginación correcta
3. Verificar que endpoints de stats retornan snake_case
4. Probar autenticación con Sanctum
5. Verificar permisos en cada endpoint

---

## Variables de Entorno

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_API_TIMEOUT=30000
```

---

## Dependencias Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| next | 16.0.10 | Framework |
| react | 19.2.0 | UI |
| axios | ^1.13.5 | HTTP Client |
| react-hook-form | ^7.60.0 | Forms |
| zod | 3.25.76 | Validación |
| recharts | 2.15.4 | Gráficas |
| lucide-react | ^0.454.0 | Iconos |
| sonner | ^1.7.4 | Notificaciones |
