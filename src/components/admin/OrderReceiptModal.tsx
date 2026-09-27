import React from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { TechLogo } from '../common/TechLogo.tsx';
import type { ServiceOrder, CompanySettings } from '../../types/index.ts';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters.ts';

interface OrderReceiptModalProps {
  order: ServiceOrder | null;
  company: CompanySettings | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  company,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl my-8 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
          <span className="text-xs font-semibold text-cyan-400">Comprovante de Ordem de Serviço</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir OS</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="mt-4 p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-5 text-xs print:m-0 print:border-none print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TechLogo size="sm" />
                <span className="font-extrabold text-base text-white">
                  {company?.name || 'Tech Assistência'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {company?.address ? `${company.address}${company.cityState ? `, ${company.cityState}` : ''}` : 'R. 8.25 Q.12 Sala 5 - St. Mal. Rondon - Marechal Rondon, Goiânia - GO, 74560-370'}
              </p>
              <p className="text-[11px] text-slate-400">
                Tel/WhatsApp: {company?.phone || '(62) 99248-2720'} · CNPJ: {company?.cnpj || '38.492.109/0001-44'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-lg font-extrabold font-mono text-cyan-400">
                #{order.id}
              </span>
              <p className="text-[11px] font-mono text-slate-400">Código: {order.accessCode}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Emissão: {formatDateTime(order.createdAt)}</p>
            </div>
          </div>

          {/* Client & Equipment info */}
          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="font-bold text-slate-300 block mb-1">DADOS DO CLIENTE</span>
              <p className="text-slate-200 font-semibold">{order.customerName}</p>
              <p className="text-slate-400">Tel: {order.customerPhone || order.customerWhatsapp}</p>
            </div>
            <div>
              <span className="font-bold text-slate-300 block mb-1">DADOS DO EQUIPAMENTO</span>
              <p className="text-slate-200 font-semibold">
                {order.equipmentSummary.type} {order.equipmentSummary.brand} {order.equipmentSummary.model}
              </p>
              <p className="text-slate-400 font-mono">S/N: {order.equipmentSummary.serialNumber || 'N/A'}</p>
            </div>
          </div>

          {/* Issue & Diagnosis */}
          <div className="space-y-3 border-b border-slate-800 pb-4">
            <div>
              <span className="font-bold text-slate-400 block text-[11px]">PROBLEMA RELATADO:</span>
              <p className="text-slate-200">{order.clientReportedIssue}</p>
            </div>
            {order.technicalDiagnosis && (
              <div>
                <span className="font-bold text-cyan-400 block text-[11px]">DIAGNÓSTICO TÉCNICO:</span>
                <p className="text-slate-200">{order.technicalDiagnosis}</p>
              </div>
            )}
            {order.servicePerformed && (
              <div>
                <span className="font-bold text-emerald-400 block text-[11px]">SERVIÇO REALIZADO:</span>
                <p className="text-slate-200">{order.servicePerformed}</p>
              </div>
            )}
          </div>

          {/* Parts & Pricing Table */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <span className="font-bold text-slate-300 block">DISCRIMINAÇÃO DE PEÇAS E SERVIÇOS</span>
            {order.partsUsed && order.partsUsed.length > 0 && (
              <div className="space-y-1">
                {order.partsUsed.map((p, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>
                      {p.quantity}x {p.name}
                    </span>
                    <span className="font-mono">{formatCurrency(p.total)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-slate-400 pt-1">
              <span>Mão de Obra Técnica Especializada:</span>
              <span className="font-mono text-slate-200">{formatCurrency(order.laborTotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Desconto:</span>
                <span className="font-mono">- {formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/80 font-bold text-white text-sm">
              <span>TOTAL GERAL:</span>
              <span className="text-cyan-400 font-mono text-base">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Terms & Tracking link */}
          <div className="space-y-2 text-[11px] text-slate-400">
            <p>
              <strong>Termo de Garantia:</strong> Garantia legal de 90 dias a contar da retirada sobre o serviço executado e peças substituídas (art. 26 CDC). Não cobre danos por queda, mau uso, vírus ou surtos de energia não protegidos.
            </p>
            <p>
              <strong>Rastreamento Online:</strong> Acesse{' '}
              <code className="text-cyan-300 font-mono">
                {window.location.origin}/os/{order.accessCode}
              </code>{' '}
              para acompanhar o status do reparo.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-400">
            <div className="border-t border-slate-700 pt-1">
              <span>Técnico Responsável: {order.responsibleTechnician}</span>
            </div>
            <div className="border-t border-slate-700 pt-1">
              <span>Assinatura do Cliente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
