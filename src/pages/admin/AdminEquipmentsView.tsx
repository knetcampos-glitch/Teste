import React, { useState } from 'react';
import {
  Plus,
  Search,
  HardDrive,
  Laptop,
  Monitor,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Image as ImageIcon,
  Key,
  Shield,
} from 'lucide-react';
import type { Equipment, Customer } from '../../types/index.ts';

interface AdminEquipmentsViewProps {
  equipments: Equipment[];
  customers: Customer[];
  onNewEquipment: () => void;
  onEditEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

export const AdminEquipmentsView: React.FC<AdminEquipmentsViewProps> = ({
  equipments,
  customers,
  onNewEquipment,
  onEditEquipment,
  onDeleteEquipment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEquipments = equipments.filter((eq) => {
    if (selectedCustomerFilter && eq.customerId !== selectedCustomerFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const customer = customers.find((c) => c.id === eq.customerId);
      const custName = (customer?.fullName || '').toLowerCase();
      return (
        eq.brand.toLowerCase().includes(term) ||
        eq.model.toLowerCase().includes(term) ||
        (eq.serialNumber || '').toLowerCase().includes(term) ||
        (eq.assetTag || '').toLowerCase().includes(term) ||
        custName.includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Equipamentos em Laboratório</h2>
          <p className="text-xs text-slate-400">
            Dispositivos cadastrados, senhas protegidas, condições de entrada e fotos
          </p>
        </div>

        <button
          onClick={onNewEquipment}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Equipamento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por marca, modelo, número de série (S/N) ou patrimônio..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCustomerFilter}
            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="">Todos os clientes</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipments.map((eq) => {
          const customer = customers.find((c) => c.id === eq.customerId);
          const isPassVisible = Boolean(visiblePasswords[eq.id]);

          return (
            <div
              key={eq.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header with Type & Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                      {eq.type === 'Notebook' ? <Laptop className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {eq.brand} {eq.model}
                      </h3>
                      <span className="text-[11px] text-cyan-400 font-semibold">{eq.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEquipment(eq)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg"
                      title="Editar Equipamento"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o equipamento ${eq.brand} ${eq.model}?`)) {
                          onDeleteEquipment(eq.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="Excluir Equipamento"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Proprietário:</span>
                    <strong className="text-slate-200">{customer?.fullName || eq.customerName || 'Cliente'}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block">Número de Série:</span>
                      <span className="font-mono text-slate-300 font-semibold">{eq.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block">Patrimônio:</span>
                      <span className="font-mono text-slate-300 font-semibold">{eq.assetTag || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Password with reveal toggle */}
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Senha de logon:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-semibold">
                        {eq.password ? (isPassVisible ? eq.password : '••••••••') : 'Sem senha'}
                      </span>
                      {eq.password && (
                        <button
                          type="button"
                          onClick={() => togglePassword(eq.id)}
                          className="text-slate-400 hover:text-white"
                          title="Alternar visualização da senha"
                        >
                          {isPassVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {eq.accessories && (
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Acessórios entregues:</strong> {eq.accessories}
                    </div>
                  )}

                  {eq.physicalCondition && (
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Estado de entrada:</strong> {eq.physicalCondition}
                    </div>
                  )}
                </div>

                {/* Photo preview */}
                {eq.photos && eq.photos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 block mb-1.5">Foto de entrada:</span>
                    <div className="relative h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={eq.photos[0]} alt="Equipamento" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
