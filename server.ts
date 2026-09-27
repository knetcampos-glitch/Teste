import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { db, hashPassword, verifyPassword, generateAccessCode } from './server/db.ts';
import type {
  ServiceOrderStatus,
  ServiceOrder,
  Customer,
  Equipment,
  GoogleReview,
  PublicServiceRequest,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth Middleware for Admin Routes
function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const d = db.getData();
  const session = d.sessions.find((s) => s.token === token);

  if (!session) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }

  if (Date.now() > session.expiresAt) {
    d.sessions = d.sessions.filter((s) => s.token !== token);
    db.save();
    res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    return;
  }

  const user = d.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'Usuário não encontrado.' });
    return;
  }

  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Company Info
app.get('/api/public/company', (_req: Request, res: Response) => {
  const { company } = db.getData();
  res.json(company);
});

// Reviews List & Stats
app.get('/api/public/reviews', (_req: Request, res: Response) => {
  const { reviews, company } = db.getData();
  res.json({
    rating: company.googleRating,
    totalReviews: company.totalReviewsCount,
    googleReviewUrl: company.googleReviewUrl,
    reviews,
  });
});

// Create Public Service Request (Solicitar Atendimento)
app.post('/api/public/service-request', (req: Request, res: Response) => {
  const { fullName, whatsapp, email, deviceType, brandModel, reportedIssue, preferredContact } = req.body;
  if (!fullName || !whatsapp || !deviceType || !reportedIssue) {
    res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    return;
  }

  const d = db.getData();
  const newReq: PublicServiceRequest = {
    id: `req-${Date.now()}`,
    fullName,
    whatsapp,
    email: email || '',
    deviceType,
    brandModel: brandModel || '',
    reportedIssue,
    preferredContact: preferredContact || 'WhatsApp',
    createdAt: new Date().toISOString(),
    status: 'Novo',
  };

  d.serviceRequests.unshift(newReq);
  db.save();

  res.status(201).json({ success: true, message: 'Solicitação recebida com sucesso! Entraremos em contato.', request: newReq });
});

// Public Search for OS
app.get('/api/public/os/search', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toUpperCase();
  const phoneOrCpf = (req.query.doc as string || '').replace(/\D/g, '');

  if (!query) {
    res.status(400).json({ error: 'Informe o número da OS ou código de rastreamento.' });
    return;
  }

  const d = db.getData();
  const cleanQuery = query.replace('#', '').replace('OS-', '');

  const order = d.orders.find((o) => {
    const matchCode = o.accessCode.toUpperCase() === query;
    const matchId = o.id.toUpperCase() === query || o.id.replace('OS-', '') === cleanQuery;
    const matchNumber = String(o.orderNumber) === cleanQuery;
    return matchCode || matchId || matchNumber;
  });

  if (!order) {
    res.status(404).json({ error: 'Nenhuma Ordem de Serviço encontrada com os dados informados.' });
    return;
  }

  // If a secondary verification is requested by user
  if (phoneOrCpf) {
    const customer = d.customers.find((c) => c.id === order.customerId);
    const cleanPhone = (customer?.phone || '').replace(/\D/g, '');
    const cleanWhatsapp = (customer?.whatsapp || '').replace(/\D/g, '');
    const cleanCpf = (customer?.document || '').replace(/\D/g, '');

    const phoneMatch = cleanPhone.includes(phoneOrCpf) || cleanWhatsapp.includes(phoneOrCpf);
    const cpfMatch = cleanCpf.includes(phoneOrCpf);

    if (!phoneMatch && !cpfMatch) {
      res.status(403).json({ error: 'O telefone ou CPF informado não confere com o cadastro da OS.' });
      return;
    }
  }

  // Sanitize order for public consumption (strip internal notes)
  const sanitized = sanitizeOrderForPublic(order);
  res.json(sanitized);
});

// Public Get OS by Unique Access Code (e.g. /os/8F72K)
app.get('/api/public/os/:code', (req: Request, res: Response) => {
  const code = req.params.code.trim().toUpperCase();
  const d = db.getData();

  const order = d.orders.find(
    (o) => o.accessCode.toUpperCase() === code || o.id.toUpperCase() === code || String(o.orderNumber) === code
  );

  if (!order) {
    res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    return;
  }

  res.json(sanitizeOrderForPublic(order));
});

