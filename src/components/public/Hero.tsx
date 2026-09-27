import React, { useState } from 'react';
import { Wrench, Search, MessageSquare, ShieldCheck, CheckCircle2, Cpu, Sparkles, ArrowRight, Layers, Disc, HardDrive, Database, Instagram } from 'lucide-react';
import type { CompanySettings } from '../../types/index.ts';

interface HeroProps {
  company: CompanySettings | null;
  onRequestService: () => void;
  onTrackOrder: () => void;
  onOpenWhatsApp: () => void;
}

const showcaseItems = [
  {
    id: 'carcaca',
    title: 'Restauração de Carcaça',
    subtitle: 'Notebooks · Reconstrução de Dobradiças e Estruturas',
    badge: 'Recuperação Estrutural',
    osTag: '#OS-1004',
    image: '/src/assets/images/male_technician_soldering_1790540428593.jpg',
    status: 'Técnico em bancada de colagem & reforço',
    progress: 75,
  },
  {
    id: 'sistema',
    title: 'Parte de Sistema & Otimização',
    subtitle: 'Instalação limpa de Windows 11 · Drivers Oficiais',
    badge: 'Sistema Operacional',
    osTag: '#OS-1002',
    image: '/src/assets/images/male_tech_ssd_system_1790540438704.jpg',
    status: 'Técnico configurando updates finais',
    progress: 85,
  },
  {
    id: 'ssd',
    title: 'Troca de SSD NVMe',
    subtitle: 'Upgrades de Alta Performance M.2 PCIe 4.0',
    badge: 'Upgrade Hardware',
    osTag: '#OS-1001',
    image: '/src/assets/images/male_technician_laptop_repair_1790540415590.jpg',
    status: 'Técnico na montagem e clonagem de dados',
    progress: 90,
  },
  {
    id: 'backup',
    title: 'Backup & Recuperação',
    subtitle: 'Salvamento de Arquivos e Migração Segura',
    badge: 'Segurança de Dados',
    osTag: '#OS-1003',
    image: '/src/assets/images/male_tech_backup_recovery_1790540451160.jpg',
    status: 'Técnico em transferência de arquivos blindada',
    progress: 60,
  },
];

export const Hero: React.FC<HeroProps> = ({
  company,
  onRequestService,
  onTrackOrder,
  onOpenWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeShowcase = showcaseItems[activeTab];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-800/60 tech-grid">
      {/* Subtle ambient lighting gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Clean kicker with location and hours */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-cyan-400">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Goiânia - GO · St. Mal. Rondon</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-normal">Seg a Sex das 8h às 18h</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">Não abrimos aos sábados</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-2xl text-balance">
              Tecnologia funcionando do jeito que deve.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Diagnóstico preciso, restauração de carcaça de notebooks, formatação e configuração de sistema, troca de SSD de alta velocidade e backup seguro. Acompanhe cada etapa da sua Ordem de Serviço em tempo real por link exclusivo.
            </p>

            {/* Quick Primary Actions: 3 required buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={onRequestService}
                className="px-5 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Wrench className="h-4 w-4" />
                <span>Solicitar Atendimento</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onTrackOrder}
                className="px-5 py-3 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="h-4 w-4 text-cyan-400" />
                <span>Acompanhar Ordem de Serviço</span>
              </button>

              <button
                onClick={onOpenWhatsApp}
                className="px-4 py-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Falar pelo WhatsApp</span>
              </button>
            </div>

            {/* Trust highlights inline */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>R. 8.25 Q.12 Sala 5, Marechal Rondon</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Atendimento de OS: 8h às 18h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>WhatsApp: (62) 99248-2720</span>
              </div>
              <a
                href="https://instagram.com/thec_assistencia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
              >
                <Instagram className="h-4 w-4 text-pink-400" />
                <span>Instagram: @thec_assistencia</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Tech Showcase with Interactive Tabs */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Interactive Showcase Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mb-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                {showcaseItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(idx)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all text-center truncate cursor-pointer ${
                      activeTab === idx
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {item.title.split(' ')[0]} {item.title.split(' ')[1] || ''}
                  </button>
                ))}
              </div>

              {/* Main Featured Photo */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl bg-slate-950">
                <img
                  key={activeShowcase.image}
                  src={activeShowcase.image}
                  alt={activeShowcase.title}
                  className="h-full w-full object-cover object-center transform hover:scale-105 transition-transform duration-700 animate-fadeIn"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent pointer-events-none" />

                {/* Live Status Overlay Card */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-lg bg-slate-900/95 border border-slate-700/70 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-xs font-semibold text-slate-100">{activeShowcase.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">{activeShowcase.osTag}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-300 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{activeShowcase.subtitle}</span>
                    <span className="text-cyan-400 font-medium shrink-0">{activeShowcase.status}</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeShowcase.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Secondary Thumbnail Previews */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {showcaseItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(idx)}
                    className={`relative h-20 rounded-lg overflow-hidden border transition-all text-left group cursor-pointer ${
                      activeTab === idx
                        ? 'border-cyan-400 ring-1 ring-cyan-400'
                        : 'border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-1.5 flex items-end">
                      <span className="text-[9px] font-semibold text-slate-200 leading-tight line-clamp-2">
                        {item.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
