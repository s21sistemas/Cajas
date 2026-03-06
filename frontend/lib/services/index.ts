// Export all services for easy importing
export { productsService } from './products.service';
export { materialsService } from './materials.service';
export { machinesService } from './machines.service';
export { processesService, type ProcessStats } from './processes.service';
export { operatorsService, type OperatorStats } from './operators.service';
export { inventoryService } from './inventory.service';
export { clientsService, type ClientStats, type BranchStats } from './clients.service';
export { suppliersService } from './suppliers.service';
export { employeesService } from './employees.service';
export { hrService } from './hr.service';
export { financeService, bankAccountsService } from './finance.service';
export { workOrdersService } from './work-orders.service';
export { purchaseOrdersService } from './purchase-orders.service';
export { serviceOrdersService } from './service-orders.service';
export { maintenanceService } from './maintenance.service';
export { loansService } from './loans.service';
export { loanPaymentsService } from './loan-payments.service';
export { settingsService } from './settings.service';
export { usersService, rolesService, permissionsService } from './users.service';
export { vehiclesService } from './vehicles.service';
export { deliveriesService } from './deliveries.service';
export { orderPedidoService } from './order-pedido.service';
export { productionService } from './production.service';
export { quotesService, type QuoteStats } from './quotes.service';
export { salesService } from './sales.service';
export { accountStatementsService } from './account-statements.service';
export { reportsService } from './reports.service';
export { discountTypesService, type DiscountType, type CreateDiscountTypeDto, type UpdateDiscountTypeDto } from './discount-types.service';
export { loanTypesService, type LoanType, type CreateLoanTypeDto, type UpdateLoanTypeDto } from './loan-types.service';
export { processTypesService, type ProcessType, type CreateProcessTypeDto, type UpdateProcessTypeDto } from './process-types.service';
export { notificationsService } from './notifications.service';

// Re-export auth API functions
export { authApi } from '../api';