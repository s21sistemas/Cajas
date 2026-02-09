## Documentación de API

Este archivo resume los recursos expuestos en `routes/api.php`, sin ejemplos extensos, pero con:
- URL base.
- Recursos disponibles.
- Campos principales (requeridos y opcionales).
- Permisos asociados (Spatie Permissions).

La **fuente de verdad** para los detalles finos de validación son los controladores en `app/Http/Controllers` y las migraciones en `database/migrations`.

---

## Base URL y autenticación

- **Base URL**: `/api`
- Autenticación: **Bearer Token** generado por Laravel Sanctum.
  - Encabezado: `Authorization: Bearer {token}`

### Rutas públicas

- **POST `/register`**: crea usuario (campos: `name`, `email`, `password`).
- **POST `/login`**: devuelve `user` y `token` (campos: `email`, `password`).

### Rutas bajo `auth:sanctum`

Todas las rutas siguientes requieren un token válido:

- **POST `/logout`**
- **GET `/user`**
- **GET `/permissions`** (lista permisos disponibles para el frontend).

---

## Núcleo de seguridad y configuración

### Usuarios, roles y permisos

- **`/users`** (`UserController`, permisos `users.*`)
- **`/roles`** (`RoleController`, permisos `roles.*`)
- **`/permissions`** (solo `index`, permiso `permissions.view` si se aplica en el controlador)

### Configuración

- **`/settings`** (`SettingController`, permisos `settings.*`):
  - Almacena pares `module`, `key`, `value` (JSON) para configuración de empresa, producción, HR, etc.

---

## Manufactura CNC y producción

### Productos, partes y procesos

- **`/products`** (`ProductController`, permisos `products.*`):
  - Campos principales: `code` (único), `name`, `description` (opcional), `status` (`diseño|en_producción|completado`).
- **`/parts`** (`PartController`, permisos `parts.*`):
  - Campos: `code` (único), `name`, `description`, `material`, `drawing_url` (opcional), `status` (`design|ready_for_production|in_production|completed`).
- **`/processes`** (`ProcessController`, permisos `processes.*`):
  - Relaciona una parte con una máquina y la secuencia del proceso.
  - Campos: `part_id`, `machine_id`, `process_type`, `description` (opcional), `sequence`, `estimated_time_min`, `status`.

### Máquinas y operadores

- **`/machines`** (`MachineController`, permisos `machines.*`):
  - Campos: `code` (único), `name`, `type`, `axes`, `status`, `notes` (opcional).
- **`/operators`** (`OperatorController`, permisos `operators.*`):
  - Campos: `employee_code` (único), `name`, `shift` (opcional), `specialty` (opcional), `active` (booleano).

### Programas CNC y producción real

- **`/cnc-programs`** (`CncProgramController`, permisos `cncprograms.*`):
  - Campos: `process_id`, `name`, `gcode_path`, `version`, `active`, `notes`.
- **`/productions`** (`ProductionController`, permisos `productions.*`):
  - Registra ejecuciones reales de procesos: `process_id`, `machine_id`, `operator_id`, `start_time`, `end_time`, `good_parts`, `scrap_parts`, `notes`.

### Planeación y mantenimiento

- **`/work-orders`** (`WorkOrderController`, permisos `workorders.*`):
  - Campos: `product_name`, `client_name`, `quantity`, `completed`, `status`, `priority`, `machine`, `operator`, `start_date`, `due_date`, `progress`, `estimated_time`, `actual_time`, `cancellation_reason`.
- **`/maintenance-orders`** (`MaintenanceOrderController`, permisos `maintenanceorders.*`):
  - Campos: `code`, `machine_id`, `type`, `priority`, `status`, `description`, `scheduled_date`, `start_date`, `end_date`, `technician`, `estimated_hours`, `actual_hours`, `estimated_cost`, `actual_cost`, `notes`.

---

## CRM (clientes, sucursales, servicios, cotizaciones y ventas)

### Clientes y sucursales

