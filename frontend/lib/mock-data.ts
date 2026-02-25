// Simulated API functions - Manufacturing ERP for general production
// In production, these would connect to a real backend

// ── TYPES ──────────────────────────────────────────────────────────

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  unit: string;
  stock: number;
  minStock: number;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface Part {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'raw_material' | 'component' | 'packaging' | 'consumable';
  stock: number;
  minStock: number;
  unitCost: number;
  unit: string;
  supplier: string;
  warehouse: 'materia_prima' | 'producto_terminado';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPart {
  id: string;
  productId: string;
  partId: string;
  quantity: number;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  status: 'available' | 'running' | 'maintenance' | 'offline';
  location: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Operator {
  id: string;
  employeeCode: string;
  name: string;
  shift: 'morning' | 'afternoon' | 'night';
  specialty: string;
  active: boolean;
  phone: string;
  email: string;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManufacturingProcess {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string;
  requiresMachine: boolean;
  machineId: string | null;
  estimatedTimeMin: number;
  sequence: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Production {
  id: string;
  processId: string;
  machineId: string | null;
  operatorId: string;
  startTime: Date;
  endTime: Date | null;
  goodParts: number;
  scrapParts: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'vacation';
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: 'raw_material' | 'component' | 'tool' | 'consumable' | 'finished_product';
  warehouse: 'materia_prima' | 'producto_terminado';
  quantity: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  unit: string;
  location: string;
  lastMovement: Date;
}

export interface ServiceOrder {
  id: string;
  code: string;
  type: 'preventive' | 'corrective' | 'predictive';
  machineId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  estimatedHours: number;
  actualHours?: number;
  createdAt: Date;
  completedAt?: Date;
}

// ── FAKE DATA ─────────────────────────────────────────────────────

const products: Product[] = [
  { id: '1', code: 'PRD-001', name: 'Caja Corrugada 40x30x20', description: 'Caja de carton corrugado doble pared', category: 'Cajas', price: 45, cost: 22, unit: 'pza', stock: 500, minStock: 100, status: 'active', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-06-20') },
  { id: '2', code: 'PRD-002', name: 'Caja Troquelada Display', description: 'Caja display para punto de venta con impresion 4 tintas', category: 'Displays', price: 85, cost: 38, unit: 'pza', stock: 200, minStock: 50, status: 'active', createdAt: new Date('2024-02-10'), updatedAt: new Date('2024-07-15') },
  { id: '3', code: 'PRD-003', name: 'Charola Hamburguesa', description: 'Charola plegadiza para empaque de alimentos', category: 'Plegadizas', price: 12, cost: 4.5, unit: 'pza', stock: 3000, minStock: 500, status: 'active', createdAt: new Date('2024-03-05'), updatedAt: new Date('2024-08-01') },
  { id: '4', code: 'PRD-004', name: 'Embalaje Industrial 120x80x60', description: 'Embalaje reforzado triple pared para maquinaria', category: 'Embalaje', price: 280, cost: 140, unit: 'pza', stock: 30, minStock: 10, status: 'active', createdAt: new Date('2024-04-20'), updatedAt: new Date('2024-09-10') },
  { id: '5', code: 'PRD-005', name: 'Caja Pizza Mediana', description: 'Caja para pizza mediana 35cm con impresion', category: 'Plegadizas', price: 8, cost: 3, unit: 'pza', stock: 5000, minStock: 1000, status: 'active', createdAt: new Date('2024-05-12'), updatedAt: new Date('2024-10-05') },
];

const parts: Part[] = [
  { id: '1', code: 'MP-001', name: 'Lamina Corrugada BC Kraft', description: 'Lamina corrugada doble cara kraft', type: 'raw_material', stock: 800, minStock: 200, unitCost: 18.50, unit: 'lamina', supplier: 'Cartones del Norte SA', warehouse: 'materia_prima', createdAt: new Date('2024-01-10'), updatedAt: new Date('2024-06-15') },
  { id: '2', code: 'MP-002', name: 'Lamina Corrugada C Blanca', description: 'Lamina corrugada una cara blanca', type: 'raw_material', stock: 500, minStock: 150, unitCost: 22.00, unit: 'lamina', supplier: 'Cartones del Norte SA', warehouse: 'materia_prima', createdAt: new Date('2024-01-12'), updatedAt: new Date('2024-06-18') },
  { id: '3', code: 'MP-003', name: 'Cartulina Sulfatada Cal.14', description: 'Cartulina sulfatada para plegadizas', type: 'raw_material', stock: 1200, minStock: 300, unitCost: 8.00, unit: 'pliego', supplier: 'Papelera Nacional', warehouse: 'materia_prima', createdAt: new Date('2024-02-05'), updatedAt: new Date('2024-07-20') },
  { id: '4', code: 'MP-004', name: 'Tinta Flexo Cyan', description: 'Tinta base agua para flexografia color cyan', type: 'consumable', stock: 15, minStock: 5, unitCost: 450.00, unit: 'cubeta', supplier: 'Tintas Mexicanas', warehouse: 'materia_prima', createdAt: new Date('2024-02-15'), updatedAt: new Date('2024-08-01') },
  { id: '5', code: 'MP-005', name: 'Tinta Flexo Magenta', description: 'Tinta base agua para flexografia color magenta', type: 'consumable', stock: 12, minStock: 5, unitCost: 450.00, unit: 'cubeta', supplier: 'Tintas Mexicanas', warehouse: 'materia_prima', createdAt: new Date('2024-02-15'), updatedAt: new Date('2024-08-01') },
  { id: '6', code: 'MP-006', name: 'Pegamento PVA Industrial', description: 'Pegamento blanco PVA para pegado de cajas', type: 'consumable', stock: 8, minStock: 3, unitCost: 280.00, unit: 'cubeta', supplier: 'Adhesivos Industriales', warehouse: 'materia_prima', createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-09-01') },
  { id: '7', code: 'MP-007', name: 'Suaje Troquel Caja 40x30', description: 'Suaje de corte para caja 40x30x20', type: 'component', stock: 3, minStock: 1, unitCost: 3500.00, unit: 'pza', supplier: 'Troqueles Precision', warehouse: 'materia_prima', createdAt: new Date('2024-04-01'), updatedAt: new Date('2024-09-20') },
  { id: '8', code: 'MP-008', name: 'Fleje Plastico 12mm', description: 'Fleje de polipropileno para amarre', type: 'consumable', stock: 20, minStock: 5, unitCost: 85.00, unit: 'rollo', supplier: 'Empaques del Centro', warehouse: 'materia_prima', createdAt: new Date('2024-04-15'), updatedAt: new Date('2024-10-01') },
];

const machines: Machine[] = [
  { id: '1', code: 'MAQ-001', name: 'Corrugadora', type: 'Corrugadora', brand: 'BHS', model: 'CRS-250', status: 'running', location: 'Nave 1 - Zona Corrugado', notes: 'Linea principal de corrugado', createdAt: new Date('2023-06-01'), updatedAt: new Date('2024-10-15') },
  { id: '2', code: 'MAQ-002', name: 'Impresora Flexografica 4 Tintas', type: 'Impresora Flexo', brand: 'Ward', model: 'FP-4200', status: 'available', location: 'Nave 1 - Zona Impresion', notes: 'Impresion flexografica hasta 4 colores', createdAt: new Date('2023-07-15'), updatedAt: new Date('2024-10-10') },
  { id: '3', code: 'MAQ-003', name: 'Troqueladora Plana', type: 'Troqueladora', brand: 'Bobst', model: 'SP-102', status: 'running', location: 'Nave 2 - Zona Troquelado', notes: 'Troquelado de alta velocidad', createdAt: new Date('2023-08-20'), updatedAt: new Date('2024-10-12') },
  { id: '4', code: 'MAQ-004', name: 'Pegadora Automatica', type: 'Pegadora', brand: 'Bobst', model: 'Ambition 106', status: 'maintenance', location: 'Nave 2 - Zona Pegado', notes: 'En mantenimiento preventivo', createdAt: new Date('2023-09-10'), updatedAt: new Date('2024-10-08') },
  { id: '5', code: 'MAQ-005', name: 'Slotter Impresora', type: 'Slotter', brand: 'Dong Fang', model: 'DF-920', status: 'available', location: 'Nave 1 - Zona Slotter', notes: 'Impresion y ranurado de cajas RSC', createdAt: new Date('2023-10-05'), updatedAt: new Date('2024-10-05') },
  { id: '6', code: 'MAQ-006', name: 'Suajadora Rotativa', type: 'Suajadora', brand: 'Mitsubishi', model: 'TR-850', status: 'running', location: 'Nave 2 - Zona Suajado', notes: 'Suajado rotativo alta velocidad', createdAt: new Date('2024-01-20'), updatedAt: new Date('2024-10-14') },
];

const operators: Operator[] = [
  { id: '1', employeeCode: 'OP-001', name: 'Carlos Mendoza', shift: 'morning', specialty: 'Operador Corrugadora', active: true, phone: '+52 55 1234 5678', email: 'carlos.mendoza@empresa.com', hireDate: new Date('2020-03-15'), createdAt: new Date('2020-03-15'), updatedAt: new Date('2024-01-10') },
  { id: '2', employeeCode: 'OP-002', name: 'Ana Rodriguez', shift: 'morning', specialty: 'Operadora Flexografia', active: true, phone: '+52 55 2345 6789', email: 'ana.rodriguez@empresa.com', hireDate: new Date('2019-07-20'), createdAt: new Date('2019-07-20'), updatedAt: new Date('2024-02-15') },
  { id: '3', employeeCode: 'OP-003', name: 'Miguel Torres', shift: 'afternoon', specialty: 'Operador Troquelado', active: true, phone: '+52 55 3456 7890', email: 'miguel.torres@empresa.com', hireDate: new Date('2021-01-10'), createdAt: new Date('2021-01-10'), updatedAt: new Date('2024-03-20') },
  { id: '4', employeeCode: 'OP-004', name: 'Laura Sanchez', shift: 'afternoon', specialty: 'Inspectora de Calidad', active: true, phone: '+52 55 4567 8901', email: 'laura.sanchez@empresa.com', hireDate: new Date('2018-11-05'), createdAt: new Date('2018-11-05'), updatedAt: new Date('2024-04-10') },
  { id: '5', employeeCode: 'OP-005', name: 'Roberto Hernandez', shift: 'night', specialty: 'Ensamble y Pegado', active: true, phone: '+52 55 5678 9012', email: 'roberto.hernandez@empresa.com', hireDate: new Date('2022-06-15'), createdAt: new Date('2022-06-15'), updatedAt: new Date('2024-05-01') },
  { id: '6', employeeCode: 'OP-006', name: 'Patricia Morales', shift: 'morning', specialty: 'Supervision General', active: false, phone: '+52 55 6789 0123', email: 'patricia.morales@empresa.com', hireDate: new Date('2017-09-20'), createdAt: new Date('2017-09-20'), updatedAt: new Date('2024-06-15') },
];

const processes: ManufacturingProcess[] = [
  { id: '1', code: 'PRC-001', name: 'Corrugado', type: 'Corrugado', description: 'Formado de lamina corrugada a partir de papel liner y medium', requiresMachine: true, machineId: '1', estimatedTimeMin: 15, sequence: 1, status: 'active', createdAt: new Date('2024-10-01'), updatedAt: new Date('2024-10-15') },
  { id: '2', code: 'PRC-002', name: 'Impresion Flexografica', type: 'Impresion', description: 'Impresion de graficos y texto en lamina', requiresMachine: true, machineId: '2', estimatedTimeMin: 25, sequence: 2, status: 'active', createdAt: new Date('2024-10-01'), updatedAt: new Date('2024-10-15') },
  { id: '3', code: 'PRC-003', name: 'Troquelado', type: 'Troquelado', description: 'Corte y hendido de lamina segun diseño', requiresMachine: true, machineId: '3', estimatedTimeMin: 20, sequence: 3, status: 'active', createdAt: new Date('2024-10-05'), updatedAt: new Date('2024-10-10') },
  { id: '4', code: 'PRC-004', name: 'Pegado', type: 'Pegado', description: 'Pegado manual o automatico de solapas', requiresMachine: false, machineId: null, estimatedTimeMin: 10, sequence: 4, status: 'active', createdAt: new Date('2024-10-08'), updatedAt: new Date('2024-10-14') },
  { id: '5', code: 'PRC-005', name: 'Ensamble Manual', type: 'Ensamble', description: 'Armado y ensamble manual de piezas complejas', requiresMachine: false, machineId: null, estimatedTimeMin: 30, sequence: 5, status: 'active', createdAt: new Date('2024-10-08'), updatedAt: new Date('2024-10-14') },
  { id: '6', code: 'PRC-006', name: 'Ranurado (Slotter)', type: 'Slotter', description: 'Ranurado e impresion simultanea para cajas RSC', requiresMachine: true, machineId: '5', estimatedTimeMin: 18, sequence: 2, status: 'active', createdAt: new Date('2024-10-10'), updatedAt: new Date('2024-10-12') },
  { id: '7', code: 'PRC-007', name: 'Inspeccion de Calidad', type: 'Calidad', description: 'Revision visual y dimensional del producto', requiresMachine: false, machineId: null, estimatedTimeMin: 10, sequence: 6, status: 'active', createdAt: new Date('2024-10-10'), updatedAt: new Date('2024-10-12') },
  { id: '8', code: 'PRC-008', name: 'Empaque y Flejado', type: 'Empaque', description: 'Empaque en paquetes y flejado para envio', requiresMachine: false, machineId: null, estimatedTimeMin: 15, sequence: 7, status: 'active', createdAt: new Date('2024-10-10'), updatedAt: new Date('2024-10-12') },
];

const productions: Production[] = [
  { id: '1', processId: '1', machineId: '1', operatorId: '1', startTime: new Date('2024-10-15T08:00:00'), endTime: new Date('2024-10-15T12:30:00'), goodParts: 450, scrapParts: 12, notes: 'Produccion normal de lamina BC', createdAt: new Date('2024-10-15'), updatedAt: new Date('2024-10-15') },
  { id: '2', processId: '2', machineId: '2', operatorId: '2', startTime: new Date('2024-10-15T13:00:00'), endTime: null, goodParts: 200, scrapParts: 8, notes: 'Impresion caja display en curso', createdAt: new Date('2024-10-15'), updatedAt: new Date('2024-10-15') },
  { id: '3', processId: '4', machineId: null, operatorId: '5', startTime: new Date('2024-10-14T14:00:00'), endTime: new Date('2024-10-14T18:00:00'), goodParts: 800, scrapParts: 15, notes: 'Pegado manual de display', createdAt: new Date('2024-10-14'), updatedAt: new Date('2024-10-14') },
  { id: '4', processId: '5', machineId: null, operatorId: '5', startTime: new Date('2024-10-14T22:00:00'), endTime: new Date('2024-10-15T06:00:00'), goodParts: 300, scrapParts: 5, notes: 'Ensamble nocturno de charolas', createdAt: new Date('2024-10-14'), updatedAt: new Date('2024-10-15') },
];

const employees: Employee[] = [
  { id: '1', code: 'EMP-001', name: 'Carlos Mendoza', position: 'Operador Senior', department: 'Produccion', email: 'carlos.mendoza@empresa.com', phone: '+52 55 1234 5678', salary: 28000, hireDate: new Date('2020-03-15'), status: 'active' },
  { id: '2', code: 'EMP-002', name: 'Ana Rodriguez', position: 'Ingeniera de Procesos', department: 'Ingenieria', email: 'ana.rodriguez@empresa.com', phone: '+52 55 2345 6789', salary: 45000, hireDate: new Date('2019-07-20'), status: 'active' },
  { id: '3', code: 'EMP-003', name: 'Miguel Torres', position: 'Operador Troqueladora', department: 'Produccion', email: 'miguel.torres@empresa.com', phone: '+52 55 3456 7890', salary: 38000, hireDate: new Date('2021-01-10'), status: 'active' },
  { id: '4', code: 'EMP-004', name: 'Laura Sanchez', position: 'Inspectora de Calidad', department: 'Calidad', email: 'laura.sanchez@empresa.com', phone: '+52 55 4567 8901', salary: 25000, hireDate: new Date('2018-11-05'), status: 'active' },
  { id: '5', code: 'EMP-005', name: 'Roberto Hernandez', position: 'Tecnico de Mantenimiento', department: 'Mantenimiento', email: 'roberto.hernandez@empresa.com', phone: '+52 55 5678 9012', salary: 22000, hireDate: new Date('2022-06-15'), status: 'active' },
  { id: '6', code: 'EMP-006', name: 'Patricia Morales', position: 'Supervisora de Produccion', department: 'Produccion', email: 'patricia.morales@empresa.com', phone: '+52 55 6789 0123', salary: 52000, hireDate: new Date('2017-09-20'), status: 'vacation' },
  { id: '7', code: 'EMP-007', name: 'Fernando Gutierrez', position: 'Gerente de Planta', department: 'Direccion', email: 'fernando.gutierrez@empresa.com', phone: '+52 55 7890 1234', salary: 85000, hireDate: new Date('2015-02-01'), status: 'active' },
  { id: '8', code: 'EMP-008', name: 'Maria Elena Diaz', position: 'Coordinadora de RRHH', department: 'Recursos Humanos', email: 'maria.diaz@empresa.com', phone: '+52 55 8901 2345', salary: 35000, hireDate: new Date('2019-04-10'), status: 'active' },
  { id: '9', code: 'EMP-009', name: 'Jose Luis Ramirez', position: 'Almacenista', department: 'Almacen', email: 'jose.ramirez@empresa.com', phone: '+52 55 9012 3456', salary: 18000, hireDate: new Date('2023-01-15'), status: 'active' },
  { id: '10', code: 'EMP-010', name: 'Sandra Perez', position: 'Contadora', department: 'Finanzas', email: 'sandra.perez@empresa.com', phone: '+52 55 0123 4567', salary: 42000, hireDate: new Date('2018-08-20'), status: 'inactive' },
];

const inventoryItems: InventoryItem[] = [
  { id: '1', code: 'INV-001', name: 'Lamina Corrugada BC Kraft', category: 'raw_material', warehouse: 'materia_prima', quantity: 800, minStock: 200, maxStock: 1500, unitCost: 18.50, unit: 'lamina', location: 'MP-A-01', lastMovement: new Date('2024-10-14') },
  { id: '2', code: 'INV-002', name: 'Lamina Corrugada C Blanca', category: 'raw_material', warehouse: 'materia_prima', quantity: 500, minStock: 150, maxStock: 1000, unitCost: 22.00, unit: 'lamina', location: 'MP-A-02', lastMovement: new Date('2024-10-12') },
  { id: '3', code: 'INV-003', name: 'Cartulina Sulfatada Cal.14', category: 'raw_material', warehouse: 'materia_prima', quantity: 1200, minStock: 300, maxStock: 2000, unitCost: 8.00, unit: 'pliego', location: 'MP-B-01', lastMovement: new Date('2024-10-15') },
  { id: '4', code: 'INV-004', name: 'Tinta Flexo Cyan', category: 'consumable', warehouse: 'materia_prima', quantity: 15, minStock: 5, maxStock: 25, unitCost: 450.00, unit: 'cubeta', location: 'MP-C-01', lastMovement: new Date('2024-10-10') },
  { id: '5', code: 'INV-005', name: 'Pegamento PVA Industrial', category: 'consumable', warehouse: 'materia_prima', quantity: 8, minStock: 3, maxStock: 15, unitCost: 280.00, unit: 'cubeta', location: 'MP-C-02', lastMovement: new Date('2024-10-08') },
  { id: '6', code: 'INV-006', name: 'Suaje Troquel Caja 40x30', category: 'tool', warehouse: 'materia_prima', quantity: 3, minStock: 1, maxStock: 5, unitCost: 3500.00, unit: 'pza', location: 'MP-D-01', lastMovement: new Date('2024-10-13') },
  { id: '7', code: 'INV-007', name: 'Caja Corrugada 40x30x20', category: 'finished_product', warehouse: 'producto_terminado', quantity: 500, minStock: 100, maxStock: 2000, unitCost: 22.00, unit: 'pza', location: 'PT-A-01', lastMovement: new Date('2024-10-11') },
  { id: '8', code: 'INV-008', name: 'Caja Troquelada Display', category: 'finished_product', warehouse: 'producto_terminado', quantity: 200, minStock: 50, maxStock: 500, unitCost: 38.00, unit: 'pza', location: 'PT-A-02', lastMovement: new Date('2024-10-09') },
  { id: '9', code: 'INV-009', name: 'Fleje Plastico 12mm', category: 'consumable', warehouse: 'materia_prima', quantity: 20, minStock: 5, maxStock: 30, unitCost: 85.00, unit: 'rollo', location: 'MP-C-03', lastMovement: new Date('2024-10-09') },
];

const serviceOrders: ServiceOrder[] = [
  { id: '1', code: 'MNT-001', type: 'preventive', machineId: '1', description: 'Mantenimiento preventivo mensual - Corrugadora BHS', priority: 'medium', status: 'completed', assignedTo: 'Roberto Hernandez', estimatedHours: 4, actualHours: 3.5, createdAt: new Date('2024-10-01'), completedAt: new Date('2024-10-01') },
  { id: '2', code: 'MNT-002', type: 'corrective', machineId: '4', description: 'Reparacion sistema de aplicacion de pegamento', priority: 'high', status: 'in_progress', assignedTo: 'Roberto Hernandez', estimatedHours: 8, createdAt: new Date('2024-10-12') },
  { id: '3', code: 'MNT-003', type: 'preventive', machineId: '2', description: 'Limpieza y calibracion de rodillos anilox', priority: 'medium', status: 'pending', assignedTo: 'Miguel Torres', estimatedHours: 6, createdAt: new Date('2024-10-14') },
  { id: '4', code: 'MNT-004', type: 'predictive', machineId: '3', description: 'Revision de cuchillas y platinas de troqueladora', priority: 'low', status: 'pending', assignedTo: 'Roberto Hernandez', estimatedHours: 2, createdAt: new Date('2024-10-15') },
  { id: '5', code: 'MNT-005', type: 'corrective', machineId: '6', description: 'Cambio de rodamientos en rodillo de presion', priority: 'critical', status: 'in_progress', assignedTo: 'Roberto Hernandez', estimatedHours: 12, createdAt: new Date('2024-10-14') },
];

// ── SIMULATED DELAY ───────────────────────────────────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ── API FUNCTIONS ─────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  await delay(300);
  return [...products];
}

export async function fetchParts(): Promise<Part[]> {
  await delay(300);
  return [...parts];
}

export async function fetchMachines(): Promise<Machine[]> {
  await delay(300);
  return [...machines];
}

export async function fetchOperators(): Promise<Operator[]> {
  await delay(300);
  return [...operators];
}

export async function fetchProcesses(): Promise<ManufacturingProcess[]> {
  await delay(300);
  return [...processes];
}

export async function fetchProductions(): Promise<Production[]> {
  await delay(300);
  return [...productions];
}

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(300);
  return [...employees];
}

export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  await delay(300);
  return [...inventoryItems];
}

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  await delay(300);
  return [...serviceOrders];
}

// ── DASHBOARD ─────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalProduction: number;
  productionChange: number;
  efficiency: number;
  efficiencyChange: number;
  scrapRate: number;
  scrapRateChange: number;
  machinesRunning: number;
  machinesAvailable: number;
  machinesMaintenance: number;
  activeOperators: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockItems: number;
  criticalAlerts: number;
}

export async function fetchDashboardKPIs(): Promise<DashboardKPIs> {
  await delay(200);
  return {
    totalProduction: 12480,
    productionChange: 8.5,
    efficiency: 92.7,
    efficiencyChange: 1.8,
    scrapRate: 3.1,
    scrapRateChange: -0.4,
    machinesRunning: 3,
    machinesAvailable: 2,
    machinesMaintenance: 1,
    activeOperators: 5,
    pendingOrders: 8,
    completedOrders: 145,
    lowStockItems: 2,
    criticalAlerts: 3,
  };
}

export interface ProductionChartData {
  date: string;
  produced: number;
  target: number;
  scrap: number;
}

export async function fetchProductionChartData(): Promise<ProductionChartData[]> {
  await delay(200);
  return [
    { date: '01 Oct', produced: 1420, target: 1500, scrap: 42 },
    { date: '02 Oct', produced: 1680, target: 1500, scrap: 55 },
    { date: '03 Oct', produced: 1390, target: 1500, scrap: 38 },
    { date: '04 Oct', produced: 1710, target: 1500, scrap: 48 },
    { date: '05 Oct', produced: 1545, target: 1500, scrap: 40 },
    { date: '06 Oct', produced: 800, target: 800, scrap: 15 },
    { date: '07 Oct', produced: 780, target: 800, scrap: 14 },
    { date: '08 Oct', produced: 1665, target: 1500, scrap: 44 },
    { date: '09 Oct', produced: 1720, target: 1500, scrap: 56 },
    { date: '10 Oct', produced: 1590, target: 1500, scrap: 41 },
    { date: '11 Oct', produced: 1475, target: 1500, scrap: 33 },
    { date: '12 Oct', produced: 1540, target: 1500, scrap: 39 },
    { date: '13 Oct', produced: 790, target: 800, scrap: 16 },
    { date: '14 Oct', produced: 810, target: 800, scrap: 17 },
    { date: '15 Oct', produced: 965, target: 1500, scrap: 14 },
  ];
}

export interface MachineUtilization {
  machineId: string;
  machineName: string;
  utilization: number;
  uptime: number;
  downtime: number;
}

export async function fetchMachineUtilization(): Promise<MachineUtilization[]> {
  await delay(200);
  return [
    { machineId: '1', machineName: 'Corrugadora BHS', utilization: 87, uptime: 420, downtime: 60 },
    { machineId: '2', machineName: 'Flexo Ward 4T', utilization: 72, uptime: 345, downtime: 135 },
    { machineId: '3', machineName: 'Troqueladora Bobst', utilization: 91, uptime: 436, downtime: 44 },
    { machineId: '5', machineName: 'Slotter DF-920', utilization: 65, uptime: 312, downtime: 168 },
    { machineId: '6', machineName: 'Suajadora Mitsubishi', utilization: 83, uptime: 398, downtime: 82 },
  ];
}

// ── HELPERS ───────────────────────────────────────────────────────

export function getPartById(id: string): Part | undefined {
  return parts.find(p => p.id === id);
}

export function getMachineById(id: string): Machine | undefined {
  return machines.find(m => m.id === id);
}

export function getOperatorById(id: string): Operator | undefined {
  return operators.find(o => o.id === id);
}

export function getProcessById(id: string): ManufacturingProcess | undefined {
  return processes.find(p => p.id === id);
}

// ── EXTENDED API OBJECT ───────────────────────────────────────────

export const api = {
  getDashboardKPIs: fetchDashboardKPIs,
  getProductionData: async () => {
    const data = await fetchProductionChartData();
    return data.map(d => ({ label: d.date, produced: d.produced, target: d.target }));
  },
  getMachineStatus: async () => {
    const ms = await fetchMachines();
    return ms.map(m => ({ id: m.id, name: m.name, status: m.status, utilization: 0, currentJob: m.status === 'running' ? 'En produccion' : null }));
  },
  getRecentActivity: async () => {
    await delay(200);
    return [
      { id: '1', type: 'production', message: 'Lote 1,500 cajas 40x30 completado', time: 'Hace 5 min', user: 'Carlos Mendoza' },
      { id: '2', type: 'maintenance', message: 'Mantenimiento iniciado en Pegadora', time: 'Hace 15 min', user: 'Roberto Hernandez' },
      { id: '3', type: 'quality', message: 'Inspeccion aprobada lote #1245', time: 'Hace 30 min', user: 'Laura Sanchez' },
      { id: '4', type: 'inventory', message: 'Stock bajo: Tinta Flexo Magenta', time: 'Hace 1 hora', user: 'Sistema' },
      { id: '5', type: 'production', message: 'Nueva OT para cajas pizza creada', time: 'Hace 2 horas', user: 'Ana Rodriguez' },
    ];
  },
  getWorkOrders: fetchProductions,
  getMachines: fetchMachines,
  getOperators: fetchOperators,
  getProducts: fetchProducts,
  getParts: fetchParts,
  getProcesses: fetchProcesses,
  getEmployees: fetchEmployees,
  getInventory: fetchInventoryItems,
  getServiceOrders: fetchServiceOrders,
  getWarehouseLocations: async () => {
    await delay(200);
    return [
      { id: '1', name: 'MP-A', zone: 'Materia Prima - Laminas', type: 'Rack', capacity: 2000, occupancy: 65 },
      { id: '2', name: 'MP-B', zone: 'Materia Prima - Cartulina', type: 'Rack', capacity: 3000, occupancy: 40 },
      { id: '3', name: 'MP-C', zone: 'Materia Prima - Consumibles', type: 'Estante', capacity: 100, occupancy: 70 },
      { id: '4', name: 'MP-D', zone: 'Materia Prima - Herramental', type: 'Gabinete', capacity: 50, occupancy: 30 },
      { id: '5', name: 'PT-A', zone: 'Producto Terminado - Cajas', type: 'Rack', capacity: 5000, occupancy: 55 },
      { id: '6', name: 'PT-B', zone: 'Producto Terminado - Plegadizas', type: 'Rack', capacity: 3000, occupancy: 45 },
    ];
  },
};
