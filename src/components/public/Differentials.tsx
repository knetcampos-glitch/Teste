import React from 'react';
import { ShieldCheck, Link2, Clock, CheckCircle, Cpu, Zap, Eye, HelpCircle } from 'lucide-react';

export const Differentials: React.FC = () => {
  const items = [
    {
      icon: Link2,
      title: 'Acompanhamento por Link Único',
      description:
        'Sem necessidade de cadastrar senhas longas ou baixar apps. Você recebe um link exclusivo pelo WhatsApp (ex: seusite.com/os/8F72K) para acompanhar tudo no celular em tempo real.',
    },
    {
      icon: ShieldCheck,
      title: 'Laboratório com Proteção Antiestática ESD',
      description:
        'Bancadas técnicas aterradas, pulseiras antiestáticas e instrumentos certificados para que nenhuma descarga invisível danifique os semicondutores delicados do seu equipamento.',
    },
    {
      icon: Eye,
      title: 'Orçamento 100% Transparente',
      description:
        'Nada de surpresas na hora de pagar. Discriminação detalhada de cada peça e serviço com valor de mão de obra. Você aprova ou recusa com 1 clique direto na tela.',
    },
    {
      icon: Cpu,
      title: 'Peças Originais e de Alta Performance',
      description:
        'Trabalhamos com fornecedores homologados para garantir telas, teclados, baterias, SSDs e memórias com nota fiscal e garantia de até 12 meses do fabricante.',
    },
    {
      icon: Clock,
      title: 'Diagnóstico Ágil em até 24 Horas',
      description:
        'Sabemos que seu notebook ou PC é fundamental para seu trabalho ou estudos. Priorizamos a triagem rápida com laudo técnico claro e objetivo.',
    },
    {
      icon: Zap,
      title: 'Garantia Legal de 90 Dias em Todos os Serviços',
      description:
        'Todos os reparos de hardware e instalações são entregues com recibo e termo de garantia assegurado pela legislação do consumidor (CDC).',
    },
  ];

  return (
    <section id="diferenciais" className="py-16 md:py-24 border-t border-slate-800/80 bg-slate-900/40 tech-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-cyan-400">Por que escolher nossa assistência</p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Diferenciais construídos para proteger seu investimento
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Combinamos precisão eletrônica, processos transparentes e conveniência digital para você não perder tempo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