- **`/clients`** (`ClientController`, permisos `clients.*`):
  - Campos: `code` (único), `name`, `rfc` (opcional), `email` (opcional), `phone` (opcional), `address`, `city`, `state`, `credit_limit`, `balance`, `status` (`active|inactive|blocked`).
- **`/branches`** (`BranchController`, permisos `branches.*`):
  - Campos: `code` (único), `name`, `client_id`, `address`, `city`, `state`, `phone` (opcional), `contact` (opcional), `status` (`active|inactive`).

### Órdenes de servicio

- **`/service-orders`** (`ServiceOrderController`, permisos `serviceorders.*`):
  - Campos: `code` (único), `client_id`, `title`, `description`, `type` (`repair|maintenance|installation|consultation`), `priority`, `status`, `assigned_to`, `estimated_hours`, `actual_hours`, `scheduled_date`, `completed_date`, `cost`.

### Cotizaciones y ventas

- **`/quotes`** (`QuoteController`, permisos `quotes.*`):
  - Campos: `code` (único), `client_id`, `title`, `items`, `subtotal`, `tax`, `total`, `status` (`draft|sent|approved|rejected|expired`), `valid_until`, `created_by`.
- **`/sales`** (`SaleController`, permisos `sales.*`):
  - Campos: `invoice` (único), `client_id`, `quote_ref` (opcional), `items`, `subtotal`, `tax`, `total`, `paid`, `status` (`pending|partial|paid|overdue|cancelled`), `payment_method`, `due_date`.

### Códigos QR

- **`/qr-items`** (`QRItemController`, permisos `qritems.*`):
  - Campos: `type` (texto que indica qué representa el QR), `code` (único), `name`, `generated` (fecha/hora de generación).

---

## Proveedores, compras, inventario y almacén

### Proveedores y estados de cuenta

- **`/suppliers`** (`SupplierController`, permisos `suppliers.*`):
  - Campos: `code` (único), `name`, `rfc` (único), `email`, `phone`, `address`, `city`, `contact`, `category`, `lead_time`, `rating`, `balance`, `status` (`active|inactive|pending`).
- **`/supplier-statements`** (`SupplierStatementController`, permisos `supplierstatements.*`):
  - Campos: `supplier_id`, `invoice_number`, `date`, `due_date`, `amount`, `paid`, `balance`, `status` (`paid|pending|overdue|partial`), `concept`.

### Ordenes de compra

- **`/purchase-orders`** (`PurchaseOrderController`, permisos `purchaseorders.*`):
  - Campos: `code` (único), `supplier_id`, `items`, `total`, `status` (`draft|pending|approved|ordered|partial|received|cancelled`), `priority`, `requested_by`, `approved_by`, `expected_date`.

### Inventario y almacén

- **`/inventory-items`** (`InventoryItemController`, permisos `inventoryitems.*`):
  - Campos: `code` (único), `name`, `category` (`raw_material|component|tool|consumable`), `quantity`, `min_stock`, `max_stock`, `unit_cost`, `location`, `last_movement`.
- **`/warehouse-locations`** (`WarehouseLocationController`, permisos `warehouselocations.*`):
  - Campos: `name`, `zone`, `type` (rack, shelf, área lógica, etc.), `capacity`, `occupancy`.

---

## Finanzas y bancos

### Cuentas y transacciones bancarias

- **`/bank-accounts`** (`BankAccountController`, permisos `bankaccounts.*`):
  - Campos: `bank`, `name`, `description`, `account_number`, `clabe`, `type` (`checking|savings|credit`), `currency` (`MXN|USD`), `balance`, `available_balance`, `status` (`active|inactive|blocked`), `last_movement`.
- **`/bank-transactions`** (`BankTransactionController`, permisos `banktransactions.*`):
  - Campos: `date`, `reference`, `description`, `type` (`income|expense|transfer`), `amount`, `balance`, `bank`, `category`.

### Movimientos generales y estados de cuenta

- **`/movements`** (`MovementController`, permisos `movements.*`):
  - Campos: `date`, `type` (`income|expense|transfer`), `category`, `description`, `reference`, `bank_account_id`, `amount`, `balance`, `status` (`completed|pending|cancelled`).
