import React, { useState } from 'react';
import { Plus, Star, Trash2, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import type { GoogleReview, CompanySettings } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface AdminReviewsViewProps {
  reviews: GoogleReview[];
  company: CompanySettings | null;
  onRefresh: () => void;
}

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  reviews,
  company,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !text.trim()) {
      setError('Nome e comentário são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createReview({
        authorName: authorName.trim(),
        rating,
        text: text.trim(),
        date,
      });
      setShowAddModal(false);
      setAuthorName('');
      setText('');
      setRating(5);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta avaliação?')) return;
    try {
      await api.deleteReview(id);
      onRefresh();
    } catch (err) {
      alert('Erro ao excluir avaliação.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Avaliações do Google Business</h2>
          <p className="text-xs text-slate-400">
            Gerenciamento de depoimentos reais de clientes e sincronização de reputação
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Avaliação Real</span>
        </button>
      </div>

      {/* Score Summary Box */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-extrabold font-mono text-white tabular-nums">
            {company?.googleRating.toFixed(1) || '4.9'}
          </div>
          <div>
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Média baseada em <strong className="text-slate-200">{company?.totalReviewsCount || reviews.length}</strong> avaliações registradas
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <span className="text-slate-500 block">Link oficial do Google Meu Negócio:</span>
          <a
            href={company?.googleReviewUrl || 'https://share.google/y7Mb7XZgDgyd375HY'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-mono text-[11px]"
          >
            {company?.googleReviewUrl || 'https://share.google/y7Mb7XZgDgyd375HY'}
          </a>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300">
                    {rev.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{rev.authorName}</h4>
                    <span className="text-[11px] text-slate-500">{rev.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Excluir Avaliação"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <p className="mt-2 text-xs text-slate-300 italic">"{rev.text}"</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
              <span>{rev.source === 'google' ? 'Google Meu Negócio' : 'Cadastrada manualmente'}</span>
              <span className="text-emerald-400">✓ Verificada</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white mb-1">Cadastrar Avaliação Real</h3>
            <p className="text-xs text-slate-400 mb-4">
              Transcreva o depoimento real deixado pelo cliente no balcão ou WhatsApp
            </p>

            {error && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: Beatriz Silveira"
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nota (Estrelas)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Estrelas</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Estrelas</option>
                    <option value={3}>⭐⭐⭐ 3 Estrelas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data da Avaliação</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Depoimento do Cliente *</label>
                <textarea
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escreva a avaliação do cliente..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg"
                >
                  {loading ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
