import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  Customer,
  Equipment,
  ServiceOrder,
  GoogleReview,
  CompanySettings,
  PublicServiceRequest,
} from '../src/types/index.ts';

export interface DBUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'tecnico';
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface DBSchema {
  users: DBUser[];
  customers: Customer[];
  equipments: Equipment[];
  orders: ServiceOrder[];
  reviews: GoogleReview[];
  serviceRequests: PublicServiceRequest[];
  company: CompanySettings;
  sessions: { token: string; userId: string; expiresAt: number }[];
  lastOrderNumber: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const chosenSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, chosenSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: chosenSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const result = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return result === hash;
}

export function generateAccessCode(): string {
  // Generates short unique 5-character alphanumeric token, e.g. "8F72K"
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid confusing 0,O,1,I
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getInitialData(): DBSchema {
  const adminCreds = hashPassword('admin123');

  const defaultCompany: CompanySettings = {
    name: 'Tech Assistência - Especializada em Computadores e Notebooks',
    tradeName: 'Tech Assistência Informática',
    cnpj: '38.492.109/0001-44',
    phone: '(62) 99248-2720',
    whatsapp: '62992482720', // pure digits for wa.me/55...
    email: 'contato@techassistencia.com.br',
    address: 'R. 8.25 Q.12 Sala 5 - St. Mal. Rondon - Marechal Rondon',
    cityState: 'Goiânia - GO, 74560-370',
    openingHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado (Não abrimos aos sábados)',
    instagram: '@thec_assistencia',
    googleRating: 4.9,
    totalReviewsCount: 148,
    googleReviewUrl: 'https://share.google/y7Mb7XZgDgyd375HY',
    googleMapsUrl: 'https://share.google/y7Mb7XZgDgyd375HY',
    whatsappMessageTemplate:
      'ORDEM DE SERVIÇO – {NOME_EMPRESA}\n\n' +
      'OS: #{NUMERO_OS}\n' +
      'Cliente: {NOME_CLIENTE}\n' +
      'Equipamento: {EQUIPAMENTO}\n' +
      'Status: {STATUS}\n' +
      'Serviço: {SERVICO}\n' +
      'Valor: {VALOR}\n\n' +
      'Para acompanhar o andamento da sua OS em tempo real:\n' +
      '{LINK_PUBLICO}\n\n' +
      'Obrigado por confiar em nossa assistência técnica!',
  };

  const initialCustomers: Customer[] = [
    {
      id: 'cust-1',
      fullName: 'João da Silva',
      document: '289.412.876-15',
      phone: '(11) 98765-1122',
      whatsapp: '11987651122',
      email: 'joao.silva@email.com',
      address: 'Rua das Flores, 340, Apto 52 - Cerqueira César, São Paulo - SP',
      notes: 'Cliente preferencial, trabalha home-office com edição de vídeo.',
      createdAt: '2026-09-10T10:00:00.000Z',
      updatedAt: '2026-09-10T10:00:00.000Z',
    },
    {
      id: 'cust-2',
      fullName: 'Mariana Duarte Costa',
      document: '341.982.508-33',
      phone: '(11) 97123-4455',
      whatsapp: '11971234455',
      email: 'mariana.costa@empresa.com.br',
      address: 'Alameda Santos, 820, Sala 14 - Jardins, São Paulo - SP',
      notes: 'Arquiteta, usa softwares pesados CAD e SketchUp.',
      createdAt: '2026-09-15T14:20:00.000Z',
      updatedAt: '2026-09-15T14:20:00.000Z',
    },
    {
      id: 'cust-3',
      fullName: 'Lucas Fernandes Santos',
      document: '412.789.654-20',
      phone: '(11) 96544-7788',
      whatsapp: '11965447788',
      email: 'lucas.fernandes@gamer.com',
      address: 'Rua Augusta, 1200 - Consolação, São Paulo - SP',
      notes: 'Gamer e streamer, solicitou teste de benchmark após upgrade.',
      createdAt: '2026-09-18T09:15:00.000Z',
      updatedAt: '2026-09-18T09:15:00.000Z',
    },
    {
      id: 'cust-4',
      fullName: 'Clínica OdontoAlpha LTDA',
      document: '14.892.341/0001-92',
      phone: '(11) 3288-4000',
      whatsapp: '11989004000',
      email: 'ti@odontoalpha.com.br',
      address: 'Rua Vergueiro, 2040 - Vila Mariana, São Paulo - SP',
      notes: 'Contrato corporativo, 8 máquinas sob manutenção.',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
  ];

  const initialEquipments: Equipment[] = [
    {
      id: 'eq-1',
      customerId: 'cust-1',
      customerName: 'João da Silva',
      type: 'Notebook',
      brand: 'Dell',
      model: 'Inspiron 15 5510',
      serialNumber: 'DL-88421-BR',
      assetTag: 'PAT-2024-01',
      accessories: 'Carregador original Dell 65W, mouse sem fio Logitech',
      password: 'dell@2026user',
      physicalCondition: 'Leves marcas de uso na carcaça inferior, tela sem riscos.',
      notes: 'Cliente queixou de lentidão e aquecimento excessivo ao abrir múltiplos apps.',
      photos: ['/src/assets/images/male_tech_ssd_system_1790540438704.jpg'],
      createdAt: '2026-09-10T10:15:00.000Z',
      updatedAt: '2026-09-10T10:15:00.000Z',
    },
    {
      id: 'eq-2',
      customerId: 'cust-2',
      customerName: 'Mariana Duarte Costa',
      type: 'Desktop',
      brand: 'Asus',
      model: 'Custom ROG Workstation Ryzen 9',
      serialNumber: 'ASUS-99120-X',
      assetTag: '',
      accessories: 'Apenas gabinete com cabo de força tripolar',
      password: 'mariana#render',
      physicalCondition: 'Excelente estado, gabinete em vidro temperado sem avarias.',
      notes: 'Não dava vídeo após queda de energia elétrica na região.',
      photos: ['/src/assets/images/male_tech_backup_recovery_1790540451160.jpg'],
      createdAt: '2026-09-15T14:30:00.000Z',
      updatedAt: '2026-09-15T14:30:00.000Z',
    },
    {
      id: 'eq-3',
      customerId: 'cust-3',
      customerName: 'Lucas Fernandes Santos',
      type: 'Notebook',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 3',
      serialNumber: 'PF-3091AA',
      assetTag: '',
      accessories: 'Fonte USB-C 65W original Lenovo',
      password: 'lucas#work2026',
      physicalCondition: 'Perfeito estado, teclado intacto.',
      notes: 'Troca de pasta térmica por Noctua NT-H2 e upgrade de SSD para 1TB NVMe.',
      photos: ['/src/assets/images/male_technician_soldering_1790540428593.jpg'],
      createdAt: '2026-09-18T09:30:00.000Z',
      updatedAt: '2026-09-18T09:30:00.000Z',
    },
  ];

  const initialOrders: ServiceOrder[] = [
    {
      id: 'OS-1001',
      orderNumber: 1001,
      accessCode: '8F72K', // Prominently specified in user prompt!
      customerId: 'cust-1',
      customerName: 'João da Silva',
      customerPhone: '(11) 98765-1122',
      customerWhatsapp: '11987651122',
      equipmentId: 'eq-1',
      equipmentSummary: {
        type: 'Notebook',
        brand: 'Dell',
        model: 'Inspiron 15 5510',
        serialNumber: 'DL-88421-BR',
        photos: ['/src/assets/images/male_tech_ssd_system_1790540438704.jpg'],
      },
      entryDate: '2026-09-24T09:30:00.000Z',
      estimatedDeliveryDate: '2026-09-28T17:00:00.000Z',
      clientReportedIssue: 'Lentidão severa ao inicializar o Windows e travamentos em chamadas de vídeo.',
      technicalDiagnosis: 'Pasta térmica ressecada com thermal throttling a 95°C; disco HDD secundário com bad blocks causando lentidão.',
      servicePerformed: 'Limpeza interna completa com banho ultrassônico no cooler, substituição de pasta térmica por composto metálico de alta condutividade e formatação com instalação limpa do Windows 11 Pro.',
      partsUsed: [
        { id: 'part-1', name: 'Pasta Térmica Alta Condutividade (Thermal Silver)', quantity: 1, unitPrice: 50.0, total: 50.0 },
        { id: 'part-2', name: 'Pad Térmico de Silicone 1.5mm', quantity: 2, unitPrice: 25.0, total: 50.0 },
      ],
      partsTotal: 100.0,
      laborTotal: 250.0,
      discount: 0.0,
      totalAmount: 350.0,
      paymentMethod: 'Pix',
      paymentStatus: 'Pendente',
      responsibleTechnician: 'Carlos Eduardo (Especialista Hardware)',
      internalNotes: 'Equipamento testado sob stress por 2 horas com Cinebench e AIDA64. Temperaturas estáveis em 68°C.',
      publicNotes: 'A manutenção preventiva e desobstrução das saídas de ar foram executadas com sucesso. Em fase de testes finais de estabilidade.',
      status: 'Em manutenção',
      budgetApproval: {
        status: 'Aprovado',
        respondedAt: '2026-09-25T11:45:00.000Z',
        clientName: 'João da Silva',
        notes: 'Aprovado via WhatsApp pelo cliente.',
      },
      statusHistory: [
        {
          id: 'hist-1',
          status: 'Aguardando diagnóstico',
          timestamp: '2026-09-24T09:30:00.000Z',
          technician: 'Carlos Eduardo',
          notes: 'Equipamento recebido na bancada de triagem.',
        },
        {
          id: 'hist-2',
          status: 'Em diagnóstico',
          timestamp: '2026-09-24T14:10:00.000Z',
          technician: 'Carlos Eduardo',
          notes: 'Desmontagem e teste térmico realizados. Constatado superaquecimento.',
        },
        {
          id: 'hist-3',
          status: 'Aguardando aprovação',
          timestamp: '2026-09-25T10:00:00.000Z',
          technician: 'Carlos Eduardo',
          notes: 'Orçamento gerado no valor de R$ 350,00 e enviado ao cliente.',
        },
        {
          id: 'hist-4',
          status: 'Em manutenção',
          timestamp: '2026-09-25T11:50:00.000Z',
          technician: 'Carlos Eduardo',
          notes: 'Orçamento aprovado pelo cliente. Iniciada a aplicação dos compostos térmicos e formatação.',
        },
      ],
      createdAt: '2026-09-24T09:30:00.000Z',
      updatedAt: '2026-09-25T11:50:00.000Z',
    },
    {
      id: 'OS-1002',
      orderNumber: 1002,
      accessCode: '3B91X', // Ready for testing interactive budget approval
      customerId: 'cust-2',
      customerName: 'Mariana Duarte Costa',
      customerPhone: '(11) 97123-4455',
      customerWhatsapp: '11971234455',
      equipmentId: 'eq-2',
      equipmentSummary: {
        type: 'Desktop',
        brand: 'Asus',
        model: 'Custom ROG Workstation Ryzen 9',
        serialNumber: 'ASUS-99120-X',
        photos: ['/src/assets/images/male_tech_backup_recovery_1790540451160.jpg'],
      },
      entryDate: '2026-09-26T14:00:00.000Z',
      estimatedDeliveryDate: '2026-09-30T16:00:00.000Z',
      clientReportedIssue: 'Computador desliga sozinho durante renderização e não liga mais pelo botão frontal.',
      technicalDiagnosis: 'Fonte de alimentação ATX 750W com linha de 12V em curto devido a surto na rede. Placa-mãe e componentes protegidos com sucesso.',
      servicePerformed: 'Substituição de fonte de alimentação por modelo Corsair 850W Gold modular e reorganização do cabeamento.',
      partsUsed: [
        { id: 'part-3', name: 'Fonte de Alimentação Corsair RM850x 850W 80 Plus Gold Modular', quantity: 1, unitPrice: 720.0, total: 720.0 },
      ],
      partsTotal: 720.0,
      laborTotal: 180.0,
      discount: 20.0,
      totalAmount: 880.0,
      paymentMethod: 'Cartão de Crédito',
      paymentStatus: 'Pendente',
      responsibleTechnician: 'Rafael Mendes (Técnico Sênior)',
      internalNotes: 'Margem da fonte permite dar 1 ano de garantia de fábrica no componente Corsair.',
      publicNotes: 'Aguardando confirmação do cliente para instalação da nova fonte homologada e testes de render sob carga.',
      status: 'Aguardando aprovação',
      budgetApproval: {
        status: 'Pendente',
      },
      statusHistory: [
        {
          id: 'hist-201',
          status: 'Aguardando diagnóstico',
          timestamp: '2026-09-26T14:00:00.000Z',
          technician: 'Rafael Mendes',
          notes: 'Desktop recebido no laboratório técnico.',
        },
        {
          id: 'hist-202',
          status: 'Em diagnóstico',
          timestamp: '2026-09-26T16:30:00.000Z',
          technician: 'Rafael Mendes',
          notes: 'Testes de bancada confirmaram curto no circuito secundário da fonte.',
        },
        {
          id: 'hist-203',
          status: 'Aguardando aprovação',
          timestamp: '2026-09-27T09:15:00.000Z',
          technician: 'Rafael Mendes',
          notes: 'Orçamento de R$ 880,00 emitido. Aguardando aprovação do cliente.',
        },
      ],
      createdAt: '2026-09-26T14:00:00.000Z',
      updatedAt: '2026-09-27T09:15:00.000Z',
    },
    {
      id: 'OS-1003',
      orderNumber: 1003,
      accessCode: '7K24M',
      customerId: 'cust-3',
      customerName: 'Lucas Fernandes Santos',
      customerPhone: '(11) 96544-7788',
      customerWhatsapp: '11965447788',
      equipmentId: 'eq-3',
      equipmentSummary: {
        type: 'Notebook',
        brand: 'Lenovo',
        model: 'ThinkPad T14 Gen 3',
        serialNumber: 'PF-3091AA',
        photos: ['/src/assets/images/male_technician_soldering_1790540428593.jpg'],
      },
      entryDate: '2026-09-27T10:00:00.000Z',
      estimatedDeliveryDate: '2026-09-29T18:00:00.000Z',
      clientReportedIssue: 'Upgrade de capacidade de armazenamento para 1TB NVMe e limpeza preventiva geral.',
      technicalDiagnosis: 'Aparelho íntegro, slot M.2 PCIe Gen 4 compatível com velocidade de até 7000MB/s.',
      servicePerformed: 'Instalação de SSD Kingston KC3000 1TB NVMe, clonagem setor a setor do sistema e limpeza com troca de pasta térmica.',
      partsUsed: [
        { id: 'part-4', name: 'SSD Kingston KC3000 1TB M.2 NVMe PCIe 4.0 (7000MB/s)', quantity: 1, unitPrice: 480.0, total: 480.0 },
        { id: 'part-5', name: 'Composto Térmico Noctua NT-H2', quantity: 1, unitPrice: 40.0, total: 40.0 },
      ],
      partsTotal: 520.0,
      laborTotal: 160.0,
      discount: 30.0,
      totalAmount: 650.0,
      paymentMethod: 'Pix',
      paymentStatus: 'Pendente',
      responsibleTechnician: 'Carlos Eduardo (Especialista Hardware)',
      internalNotes: 'Backup prévio gerado na nuvem do cliente.',
      publicNotes: 'Equipamento na bancada técnica para clonagem dos dados.',
      status: 'Aguardando diagnóstico',
      budgetApproval: {
        status: 'Aprovado',
      },
      statusHistory: [
        {
          id: 'hist-301',
          status: 'Aguardando diagnóstico',
          timestamp: '2026-09-27T10:00:00.000Z',
          technician: 'Carlos Eduardo',
          notes: 'Equipamento conferido na entrada.',
        },
      ],
      createdAt: '2026-09-27T10:00:00.000Z',
      updatedAt: '2026-09-27T10:00:00.000Z',
    },
  ];

  const initialReviews: GoogleReview[] = [
    {
      id: 'rev-1',
      authorName: 'Rodrigo M. Albuquerque',
      rating: 5,
      text: 'Excelente assistência técnica! Recuperaram meu notebook Dell que outra loja disse que a placa tinha queimado. Fizeram o reparo em 48 horas e ainda acompanhei tudo pelo link que recebi no WhatsApp. Muito profissionais e honestos.',
      date: '2026-09-18',
      relativeTimeDescription: 'há 1 semana',
      source: 'google',
      verified: true,
    },
    {
      id: 'rev-2',
      authorName: 'Camila Ferreira Bastos',
      rating: 5,
      text: 'Levei meu computador de trabalho com problema na fonte e lentidão. Fizeram a limpeza, colocaram um SSD NVMe e o PC ficou voando! O atendimento pelo WhatsApp foi muito rápido e transparente. Recomendo de olhos fechados.',
      date: '2026-09-21',
      relativeTimeDescription: 'há 6 dias',
      source: 'google',
      verified: true,
    },
    {
      id: 'rev-3',
      authorName: 'Fernando Guimarães',
      rating: 5,
      text: 'O melhor laboratório de informática de SP. Bancada com proteção antiestática real, orçamento justo e sem enrolação. Poder aprovar o orçamento direto na tela do celular facilitou demais o meu dia a dia.',
      date: '2026-09-23',
      relativeTimeDescription: 'há 4 dias',
      source: 'google',
      verified: true,
    },
    {
      id: 'rev-4',
      authorName: 'Juliana P. Nogueira',
      rating: 5,
      text: 'Atendimento impecável! Trocaram a tela do meu notebook Lenovo e fizeram manutenção preventiva completa. Preço justo e nota fiscal com garantia de 90 dias. Parabéns à equipe!',
      date: '2026-09-25',
      relativeTimeDescription: 'há 2 dias',
      source: 'google',
      verified: true,
    },
  ];

  return {
    users: [
      {
        id: 'usr-admin-1',
        username: 'admin@techassistencia.com.br',
        email: 'admin@techassistencia.com.br',
        name: 'Administrador Tech Assistência',
        role: 'admin',
        passwordHash: adminCreds.hash,
        salt: adminCreds.salt,
        createdAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    customers: initialCustomers,
    equipments: initialEquipments,
    orders: initialOrders,
    reviews: initialReviews,
    serviceRequests: [],
    company: defaultCompany,
    sessions: [],
    lastOrderNumber: 1003,
  };
}

class Database {
  private data: DBSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DBSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[DB] Failed reading db file, regenerating default data:', err);
    }
    const initial = getInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DBSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Failed saving data:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public getData(): DBSchema {
    return this.data;
  }
}

export const db = new Database();