- **`/account-statements`** (`AccountStatementController`, permisos `accountstatements.*`):
  - Campos: `client_id`, `invoice_number`, `date`, `due_date`, `amount`, `paid`, `balance`, `status` (`paid|pending|overdue|partial`), `concept`.

---

## Recursos Humanos y nómina básica

### Empleados

- **`/employees`** (`EmployeeController`, permisos `employees.*`):
  - Campos: `code` (único), `name`, `position`, `department`, `email` (único), `phone`, `salary`, `hire_date`, `status` (`active|inactive|vacation`), `avatar`.

### Registro de incidencias y beneficios

Todos los siguientes recursos se relacionan con `employees` a través de `employee_id`:

- **`/absences`** (`AbsenceController`, permisos `absences.*`):
  - Campos: `employee_id`, `date`, `type` (`justified|unjustified|late`), `reason`, `status` (`registered|justified|discounted`), `deduction`.
- **`/overtimes`** (`OvertimeController`, permisos `overtimes.*`):
  - Campos: `employee_id`, `date`, `hours`, `type` (`simple|double|triple`), `rate`, `amount`, `status` (`pending|approved|paid`), `reason`.
- **`/guard-payments`** (`GuardPaymentController`, permisos `guardpayments.*`):
  - Campos: `employee_id`, `date`, `shift` (`day|night|weekend|holiday`), `hours`, `rate`, `amount`, `status`, `notes`.
- **`/discounts`** (`DiscountController`, permisos `discounts.*`):
  - Campos: `employee_id`, `type` (`loan|infonavit|fonacot|alimony|other`), `description`, `amount`, `period`, `status` (`active|completed|paused`), `start_date`, `end_date`.
- **`/disabilities`** (`DisabilityController`, permisos `disabilities.*`):
  - Campos: `employee_id`, `type` (`imss|accident|maternity|illness`), `start_date`, `end_date`, `days`, `folio`, `status`, `description`.
- **`/vacation-requests`** (`VacationRequestController`, permisos `vacationrequests.*`):
  - Campos: `employee_id`, `start_date`, `end_date`, `days`, `days_available`, `type` (`vacation|personal|medical`), `status` (`pending|approved|rejected|taken`), `reason`, `approved_by`.

### Catálogos de descuentos y préstamos

- **`/discount-types`** (`DiscountTypeController`, permisos `discounttypes.*`):
  - Campos: `code` (único), `name`, `description`, `category` (`legal|voluntary|company`), `status` (`active|inactive`).
- **`/loan-types`** (`LoanTypeController`, permisos `loantypes.*`):
  - Campos: `code` (único), `name`, `description`, `max_amount`, `max_term_months`, `interest_rate`, `requirements`, `status` (`active|inactive`).

### Cuentas de empleados

- **`/employee-accounts`** (`EmployeeAccountController`, permisos `employeeaccounts.*`):
  - Actualmente solo maneja `id` y timestamps, pensado para futuras extensiones como resumen de saldo por empleado.

---

## Convenciones generales

- Todos los recursos siguen el patrón REST de `Route::apiResource`:
  - `GET /recurso` → listar (permiso `{recurso}.view`)
  - `GET /recurso/{id}` → ver detalle (permiso `{recurso}.view`)
  - `POST /recurso` → crear (permiso `{recurso}.create`)
  - `PUT/PATCH /recurso/{id}` → actualizar (permiso `{recurso}.edit`)
  - `DELETE /recurso/{id}` → eliminar (permiso `{recurso}.delete`)
- Las reglas exactas de validación (required, formatos, rangos) se encuentran en cada controlador en `app/Http/Controllers`.
- Los tipos de datos y restricciones de base de datos se encuentran en las migraciones de `database/migrations`.

---

## 👥 Clientes y Sucursales (CRM)

### Clientes

- **GET /clients**: lista clientes (permiso `clients.view`).
- **POST /clients**: crea un cliente (permiso `clients.create`).
  - Campos clave: `code` (único), `name`, `rfc` (opcional), `email` (opcional), `phone` (opcional), `address`, `city`, `state`, `credit_limit` (opcional, por defecto 0), `balance` (opcional, por defecto 0), `status` (`active|inactive|blocked`, por defecto `active`).
