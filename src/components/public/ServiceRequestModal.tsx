import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import type { EquipmentType } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
  defaultDeviceType?: EquipmentType;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  defaultService = '',
  defaultDeviceType = 'Notebook',
}) => {
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [deviceType, setDeviceType] = useState<EquipmentType>(defaultDeviceType);
  const [brandModel, setBrandModel] = useState('');
  const [reportedIssue, setReportedIssue] = useState(defaultService ? `Interesse em: ${defaultService}` : '');
  const [preferredContact, setPreferredContact] = useState<'WhatsApp' | 'Telefone' | 'E-mail'>('WhatsApp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !whatsapp || !reportedIssue) {
      setError('Por favor preencha nome, WhatsApp e o problema/serviço desejado.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.submitServiceRequest({
        fullName,
        whatsapp,
        email,
        deviceType,
        brandModel,
        reportedIssue,
        preferredContact,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Solicitação Recebida!</h3>
            <p className="mt-2 text-sm text-slate-300">
              Obrigado, <strong className="text-white">{fullName}</strong>. Nossa equipe técnica já recebeu seus dados e entrará em contato via {preferredContact} para agendar a entrada ou tirar dúvidas.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <a
                href={`https://wa.me/5562992482720?text=${encodeURIComponent(
                  `Olá, acabei de solicitar atendimento para meu ${deviceType} (${brandModel || 'Sem modelo'}). Nome: ${fullName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Adiantar conversa pelo WhatsApp agora</span>
              </a>
              <button
                onClick={handleResetAndClose}
                className="w-full py-2 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-xs font-semibold text-cyan-400">Atendimento Rápido</span>
              <h3 className="text-lg font-bold text-white mt-0.5">Solicitar Atendimento Técnico</h3>
              <p className="text-xs text-slate-400">
                Envie os detalhes do seu equipamento para análise e agendamento na bancada.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seu Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">E-mail (opcional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipo de Equipamento *</label>
                  <select
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value as EquipmentType)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Notebook">Notebook</option>
                    <option value="Computador">Computador / Desktop</option>
                    <option value="All-in-One">All-in-One</option>
                    <option value="Outro">Outro Equipamento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Marca e Modelo</label>
                  <input
                    type="text"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    placeholder="Ex: Dell Inspiron 15, Lenovo ThinkPad"
                    className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Qual o problema ou serviço desejado? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportedIssue}
                  onChange={(e) => setReportedIssue(e.target.value)}
                  placeholder="Ex: Notebook não liga, está esquentando muito, quero trocar HD por SSD, etc."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Preferência de Contato</label>
                <div className="flex gap-4">
                  {(['WhatsApp', 'Telefone', 'E-mail'] as const).map((mode) => (
                    <label key={mode} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        checked={preferredContact === mode}
                        onChange={() => setPreferredContact(mode)}
                        className="text-cyan-500 focus:ring-0"
                      />
                      <span>{mode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Enviando...' : 'Enviar Solicitação de Atendimento'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