// Client Budget Action (Aprovar / Recusar Orçamento)
app.post('/api/public/os/:code/budget-action', (req: Request, res: Response) => {
  const code = req.params.code.trim().toUpperCase();
  const { action, clientName, notes } = req.body;

  if (!['Aprovar', 'Recusar'].includes(action)) {
    res.status(400).json({ error: 'Ação inválida. Escolha Aprovar ou Recusar.' });
    return;
  }

  const d = db.getData();
  const order = d.orders.find(
    (o) => o.accessCode.toUpperCase() === code || o.id.toUpperCase() === code
  );

  if (!order) {
    res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    return;
  }

  const timestamp = new Date().toISOString();
  const isApproved = action === 'Aprovar';

  order.budgetApproval = {
    status: isApproved ? 'Aprovado' : 'Recusado',
    respondedAt: timestamp,
    clientName: clientName || order.customerName,
    notes: notes || '',
  };

  // If approved, update status to 'Em manutenção'
  // If declined, update status to 'Cancelado' or add note
  if (isApproved) {
    order.status = 'Em manutenção';
    order.statusHistory.push({
      id: `hist-${Date.now()}`,
      status: 'Em manutenção',
      timestamp,
      technician: 'Portal do Cliente (Aprovação Online)',
      notes: `Orçamento aprovado pelo cliente (${clientName || order.customerName}). ${notes ? `Obs: ${notes}` : ''}`,
    });
  } else {
    order.statusHistory.push({
      id: `hist-${Date.now()}`,
      status: order.status,
      timestamp,
      technician: 'Portal do Cliente (Recusa Online)',
      notes: `Orçamento RECUSADO pelo cliente (${clientName || order.customerName}). ${notes ? `Motivo: ${notes}` : ''}`,
    });
  }

  order.updatedAt = timestamp;
  db.save();

  res.json({
    success: true,
    message: isApproved ? 'Orçamento aprovado com sucesso! Já iniciamos a manutenção.' : 'Resposta registrada com sucesso. Entraremos em contato.',
    order: sanitizeOrderForPublic(order),
  });
});

function sanitizeOrderForPublic(order: ServiceOrder) {
  // Strip internal notes, leave public details
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    accessCode: order.accessCode,
    customerName: order.customerName,
    equipmentSummary: order.equipmentSummary,
    entryDate: order.entryDate,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    clientReportedIssue: order.clientReportedIssue,
    technicalDiagnosis: order.technicalDiagnosis,
    servicePerformed: order.servicePerformed,
    partsUsed: order.partsUsed,
    partsTotal: order.partsTotal,
    laborTotal: order.laborTotal,
    discount: order.discount,
    totalAmount: order.totalAmount,
    status: order.status,
    budgetApproval: order.budgetApproval,
    publicNotes: order.publicNotes,
    statusHistory: order.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      timestamp: h.timestamp,
      technician: h.technician,
      notes: h.notes,
    })),
    updatedAt: order.updatedAt,
  };
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    return;
  }

  const d = db.getData();
  const cleanUser = username.trim().toLowerCase();
  const user = d.users.find(
    (u) =>
      u.username.toLowerCase() === cleanUser ||
      u.email.toLowerCase() === cleanUser ||
      (cleanUser === 'admin' && u.role === 'admin') ||
      (cleanUser === 'admin@techfix.com.br' && u.role === 'admin')
  );

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    return;
  }

  // Create session token valid for 7 days
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

  d.sessions.push({ token, userId: user.id, expiresAt });
  db.save();

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

app.get('/api/auth/me', requireAdminAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

app.post('/api/auth/logout', requireAdminAuth, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const d = db.getData();
    d.sessions = d.sessions.filter((s) => s.token !== token);
    db.save();
  }
  res.json({ success: true });
});

app.post('/api/auth/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = (req as any).user;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
    return;
  }

  const d = db.getData();
  const dbUser = d.users.find((u) => u.id === user.id);
  if (!dbUser || !verifyPassword(currentPassword, dbUser.passwordHash, dbUser.salt)) {
    res.status(400).json({ error: 'Senha atual incorreta.' });
    return;
  }

  const updatedCreds = hashPassword(newPassword);
  dbUser.passwordHash = updatedCreds.hash;
  dbUser.salt = updatedCreds.salt;
  db.save();

  res.json({ success: true, message: 'Senha alterada com sucesso!' });
});

// -------------------------------------------------------------
// PROTECTED ADMIN API ROUTES
// -------------------------------------------------------------

