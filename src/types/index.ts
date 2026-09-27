export type EquipmentType = 'Notebook' | 'Computador' | 'Desktop' | 'All-in-One' | 'Outro';

export type ServiceOrderStatus =
  | 'Aguardando diagnóstico'
  | 'Em diagnóstico'
  | 'Aguardando aprovação'
  | 'Aguardando peça'
  | 'Em manutenção'
  | 'Pronto para retirada'
  | 'Entregue'
  | 'Cancelado';

export type PaymentMethod =
  | 'Pix'
  | 'Cartão de Crédito'
  | 'Cartão de Débito'
  | 'Boleto'
  | 'Dinheiro'
  | 'A definir';

export interface Customer {
  id: string;
  fullName: string;
  document: string; // CPF or CNPJ
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  customerId: string;
  customerName?: string;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  assetTag: string; // Patrimônio
  accessories: string; // Cabos, carregador, etc.
  password: string; // Senha do equipamento
  physicalCondition: string; // Estado físico
  notes: string;
  photos: string[]; // URLs or base64 data
  createdAt: string;
  updatedAt: string;
}

export interface ServicePart {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface StatusHistoryEntry {
  id: string;
  status: ServiceOrderStatus;
  timestamp: string;
  technician: string;
  notes: string;
}

export interface BudgetApproval {
  status: 'Pendente' | 'Aprovado' | 'Recusado' | 'Não enviado';
  respondedAt?: string;
  clientName?: string;
  notes?: string;
}

export interface ServiceOrder {
  id: string; // e.g. "OS-1001"
  orderNumber: number; // 1001
  accessCode: string; // Unique public short tracking code, e.g. "8F72K"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  equipmentId: string;
  equipmentSummary: {
    type: EquipmentType;
    brand: string;
    model: string;
    serialNumber: string;
    photos?: string[];
  };
  entryDate: string;
  estimatedDeliveryDate: string;
  clientReportedIssue: string;
  technicalDiagnosis: string;
  servicePerformed: string;
  partsUsed: ServicePart[];
  partsTotal: number;
  laborTotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pendente' | 'Pago' | 'Faturado';
  responsibleTechnician: string;
  internalNotes: string; // Hidden from public
  publicNotes: string;
  status: ServiceOrderStatus;
  budgetApproval: BudgetApproval;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  text: string;
  date: string;
  relativeTimeDescription: string;
  profilePhotoUrl?: string;
  source: 'google' | 'manual';
  verified: boolean;
}

export interface CompanySettings {
  name: string;
  tradeName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cityState: string;
  openingHours: string;
  instagram?: string;
  googleRating: number;
  totalReviewsCount: number;
  googleReviewUrl: string;
  googleMapsUrl: string;
  whatsappMessageTemplate: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'tecnico';
  createdAt: string;
}

export interface PublicServiceRequest {
  id: string;
  fullName: string;
  whatsapp: string;
  email: string;
  deviceType: EquipmentType;
  brandModel: string;
  reportedIssue: string;
  preferredContact: 'WhatsApp' | 'Telefone' | 'E-mail';
  createdAt: string;
  status: 'Novo' | 'Em contato' | 'Convertido em OS' | 'Finalizado';
}
