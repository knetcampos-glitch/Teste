import React, { useState } from 'react';
import { Search, Wrench, Menu, X, ArrowRight, ShieldCheck, Lock, Instagram } from 'lucide-react';
import { TechLogo } from '../common/TechLogo.tsx';
import type { CompanySettings } from '../../types/index.ts';

interface NavbarProps {
  company: CompanySettings | null;
  onNavigate: (view: 'home' | 'tracking' | 'admin', trackingCode?: string) => void;
  onRequestService: () => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  onNavigate,
  onRequestService,
  currentView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const instagramHandle = company?.instagram || '@thec_assistencia';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark with Tech in Red and Assistência in White */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-slate-100 hover:text-white transition-colors group cursor-pointer"
        >
          <TechLogo size="md" />
          <div>
            <div className="font-black tracking-tight text-lg sm:text-xl flex items-center gap-1.5">
              <span className="text-red-600 font-black drop-shadow-sm">Tech</span>
              <span className="text-white font-extrabold">Assistência</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block leading-none">Assistência Técnica Especializada · Goiânia</p>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`hover:text-cyan-400 transition-colors cursor-pointer ${
              currentView === 'home' ? 'text-cyan-400' : ''
            }`}
          >
            Início & Serviços
          </button>
          <a
            href="#diferenciais"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('diferenciais')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Diferenciais
          </a>
          <a
            href="#avaliacoes"
            onClick={(e) => {
              if (currentView !== 'home') {
                e.preventDefault();
                onNavigate('home');
                setTimeout(() => {
                  document.getElementById('avaliacoes')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Avaliações Google
          </a>
          <button
            onClick={() => onNavigate('tracking')}
            className={`flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer ${
              currentView === 'tracking' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span>Consultar OS</span>
          </button>

          <a
            href="https://instagram.com/thec_assistencia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition-colors bg-pink-950/30 px-2.5 py-1 rounded-full border border-pink-500/30"
            title="Siga no Instagram"
          >
            <Instagram className="h-3.5 w-3.5" />
            <span>@thec_assistencia</span>
          </a>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onRequestService}
            className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Solicitar Atendimento</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Painel Administrativo"
          >
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span>Área Técnica</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onNavigate('tracking')}
            className="p-2 text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 rounded-lg"
            title="Rastrear OS"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-cyan-400"
          >
            Início & Serviços
          </button>
          <a
            href="#diferenciais"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-cyan-400"
          >
            Diferenciais da Assistência
          </a>
          <a
            href="#avaliacoes"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-left py-2 text-sm font-medium text-slate-200 hover:text-cyan-400"
          >
            Avaliações do Google (4.9★)
          </a>
          <a
            href="https://instagram.com/thec_assistencia"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-pink-400 hover:text-pink-300"
          >
            <Instagram className="h-4 w-4" />
            <span>Instagram: @thec_assistencia</span>
          </a>
          <button
            onClick={() => {
              onNavigate('tracking');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left py-2 text-sm font-medium text-cyan-400"
          >
            <Search className="h-4 w-4" />
            <span>Acompanhar Ordem de Serviço</span>
          </button>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onRequestService();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-900 bg-cyan-400 rounded-lg text-center"
            >
              Solicitar Atendimento
            </button>
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg text-center flex items-center justify-center gap-2"
            >
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Painel Administrativo /admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
