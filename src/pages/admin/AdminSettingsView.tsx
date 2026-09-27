import React, { useState } from 'react';
import { Save, Lock, CheckCircle2, AlertCircle, Building2, MessageSquare, ExternalLink } from 'lucide-react';
import type { CompanySettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminSettingsViewProps {
  settings: CompanySettings | null;
  onSaved: (settings: CompanySettings) => void;
  onOpenChangePassword: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings,
  onSaved,
  onOpenChangePassword,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(
    settings || {
      name: 'Tech Assistência - Especializada em Computadores e Notebooks',
      tradeName: 'Tech Assistência Informática',
      cnpj: '38.492.109/0001-44',
      phone: '(62) 99248-2720',
      whatsapp: '62992482720',
      email: 'contato@techassistencia.com.br',
      address: 'R. 8.25 Q.12 Sala 5 - St. Mal. Rondon - Marechal Rondon',
      cityState: 'Goiânia - GO, 74560-370',
      openingHours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado (Não abrimos aos sábados)',
      instagram: '@thec_assistencia',
      googleRating: 4.9,
      totalReviewsCount: 148,
      googleReviewUrl: 'https://share.google/y7Mb7XZgDgyd375HY',
      googleMapsUrl: 'https://share.google/y7Mb7XZgDgyd375HY',
      whatsappMessageTemplate:
        'ORDEM DE SERVIÇO – {NOME_EMPRESA}\n\n' +
        'OS: #{NUMERO_OS}\n' +
        'Cliente: {NOME_CLIENTE}\n' +
        'Equipamento: {EQUIPAMENTO}\n' +
        'Status: {STATUS}\n' +
        'Serviço: {SERVICO}\n' +
        'Valor: {VALOR}\n\n' +
        'Para acompanhar o andamento da sua OS em tempo real:\n' +
        '{LINK_PUBLICO}\n\n' +
        'Obrigado por confiar em nossa assistência técnica!',
    }
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updated = await api.updateSettings(formData);
      onSaved(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Configurações do Sistema</h2>
          <p className="text-xs text-slate-400">
            Dados da assistência, mensagens do WhatsApp e segurança da conta
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenChangePassword}
          className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
        >
          <Lock className="h-3.5 w-3.5 text-cyan-400" />
          <span>Alterar Minha Senha de Acesso</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <span>Informações da Assistência Técnica</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Comercial (Fantasia)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Razão Social</label>
              <input
                type="text"
                value={formData.tradeName}
                onChange={(e) => handleChange('tradeName', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone Fixo</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp da Loja (Apenas números com DDD)</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value.replace(/\D/g, ''))}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram (@usuario)</label>
              <input
                type="text"
                value={formData.instagram || ''}
                placeholder="@thec_assistencia"
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Horário de Funcionamento</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => handleChange('openingHours', e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* WhatsApp Template Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Modelo Padrão da Mensagem de OS (WhatsApp)</span>
          </h3>

          <p className="text-xs text-slate-400">
            Esta é a mensagem que será gerada automaticamente ao clicar no botão "Enviar OS pelo WhatsApp". Use as variáveis entre chaves para preencher os dados dinamicamente.
          </p>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono text-cyan-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Variáveis disponíveis:</span>
            <span>{'{NOME_EMPRESA}'}</span>
            <span>{'{NUMERO_OS}'}</span>
            <span>{'{NOME_CLIENTE}'}</span>
            <span>{'{EQUIPAMENTO}'}</span>
            <span>{'{STATUS}'}</span>
            <span>{'{SERVICO}'}</span>
            <span>{'{VALOR}'}</span>
            <span>{'{LINK_PUBLICO}'}</span>
          </div>

          <textarea
            rows={10}
            value={formData.whatsappMessageTemplate}
            onChange={(e) => handleChange('whatsappMessageTemplate', e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none"
          />
        </div>

        {/* Google Links */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            Links de Integração Google
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link direto para Avaliação no Google (g.page)
              </label>
              <input
                type="text"
                value={formData.googleReviewUrl}
                onChange={(e) => handleChange('googleReviewUrl', e.target.value)}
                placeholder="https://g.page/r/..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link do Google Maps
              </label>
              <input
                type="text"
                value={formData.googleMapsUrl}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Salvando...' : 'Salvar Todas as Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
