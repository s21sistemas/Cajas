<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\ProductionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierStatementController;
use App\Http\Controllers\AccountStatementController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\BankTransactionController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\ServiceOrderController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\QuoteItemController;
use App\Http\Controllers\QRItemController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\WarehouseLocationController;
use App\Http\Controllers\WarehouseMovementController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\GuardPaymentController;
use App\Http\Controllers\DiscountController;
use App\Http\Controllers\DiscountTypeController;
use App\Http\Controllers\LoanTypeController;
use App\Http\Controllers\VacationRequestController;
use App\Http\Controllers\DisabilityController;
use App\Http\Controllers\AbsenceController;
use App\Http\Controllers\MaintenanceOrderController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\WorkOrderController;
use App\Http\Controllers\QualityController;
use App\Http\Controllers\EmployeeAccountController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Core auth / users / roles / permissions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'get_user']);
    Route::get('/permissions', [PermissionController::class, 'index']);  
    Route::apiResource('roles', RoleController::class);  
    Route::apiResource('users', UserController::class);
    
    // Production / Manufacturing
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
    Route::put('/products/{product}/processes/{productProcess}', [ProductController::class, 'updateProcess']);
    Route::delete('/products/{product}/processes/{productProcess}', [ProductController::class, 'removeProcess']);    
    // Productos
    Route::get('/products/low-stock', [ProductController::class, 'lowStock']);
    Route::get('/products/stats', [ProductController::class, 'stats']);
    Route::get('/products/{product}/details', [ProductController::class, 'showWithDetails']);
    Route::apiResource('products', ProductController::class);

    // Procesos
    Route::get('/processes/stats', [ProcessController::class, 'stats']);
    Route::get('/processes/select-list', [ProcessController::class, 'selectListProcesses']);
    Route::apiResource('processes', ProcessController::class);

    //Maquinaria
    Route::patch('/machines/{machine}/status', [MachineController::class, 'updateStatus']);
    Route::post('/machines/{machine}/start', [MachineController::class, 'startOperation']);
    Route::post('/machines/{machine}/stop', [MachineController::class, 'stopOperation']);
    Route::post('/machines/{machine}/maintenance', [MachineController::class, 'scheduleMaintenance']);
    Route::post('/machines/{machine}/maintenance/complete', [MachineController::class, 'completeMaintenance']);
    Route::get('/machines/utilization', [MachineController::class, 'utilization']);
    Route::get('/machines/stats', [MachineController::class, 'stats']);
    Route::apiResource('machines', MachineController::class);

    // Operadores
    Route::get('/operators/stats', [OperatorController::class, 'stats']);
    Route::apiResource('operators', OperatorController::class);

    // Producciones
    Route::post('/productions/{production}/complete-to-inventory', [ProductionController::class, 'completeToInventory']);
    Route::apiResource('productions', ProductionController::class);

    // Rutas MES para producciones
    Route::post('/productions/{production}/complete', [ProductionController::class, 'complete']);
    Route::post('/productions/{production}/pause', [ProductionController::class, 'pause']);
    Route::post('/productions/{production}/resume', [ProductionController::class, 'resume']);
    Route::get('/productions/{production}/movements', [ProductionController::class, 'movements']);
    Route::get('/productions/pending-quality', [ProductionController::class, 'pendingQuality']);

    // Settings - rutas personalizadas para key-value por módulo
    Route::get('/settings', [SettingController::class, 'index']);
    Route::get('/settings/{module}', [SettingController::class, 'show']);
    Route::put('/settings/{module}/{key}', [SettingController::class, 'update']);
    Route::delete('/settings/{module}/{key}', [SettingController::class, 'destroy']);

    // CRM / Sales
    Route::get('/clients/stats', [ClientController::class, 'stats']);
    Route::get('/clients/select-list-client', [ClientController::class, 'selectListClient']);
    Route::apiResource('clients', ClientController::class);
    Route::get('/branches/stats', [BranchController::class, 'stats']);
    Route::apiResource('branches', BranchController::class);
    // Quotes - rutas específicas ANTES del apiResource
    Route::get('/quotes/stats', [QuoteController::class, 'stats'])->name('quotes.stats');
    Route::get('/quotes/{quote}/pdf', [QuoteController::class, 'exportPdf'])->name('quotes.pdf');
    Route::post('/quotes/{quote}/items', [QuoteItemController::class, 'store'])->name('quotes.items.store');
    Route::put('/quotes/{quote}/items/{item}', [QuoteItemController::class, 'update'])->name('quotes.items.update');
    Route::delete('/quotes/{quote}/items/{item}', [QuoteItemController::class, 'destroy'])->name('quotes.items.destroy');
    Route::apiResource('quotes', QuoteController::class);
    Route::apiResource('qr-items', QRItemController::class);
    Route::post('/sales/{sale}/payment', [SaleController::class, 'recordPayment']);
    Route::get('/sales/stats', [SaleController::class, 'stats']);
    Route::apiResource('sales', SaleController::class);
    Route::apiResource('warehouse-locations', WarehouseLocationController::class);
    Route::get('/warehouse-locations/stats', [WarehouseLocationController::class, 'stats']);
    Route::get('/warehouse-locations/{warehouseLocation}/occupancy', [WarehouseLocationController::class, 'occupancy']);
    Route::get('/warehouse-locations/available', [WarehouseLocationController::class, 'available']);
    Route::apiResource('inventory-items', InventoryItemController::class);
    Route::get('/inventory-items/stats', [InventoryItemController::class, 'stats']);
    Route::get('/inventory-items/low-stock', [InventoryItemController::class, 'lowStock']);
    Route::get('/inventory-items/category', [InventoryItemController::class, 'byCategory']);
    Route::get('/inventory-items/location', [InventoryItemController::class, 'byLocation']);
    Route::patch('/inventory-items/{inventoryItem}/quantity', [InventoryItemController::class, 'updateQuantity']);
    // Warehouse Movements - Movimientos de almacén (ingresos y egresos)
    Route::apiResource('warehouse-movements', WarehouseMovementController::class);
    Route::get('/warehouse-movements/stats', [WarehouseMovementController::class, 'stats']);
    Route::post('/warehouse-movements/income', [WarehouseMovementController::class, 'registerIncome']);
    Route::post('/warehouse-movements/expense', [WarehouseMovementController::class, 'registerExpense']);
    Route::get('/warehouse-movements/item/{inventoryItemId}', [WarehouseMovementController::class, 'byInventoryItem']);
    
    Route::patch('/service-orders/{serviceOrder}/status', [ServiceOrderController::class, 'updateStatus']);
    Route::get('/service-orders/stats', [ServiceOrderController::class, 'stats']);
    Route::apiResource('service-orders', ServiceOrderController::class);

    // Suppliers / purchasing    
    Route::get('/suppliers/stats', [SupplierController::class, 'stats']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('supplier-statements', SupplierStatementController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::get('/purchase-orders/stats', [PurchaseOrderController::class, 'stats']);

    // Finance
    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::apiResource('bank-transactions', BankTransactionController::class);
    Route::apiResource('movements', MovementController::class);
    Route::apiResource('account-statements', AccountStatementController::class);

    // HR / Payroll    
    Route::get('/employees/stats', [EmployeeController::class, 'stats']);
    Route::get('/employees/departments', [EmployeeController::class, 'departments']);
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('overtimes', OvertimeController::class);
    Route::patch('/overtimes/{overtime}/approve', [OvertimeController::class, 'approve']);
    Route::patch('/overtimes/{overtime}/pay', [OvertimeController::class, 'pay']);
    Route::apiResource('guard-payments', GuardPaymentController::class);
    Route::apiResource('discounts', DiscountController::class);
    Route::patch('/discounts/{discount}/pause', [DiscountController::class, 'pause']);
    Route::patch('/discounts/{discount}/resume', [DiscountController::class, 'resume']);
    Route::apiResource('discount-types', DiscountTypeController::class);
    Route::apiResource('loan-types', LoanTypeController::class);
    Route::apiResource('loans', LoanController::class);
    Route::get('/loans/stats', [LoanController::class, 'stats']);
    Route::patch('/loans/{loan}/activate', [LoanController::class, 'activate']);
    Route::patch('/loans/{loan}/cancel', [LoanController::class, 'cancel']);
    Route::apiResource('loan-payments', LoanPaymentController::class);
    Route::patch('/loan-payments/{loanPayment}/cancel', [LoanPaymentController::class, 'cancel']);
    Route::apiResource('vacation-requests', VacationRequestController::class);
    Route::patch('/vacation-requests/{vacationRequest}/approve', [VacationRequestController::class, 'approve']);
    Route::patch('/vacation-requests/{vacationRequest}/reject', [VacationRequestController::class, 'reject']);
    Route::patch('/vacation-requests/{vacationRequest}/taken', [VacationRequestController::class, 'taken']);
    Route::apiResource('disabilities', DisabilityController::class);
    Route::apiResource('absences', AbsenceController::class);
    Route::apiResource('employee-accounts', EmployeeAccountController::class);

    // Maintenance / Production planning
    Route::apiResource('maintenance-orders', MaintenanceOrderController::class);
    Route::patch('/maintenance-orders/{maintenanceOrder}/start', [MaintenanceOrderController::class, 'start']);
    Route::patch('/maintenance-orders/{maintenanceOrder}/complete', [MaintenanceOrderController::class, 'complete']);
    Route::get('/maintenance-orders/stats', [MaintenanceOrderController::class, 'stats']);
    Route::get('/maintenance-orders/upcoming', [MaintenanceOrderController::class, 'upcoming']);
    Route::get('/maintenance-orders/machine/{machine}', [MaintenanceOrderController::class, 'byMachine']);
    
    // Work Orders - custom routes first (before apiResource to avoid conflicts)
    Route::get('/work-orders/products', [WorkOrderController::class, 'getProducts']);
    Route::get('/work-orders/clients', [WorkOrderController::class, 'getClients']);
    Route::get('/work-orders/suppliers', [WorkOrderController::class, 'getSuppliers']);
    
    Route::apiResource('work-orders', WorkOrderController::class);
    Route::patch('/work-orders/{workOrder}/status', [WorkOrderController::class, 'updateStatus']);
    Route::patch('/work-orders/{workOrder}/progress', [WorkOrderController::class, 'updateProgress']);
    Route::get('/work-orders/{workOrder}/items', [WorkOrderController::class, 'getItems']);
    Route::post('/work-orders/{workOrder}/items', [WorkOrderController::class, 'addItem']);
    Route::get('/work-orders/{workOrder}/processes', [WorkOrderController::class, 'getProcesses']);
    Route::get('/work-orders/{workOrder}/productions', [WorkOrderController::class, 'getProductions']);
    Route::get('/work-orders/stats', [WorkOrderController::class, 'stats']);
    Route::get('/work-orders/assigned', [WorkOrderController::class, 'getAssigned']);
    Route::post('/work-orders/{workOrder}/mark-complete', [WorkOrderController::class, 'markComplete']);
    
    // Work Order Processes - Ahora manejado por ProductionController
    Route::get('/work-order-processes', [ProductionController::class, 'processIndex']);
    Route::post('/work-order-processes', [ProductionController::class, 'processStore']);
    Route::get('/work-order-processes/{workOrderProcess}', [ProductionController::class, 'processShow']);
    Route::put('/work-order-processes/{workOrderProcess}', [ProductionController::class, 'processUpdate']);
    Route::delete('/work-order-processes/{workOrderProcess}', [ProductionController::class, 'processDestroy']);
    
    // Rutas de procesos MES
    Route::post('/work-order-processes/{workOrderProcess}/start', [ProductionController::class, 'startProcess']);
    Route::post('/work-order-processes/{workOrderProcess}/pause', [ProductionController::class, 'pauseProcess']);
    Route::post('/work-order-processes/{workOrderProcess}/complete', [ProductionController::class, 'completeProcess']);
    Route::get('/work-order-processes/{workOrderProcess}/metrics', [ProductionController::class, 'processMetrics']);
    Route::post('/work-orders/{workOrderId}/initialize-pipeline', [ProductionController::class, 'initializePipeline']);
    Route::get('/work-orders/{workOrderId}/pipeline-status', [ProductionController::class, 'pipelineStatus']);
    
    // Quality Evaluations - MES
    Route::get('/quality/pending', [QualityController::class, 'pendingEvaluations']);
    Route::get('/quality/production/{productionId}', [QualityController::class, 'getByProduction']);
    Route::get('/quality/process/{processId}', [QualityController::class, 'getByProcess']);
    Route::get('/quality/process/{processId}/metrics', [QualityController::class, 'getProcessMetrics']);
    Route::get('/quality/movements', [QualityController::class, 'getMovements']);
    Route::get('/quality/dashboard', [QualityController::class, 'dashboard']);
    Route::apiResource('quality', QualityController::class);
});