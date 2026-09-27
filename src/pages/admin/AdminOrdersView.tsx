import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MessageSquare,
  Printer,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/index.ts';
import { formatCurrency, formatDate, formatDateTime, getStatusTheme } from '../../utils/formatters.ts';

interface AdminOrdersViewProps {
  orders: ServiceOrder[];
  onNewOrder: () => void;
  onEditOrder: (order: ServiceOrder) => void;
  onSendWhatsApp: (order: ServiceOrder) => void;
  onUpdateStatus: (order: ServiceOrder) => void;
  onPrintReceipt: (order: ServiceOrder) => void;
  onDeleteOrder: (id: string) => void;
}

const ALL_STATUS_TABS: (ServiceOrderStatus | 'Todos')[] = [
  'Todos',
  'Aguardando diagnóstico',
  'Em diagnóstico',
  'Aguardando aprovação',
  'Aguardando peça',
  'Em manutenção',
  'Pronto para retirada',
  'Entregue',
  'Cancelado',
];

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders,
  onNewOrder,
  onEditOrder,
  onSendWhatsApp,
  onUpdateStatus,
  onPrintReceipt,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<ServiceOrderStatus | 'Todos'>('Todos');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<ServiceOrder | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    // Status filter
    if (selectedStatusTab !== 'Todos' && o.status !== selectedStatusTab) {
      return false;
    }

    // Search filter across: client, OS #, code, phone, equipment brand/model, serial number
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchId = o.id.toLowerCase().includes(term);
      const matchCode = o.accessCode.toLowerCase().includes(term);
      const matchClient = o.customerName.toLowerCase().includes(term);
      const matchPhone = (o.customerPhone || '').includes(term) || (o.customerWhatsapp || '').includes(term);
      const matchEquip = `${o.equipmentSummary.type} ${o.equipmentSummary.brand} ${o.equipmentSummary.model}`
        .toLowerCase()
        .includes(term);
      const matchSerial = (o.equipmentSummary.serialNumber || '').toLowerCase().includes(term);
      const matchTech = (o.responsibleTechnician || '').toLowerCase().includes(term);

      return matchId || matchCode || matchClient || matchPhone || matchEquip || matchSerial || matchTech;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Ordens de Serviço</h2>
          <p className="text-xs text-slate-400">
            Gerenciamento completo do ciclo de reparo, orçamentos e envio por WhatsApp
          </p>
        </div>

        <button
          onClick={onNewOrder}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Ordem de Serviço</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Status Horizontal Tabs (Allowed as interactive filter controls in section 1A) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {ALL_STATUS_TABS.map((tab) => {
            const isSelected = selectedStatusTab === tab;
            const count =
              tab === 'Todos' ? orders.length : orders.filter((o) => o.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                    isSelected ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cliente, número da OS (#OS-1001), código único (8F72K), serial ou modelo..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>
      </div>

      {/* Orders List / Table */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
          Nenhuma Ordem de Serviço encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const theme = getStatusTheme(ord.status);
            return (
              <div
                key={ord.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 hover:border-slate-700 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base sm:text-lg font-extrabold font-mono text-white">
                      #{ord.id}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                      Link: /os/{ord.accessCode}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${theme.bg} ${theme.border} ${theme.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                      <span>{ord.status}</span>
                    </span>
                    {ord.budgetApproval.status === 'Pendente' && (
                      <span className="text-[11px] font-semibold text-purple-400">
                        (Orçamento pendente no cliente)
                      </span>
                    )}
                  </div>

                  {/* Highlighted WhatsApp & Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onSendWhatsApp(ord)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                      title="Gerar e Enviar OS pelo WhatsApp"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>📱 ENVIAR OS PELO WHATSAPP</span>
                    </button>

                    <button
                      onClick={() => onUpdateStatus(ord)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Status</span>
                    </button>

                    <button
                      onClick={() => onPrintReceipt(ord)}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
                      title="Imprimir Comprovante da OS"
                    >
                      <Printer className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onEditOrder(ord)}
                      className="p-1.5 text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 rounded-lg cursor-pointer"
                      title="Editar Detalhes da OS"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir a Ordem de Serviço #${ord.id}?`)) {
                          onDeleteOrder(ord.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-lg cursor-pointer"
                      title="Excluir OS"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Details Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">CLIENTE:</span>
                    <strong className="text-slate-200">{ord.customerName}</strong>
                    <p className="text-slate-400 font-mono mt-0.5">{ord.customerPhone}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">EQUIPAMENTO:</span>
                    <strong className="text-slate-200">
                      {ord.equipmentSummary.type} {ord.equipmentSummary.brand} {ord.equipmentSummary.model}
                    </strong>
                    <p className="text-slate-400 font-mono mt-0.5">S/N: {ord.equipmentSummary.serialNumber || 'N/A'}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">DATAS:</span>
                    <span className="text-slate-300 block">Entrada: {formatDate(ord.entryDate)}</span>
                    <span className="text-cyan-400 block mt-0.5">
                      Previsão: {formatDate(ord.estimatedDeliveryDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px]">FINANCEIRO:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400">({ord.paymentMethod})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Técnico: {ord.responsibleTechnician}</span>
                  </div>
                </div>

                {/* Problem & Diagnosis Snippet */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-start gap-2">
                    <strong className="text-slate-400 shrink-0">Problema:</strong>
                    <span className="text-slate-300">{ord.clientReportedIssue}</span>
                  </div>
                  {ord.technicalDiagnosis && (
                    <div className="flex items-start gap-2">
                      <strong className="text-cyan-400 shrink-0">Diagnóstico:</strong>
                      <span className="text-slate-300">{ord.technicalDiagnosis}</span>
                    </div>
                  )}
                  {ord.internalNotes && (
                    <div className="flex items-start gap-2 text-amber-400 text-[11px]">
                      <strong className="shrink-0">🔒 Obs. Interna:</strong>
                      <span>{ord.internalNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
