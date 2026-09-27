import React from 'react';
import {
  Laptop,
  Monitor,
  Disc,
  Flame,
  Cpu,
  HardDrive,
  Activity,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import type { EquipmentType } from '../../types/index.ts';

interface ServicesGridProps {
  onSelectService: (serviceName: string, deviceType: EquipmentType) => void;
}

const services = [
  {
    id: 'carcaca',
    title: 'Restauração de Carcaça de Notebook',
    deviceType: 'Notebook' as EquipmentType,
    icon: Layers,
    image: '/src/assets/images/male_technician_soldering_1790540428593.jpg',
    description:
      'Recuperação de carcaças plásticas e de magnésio, reconstrução de suportes de dobradiças quebradas, troca de tampas e alinhamento milimétrico sem folgas.',
    features: ['Reconstrução com resina automotiva de alta resistência', 'Fixação das buchas e torres de parafuso originais', 'Abertura suave sem estalos ou rachaduras'],
  },
  {
    id: 'sistema',
    title: 'Parte de Sistema & Formatação',
    deviceType: 'Notebook' as EquipmentType,
    icon: Disc,
    image: '/src/assets/images/male_tech_ssd_system_1790540438704.jpg',
    description:
      'Instalação limpa de Windows 11/10 ou Linux com todos os drivers oficiais, remoção de malwares, otimização de inicialização e suporte a programas essenciais.',
    features: ['Instalação limpa com drivers do fabricante', 'Otimização para máxima velocidade de boot', 'Sem softwares indesejados (bloatware)'],
  },
  {
    id: 'ssd',
    title: 'Troca e Upgrade de SSD de Alta Velocidade',
    deviceType: 'Notebook' as EquipmentType,
    icon: HardDrive,
    image: '/src/assets/images/male_technician_laptop_repair_1790540415590.jpg',
    description:
      'Substituição de HDDs mecânicos ou SSDs antigos por modernos SSDs NVMe M.2 PCIe 4.0. Seu notebook ou computador até 10x mais rápido.',
    features: ['Clonagem setor a setor sem perda de arquivos', 'Velocidades de até 7.000 MB/s', 'Instalação com dissipador térmico dedicado'],
  },
  {
    id: 'backup',
    title: 'Backup & Recuperação de Dados',
    deviceType: 'Computador' as EquipmentType,
    icon: Database,
    image: '/src/assets/images/male_tech_backup_recovery_1790540451160.jpg',
    description:
      'Backup preventivo completo de arquivos pessoais e profissionais. Recuperação de fotos e documentos em discos corrompidos ou equipamentos que não ligam.',
    features: ['Transferência segura em drives externos blindados', 'Recuperação de dados em discos danificados', 'Criptografia e sigilo total dos seus arquivos'],
  },
  {
    id: 'notebooks',
    title: 'Manutenção Geral de Notebooks',
    deviceType: 'Notebook' as EquipmentType,
    icon: Laptop,
    image: '/src/assets/images/male_technician_laptop_repair_1790540415590.jpg',
    description:
      'Reparo avançado em placas-mãe, substituição de telas LED/IPS, troca de teclados retroiluminados, jacks de energia e baterias homologadas.',
    features: ['Reparo em nível de circuito integrado SMD', 'Troca de conectores USB-C e DC Jack', 'Substituição de baterias originais'],
  },
  {
    id: 'desktops',
    title: 'Manutenção de Computadores & Desktops',
    deviceType: 'Desktop' as EquipmentType,
    icon: Monitor,
    image: '/src/assets/images/male_tech_backup_recovery_1790540451160.jpg',
    description:
      'Assistência completa para desktops de escritório, computadores gamer de alto desempenho e workstations para engenharia e render 3D.',
    features: ['Diagnóstico de fontes de alimentação 80 Plus', 'Otimização de cabeamento e airflow', 'Substituição de placas danificadas'],
  },
  {
    id: 'limpeza',
    title: 'Limpeza e Manutenção Preventiva',
    deviceType: 'Notebook' as EquipmentType,
    icon: Flame,
    image: '',
    description:
      'Desobstrução do fluxo de ar, higienização ultrassônica de coolers e aplicação de pasta térmica de alta condutividade e pads térmicos.',
    features: ['Redução de até 25°C na CPU e placa de vídeo', 'Eliminação de ruídos e ventoinha disparada', 'Prolonga a vida útil do processador'],
  },
  {
    id: 'diagnostico',
    title: 'Diagnóstico Avançado de Problemas',
    deviceType: 'Computador' as EquipmentType,
    icon: Activity,
    image: '',
    description:
      'Testes instrumentados com osciloscópio, câmera termográfica para localização de curtos, multímetro de precisão e esquemáticos eletrônicos.',
    features: ['Localização de curtos sem adivinhação', 'Análise de integridade de barramentos', 'Laudo técnico detalhado com fotos'],
  },
];

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  return (
    <section id="servicos" className="py-16 md:py-24 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-cyan-400">Serviços Especializados</p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Soluções completas com fotos reais de laboratório técnico
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Restauração de carcaça, parte de sistema, troca de SSD, backup seguro e diagnósticos avançados com procedência e garantia.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="group relative rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all duration-200"
              >
                {/* Photo header if available */}
                {s.image && (
                  <div className="relative h-40 w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-2.5 left-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/80 border border-cyan-500/40 text-cyan-400 backdrop-blur-md">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {!s.image && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {s.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {s.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-800/70 pt-3">
                    {s.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-cyan-400 shrink-0" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onSelectService(s.title, s.deviceType)}
                    className="w-full py-2 px-3 text-xs font-semibold text-cyan-400 hover:text-slate-900 bg-cyan-950/30 hover:bg-cyan-400 border border-cyan-500/30 hover:border-cyan-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Solicitar Orçamento</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
