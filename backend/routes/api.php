<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\MachineMovementController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierStatementController;
use App\Http\Controllers\AccountStatementController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\QuoteItemController;
use App\Http\Controllers\QRItemController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\GasolineReceiptController;
use App\Http\Controllers\WarehouseLocationController;
use App\Http\Controllers\WarehouseMovementController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\GuardPaymentController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\DiscountTypeController;
use App\Http\Controllers\ProcessTypeController;
use App\Http\Controllers\LoanTypeController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\LoanPaymentController;
use App\Http\Controllers\VacationRequestController;
use App\Http\Controllers\DisabilityController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\QualityController;
use App\Http\Controllers\EmployeeAccountController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\OrderPedidoController;
use App\Http\Controllers\NotificationController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Ruta de login para API (para redirigir errores de autenticación)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login')->withoutMiddleware(['auth']);

// Login de operadores - público sin autenticación
Route::post('/operator/login', [AuthController::class, 'operatorLogin']);

// Rutas de autenticación de clientes (públicas)
Route::post('/client/login', [ClientAuthController::class, 'login']);
Route::post('/client/set-password', [ClientAuthController::class, 'setPassword']);
Route::get('/client/approval-info', [ClientAuthController::class, 'getApprovalInfo']);
Route::post('/client/approve-document', [ClientAuthController::class, 'approveDocument']);

// Generar link de aprobación (requiere autenticación de sistema)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/client/generate-approval-link', [ClientAuthController::class, 'generateApprovalLink']);
    Route::post('/client/set-password-direct', [ClientAuthController::class, 'setPasswordDirect']);
});

// Rutas de operador protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/operator/logout', [AuthController::class, 'operatorLogout']);
    Route::get('/operator/user', [AuthController::class, 'getOperatorUser']);
});

// Rutas públicas - sin autenticación requerida

