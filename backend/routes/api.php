<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\ProcessController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\CncProgramController;
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
use App\Http\Controllers\QRItemController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\WarehouseLocationController;
use App\Http\Controllers\InventoryItemController;
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
    Route::apiResource('parts', PartController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('processes', ProcessController::class);
    Route::apiResource('machines', MachineController::class);
    Route::apiResource('operators', OperatorController::class);
    Route::apiResource('cnc-programs', CncProgramController::class);
    Route::apiResource('productions', ProductionController::class);
    Route::apiResource('settings', SettingController::class);

    // CRM / Sales
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('quotes', QuoteController::class);
    Route::apiResource('qr-items', QRItemController::class);
    Route::apiResource('sales', SaleController::class);
    Route::apiResource('warehouse-locations', WarehouseLocationController::class);
    Route::apiResource('inventory-items', InventoryItemController::class);
    Route::apiResource('service-orders', ServiceOrderController::class);

    // Suppliers / purchasing
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('supplier-statements', SupplierStatementController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);

    // Finance
    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::apiResource('bank-transactions', BankTransactionController::class);
    Route::apiResource('movements', MovementController::class);
    Route::apiResource('account-statements', AccountStatementController::class);

    // HR / Payroll
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('overtimes', OvertimeController::class);
    Route::apiResource('guard-payments', GuardPaymentController::class);
    Route::apiResource('discounts', DiscountController::class);
    Route::apiResource('discount-types', DiscountTypeController::class);
    Route::apiResource('loan-types', LoanTypeController::class);
    Route::apiResource('vacation-requests', VacationRequestController::class);
    Route::apiResource('disabilities', DisabilityController::class);
    Route::apiResource('absences', AbsenceController::class);
    Route::apiResource('employee-accounts', EmployeeAccountController::class);

    // Maintenance / Production planning
    Route::apiResource('maintenance-orders', MaintenanceOrderController::class);
    Route::apiResource('work-orders', WorkOrderController::class);
});