// Dashboard metrics
app.get('/api/admin/dashboard', requireAdminAuth, (_req: Request, res: Response) => {
  const d = db.getData();
  const orders = d.orders;

  const countByStatus: Record<string, number> = {
    'Aguardando diagnóstico': 0,
    'Em diagnóstico': 0,
    'Aguardando aprovação': 0,
    'Aguardando peça': 0,
    'Em manutenção': 0,
    'Pronto para retirada': 0,
    'Entregue': 0,
    'Cancelado': 0,
  };

  let totalRevenue = 0;
  let activeOrdersCount = 0;

  orders.forEach((o) => {
    if (countByStatus[o.status] !== undefined) {
      countByStatus[o.status]++;
    }
    if (o.status !== 'Entregue' && o.status !== 'Cancelado') {
      activeOrdersCount++;
    }
    if (o.paymentStatus === 'Pago' || o.status === 'Entregue') {
      totalRevenue += o.totalAmount;
    }
  });

  res.json({
    totalCustomers: d.customers.length,
    totalEquipments: d.equipments.length,
    totalOrders: orders.length,
    activeOrdersCount,
    totalRevenue,
    countByStatus,
    recentOrders: orders.slice(0, 6),
    newServiceRequestsCount: d.serviceRequests.filter((r) => r.status === 'Novo').length,
  });
});

// Customers CRUD
app.get('/api/admin/customers', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getData().customers);
});

app.post('/api/admin/customers', requireAdminAuth, (req: Request, res: Response) => {
  const { fullName, document, phone, whatsapp, email, address, notes } = req.body;
  if (!fullName || !phone) {
    res.status(400).json({ error: 'Nome completo e telefone são obrigatórios.' });
    return;
  }

  const d = db.getData();
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    fullName,
    document: document || '',
    phone,
    whatsapp: (whatsapp || phone).replace(/\D/g, ''),
    email: email || '',
    address: address || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  d.customers.unshift(newCustomer);
  db.save();
  res.status(201).json(newCustomer);
});

app.put('/api/admin/customers/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();
  const idx = d.customers.findIndex((c) => c.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Cliente não encontrado.' });
    return;
  }

  const existing = d.customers[idx];
  const updated: Customer = {
    ...existing,
    ...req.body,
    id: existing.id,
    whatsapp: (req.body.whatsapp || req.body.phone || existing.whatsapp).replace(/\D/g, ''),
    updatedAt: new Date().toISOString(),
  };

  d.customers[idx] = updated;

  // Also update customerName in related orders and equipments
  d.orders.forEach((o) => {
    if (o.customerId === id) {
      o.customerName = updated.fullName;
      o.customerPhone = updated.phone;
      o.customerWhatsapp = updated.whatsapp;
    }
  });

  d.equipments.forEach((e) => {
    if (e.customerId === id) {
      e.customerName = updated.fullName;
    }
  });

  db.save();
  res.json(updated);
});

app.delete('/api/admin/customers/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();

  // Check if has orders
  const hasOrders = d.orders.some((o) => o.customerId === id);
  if (hasOrders) {
    res.status(400).json({ error: 'Não é possível excluir um cliente com Ordens de Serviço vinculadas.' });
    return;
  }

  d.customers = d.customers.filter((c) => c.id !== id);
  d.equipments = d.equipments.filter((e) => e.customerId !== id);
  db.save();
  res.json({ success: true });
});

// Equipments CRUD
app.get('/api/admin/equipments', requireAdminAuth, (req: Request, res: Response) => {
  const customerId = req.query.customerId as string;
  const { equipments } = db.getData();
  if (customerId) {
    res.json(equipments.filter((e) => e.customerId === customerId));
  } else {
    res.json(equipments);
  }
});

app.post('/api/admin/equipments', requireAdminAuth, (req: Request, res: Response) => {
  const { customerId, type, brand, model, serialNumber, assetTag, accessories, password, physicalCondition, notes, photos } = req.body;

  if (!customerId || !type || !brand || !model) {
    res.status(400).json({ error: 'Cliente, tipo, marca e modelo são obrigatórios.' });
    return;
  }

  const d = db.getData();
  const customer = d.customers.find((c) => c.id === customerId);

  const newEquip: Equipment = {
    id: `eq-${Date.now()}`,
    customerId,
    customerName: customer?.fullName || 'Cliente',
    type,
    brand,
    model,
    serialNumber: serialNumber || '',
    assetTag: assetTag || '',
    accessories: accessories || '',
    password: password || '',
    physicalCondition: physicalCondition || '',
    notes: notes || '',
    photos: Array.isArray(photos) ? photos : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  d.equipments.unshift(newEquip);
  db.save();
  res.status(201).json(newEquip);
});

app.put('/api/admin/equipments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();
  const idx = d.equipments.findIndex((e) => e.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Equipamento não encontrado.' });
    return;
  }

  const existing = d.equipments[idx];
  const updated: Equipment = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  d.equipments[idx] = updated;

  // Update in open orders if necessary
  d.orders.forEach((o) => {
    if (o.equipmentId === id) {
      o.equipmentSummary = {
        type: updated.type,
        brand: updated.brand,
        model: updated.model,
        serialNumber: updated.serialNumber,
        photos: updated.photos,
      };
    }
  });

  db.save();
  res.json(updated);
});