Route::get('/productions', [ProductionController::class, 'index']);
Route::get('/work-orders/select-list', [WorkOrderController::class, 'selectListWorkOrders']);
Route::get('/clients/select-list-client', [ClientController::class, 'selectListClient']);
Route::get('/sales/select-list', [SaleController::class, 'selectList']);
Route::get('/processes/select-list', [ProcessController::class, 'selectList']);
Route::get('/machines/select-list', [MachineController::class, 'selectList']);
Route::get('/operators/select-list', [OperatorController::class, 'selectList']);
Route::get('/products/select-list', [ProductController::class, 'selectListProducts']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Core auth / users / roles / permissions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'get_user']);
    Route::get('/permissions', [PermissionController::class, 'index']);  
    Route::apiResource('roles', RoleController::class);  
    Route::apiResource('users', UserController::class);
    
    // Production / Manufacturing - rutas que requieren auth
    Route::get('/materials/select-list-materials', [MaterialController::class, 'selectListMaterials']);
    Route::apiResource('materials', MaterialController::class);
    Route::get('/materials/stats', [MaterialController::class, 'stats']);
    // Materiales del producto
    Route::get('/products/{product}/materials', [ProductController::class, 'getParts']);
    Route::post('/products/{product}/materials', [ProductController::class, 'addPart']);
    Route::put('/products/{product}/materials/{materialId}', [ProductController::class, 'updatePart']);
    Route::delete('/products/{product}/materials/{materialId}', [ProductController::class, 'removePart']);
    // Procesos del producto
    Route::get('/products/{product}/processes', [ProductController::class, 'getProcesses']);
    Route::post('/products/{product}/processes', [ProductController::class, 'addProcess']);
    Route::delete('/products/{product}/processes/{productProcess}', [ProductController::class, 'removeProcess']);    
    // Productos
    Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
    Route::get('/products/stats', [ProductController::class, 'stats']);
    Route::get('/products/select-list', [ProductController::class, 'selectListProducts']);
    Route::get('/products/{product}/details', [ProductController::class, 'showWithDetails']);
    Route::post('/products/from-quote', [ProductController::class, 'createFromQuote']);
    Route::apiResource('products', ProductController::class);

    // Procesos
    Route::get('/processes/stats', [ProcessController::class, 'stats']);
    Route::get('/processes/select-list', [ProcessController::class, 'selectList']);
    Route::apiResource('processes', ProcessController::class);

    //Maquinaria
    Route::get('/machines/stats', [MachineController::class, 'stats']);
    Route::get('/machines/select-list', [MachineController::class, 'selectList']);
    Route::patch('/machines/{machine}/status', [MachineController::class, 'updateStatus']);
    Route::post('/machines/{machine}/start', [MachineController::class, 'startOperation']);
    Route::post('/machines/{machine}/stop', [MachineController::class, 'stopOperation']);
    Route::post('/machines/{machine}/maintenance', [MachineController::class, 'scheduleMaintenance']);
    Route::post('/machines/{machine}/maintenance/complete', [MachineController::class, 'completeMaintenance']);
    Route::get('/machines/utilization', [MachineController::class, 'utilization']);    
    Route::get('/machines/activities', [MachineController::class, 'activities']);
    Route::apiResource('machines', MachineController::class);
    Route::get('/machines/{machine}/movements', [MachineController::class, 'movements']);
    Route::get('/machines/{machine}/movements/report', [MachineController::class, 'movementsReport']);

    // Machine Movements - Tracking de uso de máquinas
    // IMPORTANTE: Rutas específicas deben estar ANTES del apiResource
    Route::post('/machine-movements/start', [MachineMovementController::class, 'start']);
    Route::post('/machine-movements/{machineMovement}/stop', [MachineMovementController::class, 'stop']);
    Route::get('/machine-movements/utilization/{machine}', [MachineMovementController::class, 'utilization']);
    Route::apiResource('machine-movements', MachineMovementController::class);

    // Reportes
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/machines', [ReportController::class, 'machines']);
    Route::get('/reports/production', [ReportController::class, 'production']);
    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/inventory', [ReportController::class, 'inventory']);
    Route::get('/reports/finance', [ReportController::class, 'finance']);
    Route::get('/reports/executive', [ReportController::class, 'executive']);
    Route::get('/reports/options', [ReportController::class, 'options']);
    Route::get('/reports/cost-trend', [ReportController::class, 'costTrend']);

    // La ruta de login no debe tener middleware de autenticacion
    Route::get('/operators/my-productions', [OperatorController::class, 'myProductions'])->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::get('/operators/select-list', [OperatorController::class, 'selectList']);
    Route::get('/operators/stats', [OperatorController::class, 'stats']);
    Route::apiResource('operators', OperatorController::class);

    // Producciones
    Route::post('/productions/{production}/complete-to-inventory', [ProductionController::class, 'completeToInventory']);
    // Rutas MES para producciones
    Route::post('/productions/{production}/complete', [ProductionController::class, 'complete']);
    Route::post('/productions/{production}/pause', [ProductionController::class, 'pause']);
    Route::post('/productions/{production}/resume', [ProductionController::class, 'resume']);
    Route::get('/productions/{production}/movements', [ProductionController::class, 'movements']);
    Route::get('/productions/pending-quality', [ProductionController::class, 'pendingQuality']);
    Route::apiResource('productions', ProductionController::class);


    // Settings - rutas personalizadas para key-value por módulo
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/settings/{module}', [SettingController::class, 'show']);
    Route::put('/settings/{module}/{key}', [SettingController::class, 'update']);
    Route::delete('/settings/{module}/{key}', [SettingController::class, 'destroy']);
    // Rutas para logo
    Route::post('/settings/company/logo', [SettingController::class, 'uploadLogo']);
    Route::delete('/settings/company/logo', [SettingController::class, 'deleteLogo']);

    // CRM / Sales
    Route::get('/clients/stats', [ClientController::class, 'stats']);
    Route::get('/clients/select-list-client', [ClientController::class, 'selectListClient']);
    Route::apiResource('clients', ClientController::class);
    Route::get('/branches/stats', [BranchController::class, 'stats']);
    Route::get('/branches/select-list', [BranchController::class, 'selectList']);
    Route::apiResource('branches', BranchController::class);
    // Quotes - rutas específicas para cotizaciones por cliente
    Route::get('/quotes/by-client/{client_id}', [QuoteController::class, 'getByClient'])
        ->name('quotes.byclient')
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    // Quotes sin venta - para crear venta directamente
    Route::get('/quotes/without-sale', [QuoteController::class, 'getWithoutSale'])
        ->name('quotes.without-sale')
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::get('/quotes/stats', [QuoteController::class, 'stats'])->name('quotes.stats');
    Route::get('/quotes/{quote}/items', [QuoteController::class, 'getItems'])
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'exportPdf'])
        ->name('quotes.pdf')
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::post('/quotes/{quote}/send-email', [QuoteController::class, 'sendEmail'])->name('quotes.send-email');
    Route::post('/quotes/{quote}/items', [QuoteItemController::class, 'store'])->name('quotes.items.store');
    Route::put('/quotes/{quote}/items/{item}', [QuoteItemController::class, 'update'])->name('quotes.items.update');
    Route::delete('/quotes/{quote}/items/{item}', [QuoteItemController::class, 'destroy'])->name('quotes.items.destroy');
    Route::apiResource('quotes', QuoteController::class);
    Route::apiResource('qr-items', QRItemController::class);
    Route::get('/sales/by-client/{client_id}', [SaleController::class, 'getByClient'])->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::post('/sales/{sale}/payment', [SaleController::class, 'createPayment']);
    Route::get('/sales/{sale}/payments', [SaleController::class, 'getPayments']);
    Route::post('/sales/{sale}/complete', [SaleController::class, 'complete']);
    Route::get('/sales/{sale}/pdf', [SaleController::class, 'exportPdf'])
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::get('/sales/{sale}/items', [SaleController::class, 'getItems']);
    Route::post('/sales/{sale}/items', [SaleController::class, 'addItem']);
    Route::put('/sales/{sale}/items/{item}', [SaleController::class, 'updateItem']);
    Route::delete('/sales/{sale}/items/{item}', [SaleController::class, 'deleteItem']);
    Route::get('/sales/stats', [SaleController::class, 'stats']);
    Route::get('/sales/select-list', [SaleController::class, 'selectList']);
    Route::get('/sales/select-list-for-order-pedido', [SaleController::class, 'selectListForOrderPedido']);
    Route::apiResource('sales', SaleController::class);
    
    // Warehouse - Almacén
    Route::get('/warehouse-locations/stats', [WarehouseLocationController::class, 'stats']);
    Route::get('/warehouse-locations/select-list', [WarehouseLocationController::class, 'selectList']);
    Route::get('/warehouse-locations/available', [WarehouseLocationController::class, 'available']);
    Route::get('/warehouse-locations/{warehouseLocation}/occupancy', [WarehouseLocationController::class, 'occupancy']);
    Route::apiResource('warehouse-locations', WarehouseLocationController::class);
    Route::get('/inventory-items/stats', [InventoryItemController::class, 'stats']);
    Route::get('/inventory-items/low-stock', [InventoryItemController::class, 'lowStock']);
    Route::get('/inventory-items/category', [InventoryItemController::class, 'byCategory']);
    Route::get('/inventory-items/location', [InventoryItemController::class, 'byLocation']);
    Route::patch('/inventory-items/{inventoryItem}/quantity', [InventoryItemController::class, 'updateQuantity']);
    Route::apiResource('inventory-items', InventoryItemController::class);
    // Warehouse Movements - Movimientos de almacén (ingresos y egresos)
    Route::get('/warehouse-movements/stats', [WarehouseMovementController::class, 'stats']);
    Route::post('/warehouse-movements/income', [WarehouseMovementController::class, 'registerIncome']);
    Route::post('/warehouse-movements/expense', [WarehouseMovementController::class, 'registerExpense']);
    Route::get('/warehouse-movements/item/{inventoryItemId}', [WarehouseMovementController::class, 'byInventoryItem']);
    Route::post('/warehouse-movements/sync-stock', [WarehouseMovementController::class, 'syncStock']);
    Route::apiResource('warehouse-movements', WarehouseMovementController::class);

    Route::patch('/service-orders/{serviceOrder}/status', [ServiceOrderController::class, 'updateStatus']);
    Route::get('/service-orders/stats', [ServiceOrderController::class, 'stats']);
    Route::apiResource('service-orders', ServiceOrderController::class);

    // Suppliers / purchasing    
    Route::get('/suppliers/stats', [SupplierController::class, 'stats']);
    Route::get('/suppliers/select-list', [SupplierController::class, 'selectListSuppliers']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('/supplier-statements/stats', [SupplierStatementController::class, 'stats']);
    Route::apiResource('supplier-statements', SupplierStatementController::class);    
    Route::get('/purchase-orders/stats', [PurchaseOrderController::class, 'stats']);
    Route::post('/purchase-orders/{purchase_order}/payment', [PurchaseOrderController::class, 'recordPayment']);
    Route::get('/purchase-orders/{purchase_order}/payments', [PurchaseOrderController::class, 'getPayments']);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);

    // Finance
    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::apiResource('movements', MovementController::class);
    Route::get('account-statements/stats', [AccountStatementController::class, 'stats']);
    Route::apiResource('account-statements', AccountStatementController::class);

    // HR / Payroll    
    Route::get('/employees/stats', [EmployeeController::class, 'stats']);
    Route::get('/employees/departments', [EmployeeController::class, 'departments']);
    Route::get('/employees/select-list',[EmployeeController::class, 'selectList']);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('overtimes', OvertimeController::class);
    Route::patch('/overtimes/{overtime}/approve', [OvertimeController::class, 'approve']);
    Route::patch('/overtimes/{overtime}/pay', [OvertimeController::class, 'pay']);
    Route::apiResource('guard-payments', GuardPaymentController::class);
    Route::apiResource('discounts', DiscountController::class);
    Route::patch('/discounts/{discount}/pause', [DiscountController::class, 'pause']);
    Route::patch('/discounts/{discount}/resume', [DiscountController::class, 'resume']);
    Route::apiResource('discount-types', DiscountTypeController::class);
    Route::apiResource('process-types', ProcessTypeController::class);
    Route::apiResource('loan-types', LoanTypeController::class);    
    Route::get('/loans/stats', [LoanController::class, 'stats']);
    Route::patch('/loans/{loan}/activate', [LoanController::class, 'activate']);
    Route::patch('/loans/{loan}/cancel', [LoanController::class, 'cancel']);
    Route::apiResource('loans', LoanController::class);
    Route::patch('/loan-payments/{loanPayment}/cancel', [LoanPaymentController::class, 'cancel']);
    Route::apiResource('loan-payments', LoanPaymentController::class);
    Route::apiResource('vacation-requests', VacationRequestController::class);
    Route::patch('/vacation-requests/{vacationRequest}/approve', [VacationRequestController::class, 'approve']);
    Route::patch('/vacation-requests/{vacationRequest}/reject', [VacationRequestController::class, 'reject']);
    Route::patch('/vacation-requests/{vacationRequest}/taken', [VacationRequestController::class, 'taken']);
    Route::apiResource('disabilities', DisabilityController::class);
    Route::apiResource('absences', AbsenceController::class);
    Route::apiResource('employee-accounts', EmployeeAccountController::class);

    // Maintenance / Production planning
    Route::patch('/maintenance-orders/{maintenanceOrder}/start', [MaintenanceOrderController::class, 'start']);
    Route::patch('/maintenance-orders/{maintenanceOrder}/complete', [MaintenanceOrderController::class, 'complete']);
    Route::get('/maintenance-orders/stats', [MaintenanceOrderController::class, 'stats']);
    Route::get('/maintenance-orders/upcoming', [MaintenanceOrderController::class, 'upcoming']);
    Route::get('/maintenance-orders/machine/{machine}', [MaintenanceOrderController::class, 'byMachine']);
    Route::apiResource('maintenance-orders', MaintenanceOrderController::class);
    
    // Work Orders - custom routes first (before apiResource to avoid conflicts)
    Route::get('/work-orders/available-products', [WorkOrderController::class, 'getAvailableProducts']);
    Route::get('/work-orders/assigned', [WorkOrderController::class, 'getAssigned']);
    Route::get('/work-orders/{workOrder}/productions', [WorkOrderController::class, 'getProductions']);
    Route::get('/work-orders/select-list', [WorkOrderController::class, 'selectListWorkOrders'])
        ->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    Route::get('/work-orders/{workOrder}/pipeline-status', [WorkOrderController::class, 'getPipelineStatus']);
    Route::get('/work-orders/stats', [WorkOrderController::class, 'stats']);
    Route::apiResource('work-orders', WorkOrderController::class)->withoutMiddleware([\Spatie\Permission\Middleware\PermissionMiddleware::class]);
    
    // Quality Evaluations - MES
    Route::get('/quality/pending', [QualityController::class, 'pendingEvaluations']);
    Route::get('/quality/production/{productionId}', [QualityController::class, 'getByProduction']);
    Route::get('/quality/process/{processId}', [QualityController::class, 'getByProcess']);
    Route::get('/quality/process/{processId}/metrics', [QualityController::class, 'getProcessMetrics']);
    Route::get('/quality/movements', [QualityController::class, 'getMovements']);
    Route::get('/quality/dashboard', [QualityController::class, 'dashboard']);
    Route::apiResource('quality', QualityController::class);
    
    // Vehicles
    Route::apiResource('vehicles', VehicleController::class);

    // Gasoline Receipts
    Route::apiResource('gasoline-receipts', GasolineReceiptController::class);
    
    // Deliveries
    Route::apiResource('deliveries', DeliveryController::class);

    // Órdenes de Pedido
    Route::get('/order-pedidos/stats', [OrderPedidoController::class, 'stats']);
    Route::get('/order-pedidos/available', [OrderPedidoController::class, 'available']);
    Route::post('/order-pedidos/{id}/assign', [OrderPedidoController::class, 'assign']);
    Route::post('/order-pedidos/{id}/pick-up', [OrderPedidoController::class, 'pickUp']);
    Route::post('/order-pedidos/{id}/deliver', [OrderPedidoController::class, 'deliver']);
    Route::apiResource('order-pedidos', OrderPedidoController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread', [NotificationController::class, 'unread']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications', [NotificationController::class, 'destroy']);
});