- **PUT/PATCH /clients/{id}**: actualiza datos de cliente (permiso `clients.edit`).
- **DELETE /clients/{id}**: elimina un cliente (permiso `clients.delete`).

### Sucursales (Branches)

- **GET /branches**: lista sucursales con su cliente (permiso `branches.view`).
- **POST /branches**: crea sucursal para un cliente (permiso `branches.create`).
  - Campos clave: `code` (único), `name`, `client_id` (debe existir), `address`, `city`, `state`, `phone` (opcional), `contact` (opcional), `status` (`active|inactive`).

---

## 🧾 Cotizaciones y Ventas

### Cotizaciones (Quotes)

- **GET /quotes**: lista cotizaciones (permiso `quotes.view`).
- **POST /quotes**: crea una cotización (permiso `quotes.create`).
  - Campos: `code` (único), `client_id`, `title`, `items` (opcional), `subtotal` (opcional), `tax` (opcional), `total` (opcional), `status` (`draft|sent|approved|rejected|expired`, por defecto `draft`), `valid_until` (fecha límite), `created_by` (texto).

### Ventas (Sales)

- **GET /sales**: lista ventas/facturas (permiso `sales.view`).
- **POST /sales**: crea una venta (permiso `sales.create`).
  - Campos: `invoice` (único), `client_id`, `quote_ref` (opcional), `items` (opcional), `subtotal`, `tax`, `total`, `paid` (opcional), `status` (`pending|partial|paid|overdue|cancelled`, por defecto `pending`), `payment_method`, `due_date`.

---

## 🧾 Estados de Cuenta (Clientes y Proveedores)

### Estado de cuenta de clientes (AccountStatements)

- **GET /account-statements**: lista documentos (permiso `accountstatements.view`).
- **POST /account-statements**: crea un registro de estado de cuenta (permiso `accountstatements.create`).
  - Campos: `client_id`, `invoice_number`, `date`, `due_date` (opcional), `amount`, `paid` (opcional), `balance`, `status` (`paid|pending|overdue|partial`), `concept`.

### Estado de cuenta de proveedores (SupplierStatements)

- **GET /supplier-statements**: lista documentos (permiso `supplierstatements.view`).
- **POST /supplier-statements**: crea un registro (permiso `supplierstatements.create`).
  - Campos: `supplier_id`, `invoice_number`, `date`, `due_date`, `amount`, `paid` (opcional), `balance`, `status` (`paid|pending|overdue|partial`), `concept`.

---

## 🚚 Compras y Proveedores

### Proveedores (Suppliers)

- **GET /suppliers**: lista proveedores (permiso `suppliers.view`).
- **POST /suppliers**: crea proveedor (permiso `suppliers.create`).
  - Campos: `code` (único), `name`, `rfc` (único), `email`, `phone`, `address`, `city`, `contact`, `category`, `lead_time` (opcional), `rating` (0–5, opcional), `balance` (opcional), `status` (`active|inactive|pending`, por defecto `pending`).

### Órdenes de compra (PurchaseOrders)

- **GET /purchase-orders**: lista órdenes (permiso `purchaseorders.view`).
- **POST /purchase-orders**: crea orden (permiso `purchaseorders.create`).
  - Campos: `code` (único), `supplier_id`, `items` (opcional), `total` (opcional), `status` (`draft|pending|approved|ordered|partial|received|cancelled`), `priority` (`low|medium|high|urgent`), `requested_by`, `approved_by` (opcional), `expected_date` (opcional).

---

## 💰 Bancos y Movimientos

### Cuentas bancarias (BankAccounts)

- **GET /bank-accounts**: lista cuentas (permiso `bankaccounts.view`).
- **POST /bank-accounts**: crea cuenta (permiso `bankaccounts.create`).
  - Campos: `bank`, `name`, `description` (opcional), `account_number` (opcional), `clabe` (opcional), `type` (`checking|savings|credit`), `currency` (`MXN|USD`), `balance` (opcional), `available_balance` (opcional), `status` (`active|inactive|blocked`), `last_movement` (opcional).