app.delete('/api/admin/equipments/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();

  const hasOrders = d.orders.some((o) => o.equipmentId === id);
  if (hasOrders) {
    res.status(400).json({ error: 'Não é possível excluir um equipamento que possui Ordens de Serviço.' });
    return;
  }

  d.equipments = d.equipments.filter((e) => e.id !== id);
  db.save();
  res.json({ success: true });
});

// Orders CRUD
app.get('/api/admin/orders', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getData().orders);
});

app.post('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
  const {
    customerId,
    equipmentId,
    clientReportedIssue,
    technicalDiagnosis,
    servicePerformed,
    partsUsed,
    partsTotal,
    laborTotal,
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus,
    responsibleTechnician,
    internalNotes,
    publicNotes,
    status,
    estimatedDeliveryDate,
  } = req.body;

  if (!customerId || !equipmentId || !clientReportedIssue) {
    res.status(400).json({ error: 'Cliente, equipamento e problema relatado são obrigatórios.' });
    return;
  }

  const d = db.getData();
  const customer = d.customers.find((c) => c.id === customerId);
  const equipment = d.equipments.find((e) => e.id === equipmentId);

  if (!customer || !equipment) {
    res.status(400).json({ error: 'Cliente ou equipamento não localizados.' });
    return;
  }

  d.lastOrderNumber += 1;
  const orderNumber = d.lastOrderNumber;
  const id = `OS-${orderNumber}`;
  const accessCode = generateAccessCode();
  const now = new Date().toISOString();

  const initialStatus: ServiceOrderStatus = status || 'Aguardando diagnóstico';

  const newOrder: ServiceOrder = {
    id,
    orderNumber,
    accessCode,
    customerId: customer.id,
    customerName: customer.fullName,
    customerPhone: customer.phone,
    customerWhatsapp: customer.whatsapp,
    equipmentId: equipment.id,
    equipmentSummary: {
      type: equipment.type,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber,
      photos: equipment.photos,
    },
    entryDate: now,
    estimatedDeliveryDate: estimatedDeliveryDate || new Date(Date.now() + 3 * 86400000).toISOString(),
    clientReportedIssue,
    technicalDiagnosis: technicalDiagnosis || '',
    servicePerformed: servicePerformed || '',
    partsUsed: Array.isArray(partsUsed) ? partsUsed : [],
    partsTotal: Number(partsTotal) || 0,
    laborTotal: Number(laborTotal) || 0,
    discount: Number(discount) || 0,
    totalAmount: Number(totalAmount) || 0,
    paymentMethod: paymentMethod || 'A definir',
    paymentStatus: paymentStatus || 'Pendente',
    responsibleTechnician: responsibleTechnician || (req as any).user.name || 'Técnico Especialista',
    internalNotes: internalNotes || '',
    publicNotes: publicNotes || 'Aparelho recebido para análise na bancada técnica.',
    status: initialStatus,
    budgetApproval: {
      status: initialStatus === 'Aguardando aprovação' ? 'Pendente' : 'Não enviado',
    },
    statusHistory: [
      {
        id: `hist-${Date.now()}`,
        status: initialStatus,
        timestamp: now,
        technician: (req as any).user.name || 'Técnico',
        notes: 'Abertura de Ordem de Serviço.',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  d.orders.unshift(newOrder);
  db.save();

  res.status(201).json(newOrder);
});

app.put('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();
  const idx = d.orders.findIndex((o) => o.id === id);

  if (idx === -1) {
    res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    return;
  }

  const existing = d.orders[idx];
  const oldStatus = existing.status;
  const newStatus: ServiceOrderStatus = req.body.status || oldStatus;
  const now = new Date().toISOString();

  // If status changed, append to history
  let updatedHistory = [...existing.statusHistory];
  if (newStatus !== oldStatus) {
    updatedHistory.push({
      id: `hist-${Date.now()}`,
      status: newStatus,
      timestamp: now,
      technician: (req as any).user.name || 'Técnico',
      notes: req.body.statusChangeNotes || `Status alterado de "${oldStatus}" para "${newStatus}".`,
    });
  }

  const updatedOrder: ServiceOrder = {
    ...existing,
    ...req.body,
    id: existing.id,
    orderNumber: existing.orderNumber,
    accessCode: existing.accessCode,
    status: newStatus,
    statusHistory: updatedHistory,
    updatedAt: now,
  };

  d.orders[idx] = updatedOrder;
  db.save();

  res.json(updatedOrder);
});

// Update order status specifically with history log
app.post('/api/admin/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Novo status é obrigatório.' });
    return;
  }

  const d = db.getData();
  const order = d.orders.find((o) => o.id === id);

  if (!order) {
    res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    return;
  }

  const now = new Date().toISOString();
  order.status = status;
  if (status === 'Aguardando aprovação' && order.budgetApproval.status !== 'Aprovado') {
    order.budgetApproval.status = 'Pendente';
  }

  order.statusHistory.push({
    id: `hist-${Date.now()}`,
    status,
    timestamp: now,
    technician: (req as any).user.name || 'Técnico',
    notes: notes || `Alteração de status para: ${status}`,
  });
  order.updatedAt = now;

  db.save();
  res.json(order);
});

