import React from 'react';
import { MessageSquare, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';
import type { PublicServiceRequest } from '../../types/index.ts';
import { formatDateTime } from '../../utils/formatters.ts';

interface AdminLeadsViewProps {
  leads: PublicServiceRequest[];
  onUpdateStatus: (id: string, status: string) => void;
  onConvertToOrder?: (lead: PublicServiceRequest) => void;
}

export const AdminLeadsView: React.FC<AdminLeadsViewProps> = ({
  leads,
  onUpdateStatus,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Solicitações Recebidas pelo Site</h2>
        <p className="text-xs text-slate-400">
          Contatos enviados por clientes através do formulário "Solicitar Atendimento" da página inicial
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400">
          Nenhuma solicitação de atendimento recebida até o momento.
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{lead.fullName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      lead.status === 'Novo'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {formatDateTime(lead.createdAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-slate-300">
                  <span className="font-semibold text-cyan-400">
                    {lead.deviceType} {lead.brandModel ? `(${lead.brandModel})` : ''}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-500" />
                    <span>{lead.whatsapp}</span>
                  </span>
                  {lead.email && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-500" />
                        <span>{lead.email}</span>
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span className="text-slate-400">Prefere: {lead.preferredContact}</span>
                </div>

                <p className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 mt-2">
                  "{lead.reportedIssue}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                <a
                  href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${lead.fullName}! Aqui é da assistência Tech Assistência. Recebemos sua solicitação para seu ${lead.deviceType}. Como podemos te ajudar?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chamar no WhatsApp</span>
                </a>

                {lead.status === 'Novo' && (
                  <button
                    onClick={() => onUpdateStatus(lead.id, 'Em contato')}
                    className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
                  >
                    Marcar em contato
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
