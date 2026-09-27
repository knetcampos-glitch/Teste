import React from 'react';
import { Phone, MessageSquare, MapPin, Clock, Mail, ShieldCheck, ExternalLink, Instagram } from 'lucide-react';
import { TechLogo } from '../common/TechLogo.tsx';
import type { CompanySettings } from '../../types/index.ts';

interface FooterProps {
  company: CompanySettings | null;
  onNavigate: (view: 'home' | 'tracking' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ company, onNavigate }) => {
  const phone = company?.phone || '(62) 99248-2720';
  const whatsapp = company?.whatsapp || '62992482720';
  const fullAddress = company?.address
    ? `${company.address}${company.cityState ? `, ${company.cityState}` : ''}`
    : 'R. 8.25 Q.12 Sala 5 - St. Mal. Rondon - Marechal Rondon, Goiânia - GO, 74560-370';
  const hours = company?.openingHours || 'Segunda a Sexta: 08:00 às 18:00 | Sábado e Domingo: Fechado (Não abrimos aos sábados)';
  const email = company?.email || 'contato@techassistencia.com.br';
  const cnpj = company?.cnpj || '38.492.109/0001-44';
  const mapsUrl = company?.googleMapsUrl || 'https://share.google/y7Mb7XZgDgyd375HY';

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <TechLogo size="sm" />
              <span className="font-black text-lg tracking-tight">
                <span className="text-red-600">Tech</span> <span className="text-white">Assistência</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assistência técnica especializada em microeletrônica, computadores e notebooks. Laboratório com aterramento ESD e transparência total de ponta a ponta.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              CNPJ: {cnpj}
            </p>
          </div>

          {/* Col 2: Services Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Serviços Técnicos</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Manutenção de Notebooks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Manutenção de Computadores & PCs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Upgrade de SSD e Memória RAM
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Limpeza e Pasta Térmica Premium
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Formatação com Backup Seguro
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">
                  Diagnóstico Eletrônico de Placas
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Contato & Localização</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 transition-colors leading-relaxed"
                  title="Abrir no Google Maps"
                >
                  <span>{fullAddress}</span>
                  <span className="block text-[10px] text-cyan-400 mt-0.5">Ver rota no Google Maps →</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="hover:text-cyan-300">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/55${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  WhatsApp: (62) 99248-2720
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-400 shrink-0" />
                <a
                  href="https://instagram.com/thec_assistencia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:text-pink-300 hover:underline font-semibold"
                >
                  Instagram: @thec_assistencia
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Hours & Tracking portal */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Atendimento & OS</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-slate-300">
                <Clock className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{hours}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-semibold text-cyan-400 block mb-1">
                  Já é nosso cliente?
                </span>
                <p className="text-[11px] text-slate-400 mb-2">
                  Consulte o status do seu reparo com o número da OS ou link do WhatsApp.
                </p>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors text-center block cursor-pointer"
                >
                  Rastrear Ordem de Serviço
                </button>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Acesso Administrativo /admin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} <span className="text-red-500 font-bold">Tech</span> <span className="text-white font-semibold">Assistência</span>. Todos os direitos reservados. Garantia balcão 90 dias conforme CDC.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ambiente Protegido com Criptografia</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
