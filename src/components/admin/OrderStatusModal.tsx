import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { getStatusTheme } from '../../utils/formatters.ts';

interface OrderStatusModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedOrder: ServiceOrder) => void;
}

const ALL_STATUSES: ServiceOrderStatus[] = [
  'Aguardando diagnóstico',
  'Em diagnóstico',
  'Aguardando aprovação',
  'Aguardando peça',
  'Em manutenção',
  'Pronto para retirada',
  'Entregue',
  'Cancelado',
];

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ServiceOrderStatus>(
    order?.status || 'Aguardando diagnóstico'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updated = await api.updateOrderStatus(order.id, selectedStatus, notes);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar o status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Atualizar Status da OS</h3>
            <p className="text-xs text-slate-400">
              #{order.id} · {order.customerName}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Novo Status do Atendimento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_STATUSES.map((st) => {
                const theme = getStatusTheme(st);
                const isSelected = selectedStatus === st;
                return (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? `${theme.bg} ${theme.border} text-white ring-2 ring-cyan-500/30`
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                    <span className="truncate">{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação Técnica / Motivo (Registrado no histórico)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Peça chegou do fornecedor; testes iniciados na bancada..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg"
            >
              {loading ? 'Salvando...' : 'Salvar Novo Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
