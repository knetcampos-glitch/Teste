import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  DollarSign,
  Tag,
  Laptop,
  Monitor,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { formatCurrency, formatDate, formatDateTime, getStatusTheme } from '../../utils/formatters.ts';

interface OrderTrackingViewProps {
  initialCode?: string;
  onBackToHome: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialCode = '',
  onBackToHome,
}) => {
  const [searchInput, setSearchInput] = useState(initialCode);
  const [docVerification, setDocVerification] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Budget action state
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetFeedback, setBudgetFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefusalModal, setShowRefusalModal] = useState(false);

  // Load if code provided
  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse || searchInput).trim();
    if (!q) {
      setError('Por favor digite o número da OS ou código de rastreamento.');
      return;
    }

    setLoading(true);
    setError('');
    setBudgetFeedback(null);

    try {
      const data = await api.searchOrderPublic(q, docVerification || undefined);
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(err.message || 'Ordem de Serviço não localizada. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetAction = async (action: 'Aprovar' | 'Recusar', reason?: string) => {
    if (!order) return;
    setBudgetLoading(true);
    try {
      const res = await api.budgetActionPublic(order.accessCode, action, order.customerName, reason);
      setOrder(res.order);
      setBudgetFeedback({
        type: 'success',
        message: res.message,
      });
      setShowRefusalModal(false);
    } catch (err: any) {
      setBudgetFeedback({
        type: 'error',
        message: err.message || 'Erro ao registrar sua resposta.',
      });
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!order) return;
    const url = `${window.location.origin}/os/${order.accessCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getStepProgress = (status: ServiceOrderStatus) => {
    const steps: { name: string; key: ServiceOrderStatus[] }[] = [
      { name: 'Entrada', key: ['Aguardando diagnóstico'] },
      { name: 'Diagnóstico', key: ['Em diagnóstico'] },
      { name: 'Orçamento', key: ['Aguardando aprovação', 'Aguardando peça'] },
      { name: 'Manutenção', key: ['Em manutenção'] },
      { name: 'Pronto p/ Retirada', key: ['Pronto para retirada'] },
      { name: 'Entregue', key: ['Entregue'] },
    ];

    let currentStep = 0;
    if (status === 'Aguardando diagnóstico') currentStep = 1;
    else if (status === 'Em diagnóstico') currentStep = 2;
    else if (status === 'Aguardando aprovação' || status === 'Aguardando peça') currentStep = 3;
    else if (status === 'Em manutenção') currentStep = 4;
    else if (status === 'Pronto para retirada') currentStep = 5;
    else if (status === 'Entregue') currentStep = 6;
    else if (status === 'Cancelado') currentStep = -1;

    return { steps, currentStep };
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 tech-grid">
      <div className="mx-auto max-w-4xl">
        {/* Top bar back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar à página inicial</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            Portal Público do Cliente · <span className="text-red-500 font-bold">Tech</span> <span className="text-white font-medium">Assistência</span>
          </span>
        </div>

        {/* Search Box Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm mb-8">
          <div className="max-w-xl">
            <span className="text-xs font-semibold text-cyan-400">Rastreamento Online em Tempo Real</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Acompanhar Ordem de Serviço
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Digite o número da sua OS (ex: <code className="text-cyan-300">OS-1001</code>) ou o código de rastreamento recebido por WhatsApp (ex: <code className="text-cyan-300">8F72K</code>).
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Número da OS ou Código *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ex: 8F72K ou OS-1001"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-3 pr-10 py-2.5 text-sm font-mono text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase tracking-wider"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Telefone ou CPF (opcional para segurança)
              </label>
              <input
                type="text"
                value={docVerification}
                onChange={(e) => setDocVerification(e.target.value)}
                placeholder="Apenas números"
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{loading ? 'Buscando...' : 'Consultar'}</span>
              </button>
            </div>
          </form>

          {/* Quick Shortcuts for Demo Testing */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span>Atalhos rápidos para demonstração:</span>
            <button
              type="button"
              onClick={() => {
                setSearchInput('8F72K');
                handleSearch('8F72K');
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-cyan-300 font-mono border border-slate-700 hover:border-cyan-500/40 cursor-pointer"
            >
              8F72K (Dell em Manutenção)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('3B91X');
                handleSearch('3B91X');
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-purple-950 text-purple-300 font-mono border border-slate-700 hover:border-purple-500/40 cursor-pointer"
            >
              3B91X (Aguardando Aprovação de Orçamento)
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Order Details Display */}
        {order && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Status Bar */}
            {(() => {
              const theme = getStatusTheme(order.status);
              const { steps, currentStep } = getStepProgress(order.status);

              return (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
                          #{order.id}
                        </span>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded">
                          Código: {order.accessCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Cliente: <strong className="text-slate-200">{order.customerName}</strong> · Entrada em {formatDate(order.entryDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 ${theme.bg} ${theme.border} ${theme.color}`}>
                        <span className={`h-2 w-2 rounded-full ${theme.dot} ${order.status !== 'Entregue' && order.status !== 'Cancelado' ? 'animate-pulse' : ''}`} />
                        <span>{order.status}</span>
                      </div>

                      <button
                        onClick={handleCopyLink}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                        title="Copiar link direto desta OS"
                      >
                        {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step Timeline Progression */}
                  {order.status !== 'Cancelado' && (
                    <div className="pt-6">
                      <div className="hidden sm:grid grid-cols-6 gap-2">
                        {steps.map((st, idx) => {
                          const isCompleted = currentStep > idx + 1;
                          const isCurrent = currentStep === idx + 1;
                          return (
                            <div key={idx} className="flex flex-col items-center text-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                  isCompleted
                                    ? 'bg-cyan-500 text-slate-950'
                                    : isCurrent
                                    ? 'bg-cyan-950 border-2 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                              </div>
                              <span
                                className={`mt-2 text-[11px] font-medium leading-tight ${
                                  isCurrent ? 'text-cyan-300 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-600'
                                }`}
                              >
                                {st.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile single step badge */}
                      <div className="sm:hidden flex items-center justify-between text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span>Progresso do Atendimento:</span>
                        <span className="font-semibold text-cyan-400 font-mono">
                          Etapa {Math.max(1, currentStep)} de 6
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Budget Approval Banner (When status is Aguardando aprovação or approval pending) */}
            {order.status === 'Aguardando aprovação' && order.budgetApproval.status !== 'Aprovado' && (
              <div className="rounded-2xl border-2 border-purple-500/50 bg-purple-950/20 p-6 shadow-xl backdrop-blur-sm animate-pulse-border">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                      <Clock className="h-4 w-4" />
                      <span>Orçamento Disponível para Aprovação</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-white mt-1">
                      Aprovação do Orçamento do Reparo
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      Nosso técnico concluiu o diagnóstico. Revise os detalhes abaixo e confirme se podemos iniciar os serviços em seu equipamento.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="text-right sm:text-right w-full sm:w-auto p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Valor Total:</span>
                      <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleBudgetAction('Aprovar')}
                        disabled={budgetLoading}
                        className="flex-1 sm:flex-none px-4 py-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>APROVAR ORÇAMENTO</span>
                      </button>

                      <button
                        onClick={() => setShowRefusalModal(true)}
                        disabled={budgetLoading}
                        className="px-3.5 py-3 text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>NÃO APROVAR</span>
                      </button>
                    </div>
                  </div>
                </div>

                {budgetFeedback && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                      budgetFeedback.type === 'success'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{budgetFeedback.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* If budget was approved previously */}
            {order.budgetApproval.status === 'Aprovado' && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>
                    Orçamento aprovado em {formatDateTime(order.budgetApproval.respondedAt)}. Reparo em andamento.
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            )}

            {/* Equipment & Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Equipment & Diagnostic */}
              <div className="md:col-span-7 space-y-6">
                {/* Equipment Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                    {order.equipmentSummary.type === 'Notebook' ? (
                      <Laptop className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Monitor className="h-4 w-4 text-cyan-400" />
                    )}
                    <span>Dados do Equipamento</span>
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Tipo:</span>
                      <span className="font-semibold text-slate-200">{order.equipmentSummary.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Marca / Fabricante:</span>
                      <span className="font-semibold text-slate-200">{order.equipmentSummary.brand}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Modelo:</span>
                      <span className="font-semibold text-slate-200">{order.equipmentSummary.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Número de Série:</span>
                      <span className="font-mono text-slate-300">{order.equipmentSummary.serialNumber || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Photo if attached */}
                  {order.equipmentSummary.photos && order.equipmentSummary.photos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-2">Foto registrada na entrada:</span>
                      <div className="relative h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <img
                          src={order.equipmentSummary.photos[0]}
                          alt="Equipamento na entrada"
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Problem & Diagnosis Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Problema Relatado
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      {order.clientReportedIssue}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Diagnóstico Técnico
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      {order.technicalDiagnosis || 'Diagnóstico preliminar em andamento na bancada técnica.'}
                    </p>
                  </div>

                  {order.servicePerformed && (
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        Serviço Realizado
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        {order.servicePerformed}
                      </p>
                    </div>
                  )}

                  {order.publicNotes && (
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-1">Observações da Assistência</span>
                      <p className="text-xs text-slate-300 italic">{order.publicNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Values, Dates & History */}
              <div className="md:col-span-5 space-y-6">
                {/* Financial Breakdown Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span>Valores do Serviço</span>
                  </h3>

                  <div className="mt-4 space-y-2.5 text-xs">
                    {order.partsUsed && order.partsUsed.length > 0 && (
                      <div className="space-y-1.5 pb-3 border-b border-slate-800/70">
                        <span className="text-slate-400 font-semibold block mb-1">Peças e Componentes:</span>
                        {order.partsUsed.map((p, idx) => (
                          <div key={idx} className="flex justify-between text-slate-300">
                            <span>
                              {p.quantity}x {p.name}
                            </span>
                            <span className="font-mono tabular-nums text-slate-200">{formatCurrency(p.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between text-slate-400">
                      <span>Total Peças:</span>
                      <span className="font-mono tabular-nums text-slate-200">{formatCurrency(order.partsTotal)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Mão de Obra Especializada:</span>
                      <span className="font-mono tabular-nums text-slate-200">{formatCurrency(order.laborTotal)}</span>
                    </div>

                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto Aplicado:</span>
                        <span className="font-mono tabular-nums">- {formatCurrency(order.discount)}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Valor Total:</span>
                      <span className="text-xl font-extrabold font-mono text-cyan-400 tabular-nums">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Forma de Pagamento:</span>
                      <span className="text-slate-200 font-semibold">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Deadlines & Dates */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Data de Entrada:</span>
                      </span>
                      <span className="font-mono text-slate-200">{formatDateTime(order.entryDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Previsão de Entrega:</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {formatDate(order.estimatedDeliveryDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Timeline History */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>Linha do Tempo do Atendimento</span>
                  </h3>

                  <div className="mt-4 space-y-4">
                    {order.statusHistory.map((h, idx) => (
                      <div key={h.id || idx} className="relative pl-5 pb-3 border-l border-slate-800 last:border-0 last:pb-0">
                        <div className="absolute -left-1.5 top-0.5 h-3 w-3 rounded-full bg-cyan-500 border-2 border-slate-900" />
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-semibold text-slate-200">{h.status}</span>
                          <span className="text-[11px] font-mono text-slate-500">{formatDateTime(h.timestamp)}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">{h.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct WhatsApp Contact Button */}
                <a
                  href={`https://wa.me/5562992482720?text=${encodeURIComponent(
                    `Olá! Estou acompanhando minha OS #${order.id} (${order.equipmentSummary.brand} ${order.equipmentSummary.model}) e gostaria de tirar uma dúvida.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Falar com o Técnico sobre esta OS</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Refusal Confirmation Modal */}
        {showRefusalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Não Aprovar Orçamento</h3>
              <p className="text-xs text-slate-400 mt-1">
                Gostaria de informar o motivo ou tirar alguma dúvida antes com nossa equipe?
              </p>

              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-300 mb-1">Motivo (opcional):</label>
                <textarea
                  rows={3}
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  placeholder="Ex: Valor acima do esperado, prefiro avaliar outro momento, etc."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400 resize-none"
                />
              </div>

              <div className="mt-5 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRefusalModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => handleBudgetAction('Recusar', refusalReason)}
                  disabled={budgetLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
                >
                  {budgetLoading ? 'Registrando...' : 'Confirmar Recusa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
