import React from 'react';
import {
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Check,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { ServiceOrder, ServiceOrderStatus } from '../../types/index.ts';
import { formatCurrency, formatDateTime, getStatusTheme } from '../../utils/formatters.ts';

interface DashboardMetrics {
  totalCustomers: number;
  totalEquipments: number;
  totalOrders: number;
  activeOrdersCount: number;
  totalRevenue: number;
  countByStatus: Record<ServiceOrderStatus, number>;
  recentOrders: ServiceOrder[];
  newServiceRequestsCount: number;
}

interface AdminDashboardViewProps {
  metrics: DashboardMetrics | null;
  onOpenOrder: (order: ServiceOrder) => void;
  onSendWhatsApp: (order: ServiceOrder) => void;
  onUpdateStatus: (order: ServiceOrder) => void;
  onNewOrder: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  metrics,
  onOpenOrder,
  onSendWhatsApp,
  onUpdateStatus,
  onNewOrder,
  onNavigateTab,
}) => {
  if (!metrics) {
    return <div className="p-8 text-center text-xs text-slate-400">Carregando métricas do laboratório...</div>;
  }

  const counts = metrics.countByStatus;

  const kpis = [
    {
      label: 'OS Abertas (Total)',
      value: metrics.activeOrdersCount,
      icon: Wrench,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-500/30',
    },
    {
      label: 'Em Diagnóstico',
      value: counts['Em diagnóstico'] || 0,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-950/40',
      border: 'border-sky-500/30',
    },
    {
      label: 'Aguardando Aprovação',
      value: counts['Aguardando aprovação'] || 0,
      icon: AlertTriangle,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40',
      border: 'border-purple-500/30',
      alert: (counts['Aguardando aprovação'] || 0) > 0,
    },
    {
      label: 'Em Manutenção',
      value: counts['Em manutenção'] || 0,
      icon: Wrench,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-500/30',
    },
    {
      label: 'Prontas p/ Retirada',
      value: counts['Pronto para retirada'] || 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
    },
    {
      label: 'OS Entregues',
      value: counts['Entregue'] || 0,
      icon: Check,
      color: 'text-slate-300',
      bg: 'bg-slate-800/60',
      border: 'border-slate-700',
    },
    {
      label: 'Total de Clientes',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40',
      border: 'border-blue-500/30',
    },
    {
      label: 'Faturamento Concluído',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
      isCurrency: true,
    },
  ];

  // Visual status distribution calculation
  const total = Math.max(1, metrics.totalOrders);
  const statusDistribution = [
    { label: 'Aguardando Diagnóstico', count: counts['Aguardando diagnóstico'] || 0, color: 'bg-amber-400' },
    { label: 'Em Diagnóstico', count: counts['Em diagnóstico'] || 0, color: 'bg-sky-400' },
    { label: 'Aguardando Aprovação', count: counts['Aguardando aprovação'] || 0, color: 'bg-purple-400' },
    { label: 'Em Manutenção', count: counts['Em manutenção'] || 0, color: 'bg-cyan-400' },
    { label: 'Pronto para Retirada', count: counts['Pronto para retirada'] || 0, color: 'bg-emerald-400' },
    { label: 'Entregue', count: counts['Entregue'] || 0, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div>
          <span className="text-xs font-semibold text-cyan-400">Painel Operacional</span>
          <h2 className="text-xl font-bold text-white mt-0.5">Visão Geral da Assistência Técnica</h2>
          <p className="text-xs text-slate-400">
            Acompanhamento em tempo real de chamados, bancadas técnicas e aprovações de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewOrder}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>+ Abrir Nova OS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border bg-slate-900/70 transition-all ${kpi.border} ${
                kpi.alert ? 'ring-2 ring-purple-500/40 animate-pulse' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 truncate">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div
                className={`text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-white ${
                  kpi.isCurrency ? 'text-lg sm:text-xl text-emerald-400' : ''
                }`}
              >
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Progress Distribution Bar */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white">Distribuição do Fluxo de Trabalho (Ordens de Serviço)</span>
          <span className="text-slate-400 font-mono">{metrics.totalOrders} OS registradas</span>
        </div>

        {/* Visual Multi-segment bar */}
        <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex">
          {statusDistribution.map((item, i) => {
            const pct = (item.count / total) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={i}
                style={{ width: `${pct}%` }}
                className={`${item.color} h-full transition-all`}
                title={`${item.label}: ${item.count} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 text-[11px] text-slate-400">
          {statusDistribution.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${item.color}`} />
              <span className="truncate">{item.label}:</span>
              <strong className="text-slate-200 font-mono tabular-nums">{item.count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Ordens de Serviço Recentes</h3>
            <p className="text-xs text-slate-400">Últimos atendimentos em andamento no laboratório</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver todas as OS</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">OS / Código</th>
                <th className="py-3 px-4 font-semibold">Cliente</th>
                <th className="py-3 px-4 font-semibold">Equipamento</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Valor Total</th>
                <th className="py-3 px-4 font-semibold text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {metrics.recentOrders.map((ord) => {
                const theme = getStatusTheme(ord.status);
                return (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-extrabold font-mono text-cyan-400 block">{ord.id}</span>
                      <span className="text-[10px] font-mono text-slate-500">Link: {ord.accessCode}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{ord.customerName}</span>
                      <span className="text-[11px] text-slate-400">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 block">
                        {ord.equipmentSummary.type} {ord.equipmentSummary.brand}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                        {ord.equipmentSummary.model}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${theme.bg} ${theme.border} ${theme.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                        <span>{ord.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200 tabular-nums">
                      {formatCurrency(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSendWhatsApp(ord)}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Enviar OS pelo WhatsApp"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(ord)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => onOpenOrder(ord)}
                          className="px-2 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-colors text-[11px] font-semibold"
                        >
                          Ver OS
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
