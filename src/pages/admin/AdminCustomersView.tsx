import React, { useState } from 'react';
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  HardDrive,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { Customer, Equipment, ServiceOrder } from '../../types/index.ts';
import { formatPhone, formatDate, formatCurrency, getStatusTheme } from '../../utils/formatters.ts';

interface AdminCustomersViewProps {
  customers: Customer[];
  equipments: Equipment[];
  orders: ServiceOrder[];
  onNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onNewOrderForCustomer?: (customerId: string) => void;
  onNewEquipmentForCustomer?: (customerId: string) => void;
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({
  customers,
  equipments,
  orders,
  onNewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onNewOrderForCustomer,
  onNewEquipmentForCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(term) ||
      (c.document || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term) ||
      (c.whatsapp || '').includes(term) ||
      (c.email || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Cadastro de Clientes</h2>
          <p className="text-xs text-slate-400">
            Base de clientes, histórico de atendimentos e equipamentos vinculados
          </p>
        </div>

        <button
          onClick={onNewCustomer}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por nome, CPF/CNPJ, telefone, WhatsApp ou e-mail..."
          className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custEquipments = equipments.filter((e) => e.customerId === cust.id);
          const custOrders = orders.filter((o) => o.customerId === cust.id);

          return (
            <div
              key={cust.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold text-sm">
                      {cust.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{cust.fullName}</h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        {cust.document || 'Sem CPF/CNPJ'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCustomer(cust)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg"
                      title="Editar Cliente"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o cliente ${cust.fullName}?`)) {
                          onDeleteCustomer(cust.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="Excluir Cliente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span>{cust.phone}</span>
                    {cust.whatsapp && cust.whatsapp !== cust.phone && (
                      <span className="text-slate-500">· WA: {cust.whatsapp}</span>
                    )}
                  </div>
                  {cust.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  {cust.address && (
                    <div className="flex items-start gap-2 text-[11px] text-slate-400 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{cust.address}</span>
                    </div>
                  )}
                </div>

                {cust.notes && (
                  <p className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 italic">
                    "{cust.notes}"
                  </p>
                )}
              </div>

              {/* Linked Stats & Quick View */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span title="Equipamentos vinculados">💻 {custEquipments.length}</span>
                  <span title="Ordens de serviço">📋 {custOrders.length}</span>
                </div>

                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Histórico</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Full History Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-cyan-400">Prontuário do Cliente</span>
              <h3 className="text-lg font-bold text-white">{selectedCustomer.fullName}</h3>
              <p className="text-xs text-slate-400">
                {selectedCustomer.phone} · {selectedCustomer.document || 'Sem documento'} · {selectedCustomer.email || 'Sem e-mail'}
              </p>
            </div>

            {/* Equipments of this customer */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Equipamentos Cadastrados</span>
                </h4>
                {onNewEquipmentForCustomer && (
                  <button
                    onClick={() => {
                      const id = selectedCustomer.id;
                      setSelectedCustomer(null);
                      onNewEquipmentForCustomer(id);
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                  >
                    + Adicionar Equipamento
                  </button>
                )}
              </div>

              {equipments.filter((e) => e.customerId === selectedCustomer.id).length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum equipamento cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {equipments
                    .filter((e) => e.customerId === selectedCustomer.id)
                    .map((eq) => (
                      <div
                        key={eq.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-white">
                            {eq.type} {eq.brand} {eq.model}
                          </strong>
                          <span className="text-slate-500 font-mono block text-[11px]">
                            Serial: {eq.serialNumber || 'N/A'} · Senha: {eq.password || 'Sem senha'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{eq.accessories}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Orders of this customer */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Histórico de Ordens de Serviço (OS)</span>
                </h4>
                {onNewOrderForCustomer && (
                  <button
                    onClick={() => {
                      const id = selectedCustomer.id;
                      setSelectedCustomer(null);
                      onNewOrderForCustomer(id);
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
                  >
                    + Abrir Nova OS
                  </button>
                )}
              </div>

              {orders.filter((o) => o.customerId === selectedCustomer.id).length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhuma OS aberta para este cliente.</p>
              ) : (
                <div className="space-y-2">
                  {orders
                    .filter((o) => o.customerId === selectedCustomer.id)
                    .map((ord) => {
                      const theme = getStatusTheme(ord.status);
                      return (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-cyan-400">#{ord.id}</span>
                              <span className="text-slate-300">
                                {ord.equipmentSummary.type} {ord.equipmentSummary.brand} {ord.equipmentSummary.model}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] mt-0.5">
                              {ord.servicePerformed || ord.clientReportedIssue}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${theme.bg} ${theme.color} border ${theme.border}`}
                            >
                              {ord.status}
                            </span>
                            <span className="font-mono font-bold text-white tabular-nums">
                              {formatCurrency(ord.totalAmount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
