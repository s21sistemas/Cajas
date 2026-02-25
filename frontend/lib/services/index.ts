// Export all services for easy importing
export { productsService } from './products.service';
export { materialsService } from './materials.service';
export { partsService } from './parts.service';
export { machinesService } from './machines.service';
export { processesService, type ProcessStats } from './processes.service';
export { operatorsService, type OperatorStats } from './operators.service';
export { inventoryService } from './inventory.service';
export { clientsService, type ClientStats, type BranchStats } from './clients.service';
export { suppliersService } from './suppliers.service';
export { employeesService } from './employees.service';
export { hrService } from './hr.service';
export { financeService } from './finance.service';
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
export { productionService } from './production.service';
export { quotesService, type QuoteStats } from './quotes.service';

// Re-export auth API functions
export { authApi } from '../api';