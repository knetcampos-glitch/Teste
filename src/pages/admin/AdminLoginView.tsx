import React, { useState } from 'react';
import { Cpu, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AdminLoginViewProps {
  onBackToSite: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToSite }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin@techassistencia.com.br');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 tech-grid">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao site público</span>
        </button>

        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          Acesso Técnico Administrativo
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Gerenciamento de Ordens de Serviço, Clientes e Laboratório
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 py-8 px-6 shadow-2xl backdrop-blur-md sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@techassistencia.com.br"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-3 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Senha de Acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-3 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{loading ? 'Autenticando...' : 'Entrar no Sistema'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">Credenciais padrão para avaliação:</span>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-[11px] space-y-1 mb-3">
              <div className="text-slate-300">
                <span className="text-slate-500">Usuário: </span>admin@techassistencia.com.br
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Senha: </span>admin123
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              Preencher dados de teste automaticamente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
