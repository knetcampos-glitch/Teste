import type { ServiceOrderStatus } from '../types/index.ts';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function getStatusTheme(status: ServiceOrderStatus): {
  color: string;
  bg: string;
  border: string;
  dot: string;
  stepIndex: number;
} {
  switch (status) {
    case 'Aguardando diagnóstico':
      return {
        color: 'text-amber-400',
        bg: 'bg-amber-950/40',
        border: 'border-amber-500/30',
        dot: 'bg-amber-400',
        stepIndex: 1,
      };
    case 'Em diagnóstico':
      return {
        color: 'text-sky-400',
        bg: 'bg-sky-950/40',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
        stepIndex: 2,
      };
    case 'Aguardando aprovação':
      return {
        color: 'text-purple-400',
        bg: 'bg-purple-950/40',
        border: 'border-purple-500/30',
        dot: 'bg-purple-400',
        stepIndex: 3,
      };
    case 'Aguardando peça':
      return {
        color: 'text-orange-400',
        bg: 'bg-orange-950/40',
        border: 'border-orange-500/30',
        dot: 'bg-orange-400',
        stepIndex: 4,
      };
    case 'Em manutenção':
      return {
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/40',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-400',
        stepIndex: 5,
      };
    case 'Pronto para retirada':
      return {
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        stepIndex: 6,
      };
    case 'Entregue':
      return {
        color: 'text-slate-300',
        bg: 'bg-slate-800/60',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
        stepIndex: 7,
      };
    case 'Cancelado':
      return {
        color: 'text-rose-400',
        bg: 'bg-rose-950/40',
        border: 'border-rose-500/30',
        dot: 'bg-rose-400',
        stepIndex: -1,
      };
    default:
      return {
        color: 'text-slate-300',
        bg: 'bg-slate-800',
        border: 'border-slate-700',
        dot: 'bg-slate-400',
        stepIndex: 0,
      };
  }
}