### Movimientos bancarios (BankTransactions)

- **GET /bank-transactions**: lista movimientos crudos (permiso `banktransactions.view`).
- **POST /bank-transactions**: registra un movimiento (permiso `banktransactions.create`).
  - Campos: `date`, `reference` (opcional), `description`, `type` (`income|expense|transfer`), `amount`, `balance`, `bank`, `category`.

### Movimientos consolidados (Movements)

- **GET /movements**: lista movimientos por cuenta (permiso `movements.view`).
- **POST /movements**: registra movimiento (permiso `movements.create`).
  - Campos: `date`, `type` (`income|expense|transfer`), `category` (opcional), `description` (opcional), `reference` (opcional), `bank_account_id`, `amount`, `balance`, `status` (`completed|pending|cancelled`, por defecto `completed`).

---

## 🧑‍💼 Empleados y Nómina Básica

### Empleados (Employees)

- **GET /employees**: lista empleados (permiso `employees.view`).
- **POST /employees**: crea empleado (permiso `employees.create`).
  - Campos: `code` (único), `name`, `position`, `department`, `email` (único), `phone` (opcional), `salary`, `hire_date`, `status` (`active|inactive|vacation`, por defecto `active`), `avatar` (opcional).

### Ausencias, horas extra, guardias, descuentos, incapacidades, vacaciones

Para todos los recursos (`absences`, `overtimes`, `guard-payments`, `discounts`, `disabilities`, `vacation-requests`):

- Siempre incluyen `employee_id` y rellenan automáticamente `employee_name` y `department`.
- Usan enums para `type`/`status` siguiendo la migración.
- Resumen de campos clave:
  - **Absences**: `date`, `type` (`justified|unjustified|late`), `status` (`registered|justified|discounted`), `deduction`.
  - **Overtimes**: `date`, `hours`, `type` (`simple|double|triple`), `rate`, `amount`, `status` (`pending|approved|paid`).
  - **GuardPayments**: `date`, `shift` (`day|night|weekend|holiday`), `hours`, `rate`, `amount`, `status`.
  - **Discounts**: `type` (`loan|infonavit|fonacot|alimony|other`), `amount`, `period`, `status` (`active|completed|paused`), `start_date`, `end_date`.
  - **Disabilities**: `type` (`imss|accident|maternity|illness`), `start_date`, `end_date`, `days`, `folio`, `status`.
  - **VacationRequests**: rango `start_date`–`end_date`, `days`, `days_available`, `type` (`vacation|personal|medical`), `status` (`pending|approved|rejected|taken`).

---

## 🧩 Otros módulos

### Órdenes de servicio (ServiceOrders)

- **GET /service-orders** / **POST /service-orders**: tareas de servicio ligadas a `client_id`, con `type`, `priority`, `status`, horas estimadas/reales y costo.

### Mantenimiento de máquinas (MaintenanceOrders)

- **GET /maintenance-orders** / **POST /maintenance-orders**: trabajos de mantenimiento por `machine_id`, con `type`, `priority`, `status`, horas/costos estimados y reales.

### Órdenes de trabajo de producción (WorkOrders)

- **GET /work-orders** / **POST /work-orders**: órdenes para producir cierta cantidad de `product_name` para `client_name`, con `status`, `priority`, `progress`, tiempos estimado/real.

### Ubicaciones de almacén (WarehouseLocations)

- **GET /warehouse-locations** / **POST /warehouse-locations**: catálogo de ubicaciones físicas de almacén (`name`, `zone`, `type`, `capacity`, `occupancy`).

### Inventario (InventoryItems)

- **GET /inventory-items**: lista el inventario (permiso `inventoryitems.view`).
- **POST /inventory-items**: crea un item de inventario (permiso `inventoryitems.create`).
  - Campos: `code` (único), `name`, `category` (`raw_material|component|tool|consumable`), `quantity` (opcional, por defecto 0), `min_stock` (opcional, por defecto 0), `max_stock` (opcional), `unit_cost`, `location` (opcional), `last_movement` (opcional).
