import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Check, AlertCircle } from 'lucide-react';
import type {
  ServiceOrder,
  Customer,
  Equipment,
  ServiceOrderStatus,
  PaymentMethod,
  ServicePart,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatCurrency } from '../../utils/formatters.ts';

interface OrderFormModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (savedOrder: ServiceOrder) => void;
  customers: Customer[];
  equipments: Equipment[];
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  order,
  isOpen,
  onClose,
  onSaved,
  customers,
  equipments,
}) => {
  const isEditing = Boolean(order);

  const [customerId, setCustomerId] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [clientReportedIssue, setClientReportedIssue] = useState('');
  const [technicalDiagnosis, setTechnicalDiagnosis] = useState('');
  const [servicePerformed, setServicePerformed] = useState('');
  const [parts, setParts] = useState<ServicePart[]>([]);
  const [laborTotal, setLaborTotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [paymentStatus, setPaymentStatus] = useState<'Pendente' | 'Pago' | 'Faturado'>('Pendente');
  const [responsibleTechnician, setResponsibleTechnician] = useState('Carlos Eduardo');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [publicNotes, setPublicNotes] = useState('');
  const [status, setStatus] = useState<ServiceOrderStatus>('Aguardando diagnóstico');

  // Form error & loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New part inputs
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(0);

  useEffect(() => {
    if (order) {
      setCustomerId(order.customerId);
      setEquipmentId(order.equipmentId);
      setClientReportedIssue(order.clientReportedIssue);
      setTechnicalDiagnosis(order.technicalDiagnosis || '');
      setServicePerformed(order.servicePerformed || '');
      setParts(order.partsUsed || []);
      setLaborTotal(order.laborTotal || 0);
      setDiscount(order.discount || 0);
      setPaymentMethod(order.paymentMethod || 'Pix');
      setPaymentStatus(order.paymentStatus || 'Pendente');
      setResponsibleTechnician(order.responsibleTechnician || 'Carlos Eduardo');
      setEstimatedDeliveryDate(
        order.estimatedDeliveryDate ? order.estimatedDeliveryDate.split('T')[0] : ''
      );
      setInternalNotes(order.internalNotes || '');
      setPublicNotes(order.publicNotes || '');
      setStatus(order.status || 'Aguardando diagnóstico');
    } else {
      // Defaults for new order
      setCustomerId(customers[0]?.id || '');
      setEquipmentId('');
      setClientReportedIssue('');
      setTechnicalDiagnosis('');
      setServicePerformed('');
      setParts([]);
      setLaborTotal(150);
      setDiscount(0);
      setPaymentMethod('Pix');
      setPaymentStatus('Pendente');
      setResponsibleTechnician('Carlos Eduardo');
      // Default estimated date: 3 days ahead
      const nextDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      setEstimatedDeliveryDate(nextDate);
      setInternalNotes('');
      setPublicNotes('Aparelho recebido na bancada técnica para diagnóstico.');
      setStatus('Aguardando diagnóstico');
    }
    setError('');
  }, [order, isOpen, customers]);

  if (!isOpen) return null;

  // Filter equipment for chosen customer
  const availableEquipments = equipments.filter((e) => e.customerId === customerId);

  // Calculate totals
  const partsTotal = parts.reduce((acc, p) => acc + p.total, 0);
  const totalAmount = Math.max(0, partsTotal + (Number(laborTotal) || 0) - (Number(discount) || 0));

  const handleAddPart = () => {
    if (!newPartName.trim()) return;
    const qty = Math.max(1, Number(newPartQty) || 1);
    const price = Math.max(0, Number(newPartPrice) || 0);
    const newPart: ServicePart = {
      id: `p-${Date.now()}`,
      name: newPartName.trim(),
      quantity: qty,
      unitPrice: price,
      total: qty * price,
    };
    setParts([...parts, newPart]);
    setNewPartName('');
    setNewPartQty(1);
    setNewPartPrice(0);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Selecione um cliente.');
      return;
    }
    if (!equipmentId) {
      setError('Selecione ou cadastre um equipamento para este cliente.');
      return;
    }
    if (!clientReportedIssue.trim()) {
      setError('Informe o problema relatado pelo cliente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customerId,
        equipmentId,
        clientReportedIssue,
        technicalDiagnosis,
        servicePerformed,
        partsUsed: parts,
        partsTotal,
        laborTotal: Number(laborTotal) || 0,
        discount: Number(discount) || 0,
        totalAmount,
        paymentMethod,
        paymentStatus,
        responsibleTechnician,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toISOString() : undefined,
        internalNotes,
        publicNotes,
        status,
      };

      let saved: ServiceOrder;
      if (isEditing && order) {
        saved = await api.updateOrder(order.id, payload);
      } else {
        saved = await api.createOrder(payload);
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar a Ordem de Serviço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <span className="text-xs font-semibold text-cyan-400">
            {isEditing ? `Editar OS #${order?.id}` : 'Nova Ordem de Serviço'}
          </span>
          <h3 className="text-lg font-bold text-white">
            {isEditing ? `Atualizar Ordem de Serviço #${order?.id}` : 'Abertura de Chamado Técnico'}
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Customer & Equipment Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cliente *</label>
              <select
                required
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setEquipmentId('');
                }}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">Selecione o cliente...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} - {c.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Equipamento do Cliente *
              </label>
              <select
                required
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">
                  {availableEquipments.length === 0
                    ? 'Nenhum equipamento cadastrado para este cliente'
                    : 'Selecione o equipamento...'}
                </option>
                {availableEquipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.type} {eq.brand} {eq.model} (S/N: {eq.serialNumber || 'Sem serial'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Technical Info & Issues */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Problema Relatado pelo Cliente *
            </label>
            <textarea
              required
              rows={2}
              value={clientReportedIssue}
              onChange={(e) => setClientReportedIssue(e.target.value)}
              placeholder="Ex: Notebook desliga após 10 minutos de uso, aquecendo muito na base..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnóstico Técnico</label>
              <textarea
                rows={2}
                value={technicalDiagnosis}
                onChange={(e) => setTechnicalDiagnosis(e.target.value)}
                placeholder="Ex: Curto na linha primária de alimentação, pasta térmica ressecada..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Serviço Realizado / Proposto</label>
              <textarea
                rows={2}
                value={servicePerformed}
                onChange={(e) => setServicePerformed(e.target.value)}
                placeholder="Ex: Troca de pasta térmica, desobstrução de cooler e reparo de SMD..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          {/* Parts Used Section */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-cyan-400" />
                <span>Peças e Componentes Utilizados</span>
              </span>
              <span className="text-xs font-mono text-cyan-300">
                Total Peças: {formatCurrency(partsTotal)}
              </span>
            </div>

            {/* Existing parts list */}
            {parts.length > 0 && (
              <div className="space-y-1.5">
                {parts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <span className="text-slate-200">
                      {p.quantity}x {p.name} (@ {formatCurrency(p.unitPrice)})
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-200 font-semibold">{formatCurrency(p.total)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(p.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Part Row */}
            <div className="grid grid-cols-12 gap-2 pt-1">
              <div className="col-span-6">
                <input
                  type="text"
                  placeholder="Nome da peça (ex: SSD Kingston 1TB)"
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qtd"
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Valor Unit. R$"
                  value={newPartPrice || ''}
                  onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={handleAddPart}
                  className="w-full h-full py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs flex items-center justify-center"
                  title="Adicionar Peça"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Math */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mão de Obra (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={laborTotal}
                onChange={(e) => setLaborTotal(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Desconto (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Total Final</label>
              <div className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                <span>Total:</span>
                <span className="text-sm">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Status, Tech, Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status da OS *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceOrderStatus)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Aguardando diagnóstico">Aguardando diagnóstico</option>
                <option value="Em diagnóstico">Em diagnóstico</option>
                <option value="Aguardando aprovação">Aguardando aprovação</option>
                <option value="Aguardando peça">Aguardando peça</option>
                <option value="Em manutenção">Em manutenção</option>
                <option value="Pronto para retirada">Pronto para retirada</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Técnico Responsável</label>
              <input
                type="text"
                value={responsibleTechnician}
                onChange={(e) => setResponsibleTechnician(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Previsão de Entrega</label>
              <input
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Pix">Pix</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="A definir">A definir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status do Pagamento</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Faturado">Faturado</option>
              </select>
            </div>
          </div>

          {/* Notes: Internal vs Public */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                🔒 Observações Internas (Admin apenas)
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Ex: Cuidado com trilha de cobre frágil, cliente exigente com prazo..."
                className="w-full rounded-lg bg-slate-950 border border-amber-500/30 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1">
                🌐 Observações Públicas (Visível ao cliente)
              </label>
              <textarea
                rows={2}
                value={publicNotes}
                onChange={(e) => setPublicNotes(e.target.value)}
                placeholder="Ex: Equipamento em fase de testes finais de stress..."
                className="w-full rounded-lg bg-slate-950 border border-cyan-500/30 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