// Delete Order
app.delete('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();
  d.orders = d.orders.filter((o) => o.id !== id);
  db.save();
  res.json({ success: true });
});

// WhatsApp generator endpoint
app.post('/api/admin/orders/:id/whatsapp', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { customTemplate, baseUrl } = req.body;
  const d = db.getData();
  const order = d.orders.find((o) => o.id === id);

  if (!order) {
    res.status(404).json({ error: 'Ordem de Serviço não encontrada.' });
    return;
  }

  const company = d.company;
  const appBaseUrl = baseUrl || process.env.APP_URL || `http://${req.headers.host}`;
  const publicTrackingUrl = `${appBaseUrl}/os/${order.accessCode}`;

  const template = customTemplate || company.whatsappMessageTemplate;
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalAmount);

  const message = template
    .replace('{NOME_EMPRESA}', company.tradeName || company.name)
    .replace('{NUMERO_OS}', String(order.orderNumber).padStart(6, '0'))
    .replace('{NOME_CLIENTE}', order.customerName)
    .replace('{EQUIPAMENTO}', `${order.equipmentSummary.type} ${order.equipmentSummary.brand} ${order.equipmentSummary.model}`)
    .replace('{STATUS}', order.status)
    .replace('{SERVICO}', order.servicePerformed || order.clientReportedIssue)
    .replace('{VALOR}', formattedValue)
    .replace('{LINK_PUBLICO}', publicTrackingUrl);

  const cleanPhone = (order.customerWhatsapp || order.customerPhone).replace(/\D/g, '');
  // Format international number (Brazil +55)
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

  res.json({
    whatsappUrl: waUrl,
    message,
    phone: fullPhone,
    publicTrackingUrl,
  });
});

// Reviews Management
app.get('/api/admin/reviews', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getData().reviews);
});

app.post('/api/admin/reviews', requireAdminAuth, (req: Request, res: Response) => {
  const { authorName, rating, text, date, profilePhotoUrl } = req.body;
  if (!authorName || !text || !rating) {
    res.status(400).json({ error: 'Nome, nota e comentário são obrigatórios.' });
    return;
  }

  const d = db.getData();
  const newRev: GoogleReview = {
    id: `rev-${Date.now()}`,
    authorName,
    rating: Number(rating) || 5,
    text,
    date: date || new Date().toISOString().split('T')[0],
    relativeTimeDescription: 'recentemente',
    profilePhotoUrl: profilePhotoUrl || '',
    source: 'manual',
    verified: true,
  };

  d.reviews.unshift(newRev);
  d.company.totalReviewsCount += 1;
  // Recalculate average
  const total = d.reviews.reduce((acc, r) => acc + r.rating, 0);
  d.company.googleRating = Number((total / d.reviews.length).toFixed(1));

  db.save();
  res.status(201).json(newRev);
});

app.delete('/api/admin/reviews/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const d = db.getData();
  d.reviews = d.reviews.filter((r) => r.id !== id);
  db.save();
  res.json({ success: true });
});

// Settings Management
app.get('/api/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getData().company);
});

app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  const d = db.getData();
  d.company = {
    ...d.company,
    ...req.body,
  };
  db.save();
  res.json(d.company);
});

// Service requests (leads from landing page)
app.get('/api/admin/service-requests', requireAdminAuth, (_req: Request, res: Response) => {
  res.json(db.getData().serviceRequests);
});

app.put('/api/admin/service-requests/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const d = db.getData();
  const item = d.serviceRequests.find((r) => r.id === id);
  if (!item) {
    res.status(404).json({ error: 'Solicitação não encontrada.' });
    return;
  }
  item.status = status;
  db.save();
  res.json(item);
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Tech Assistência] Server running on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode.`);
  });
}

startServer();
