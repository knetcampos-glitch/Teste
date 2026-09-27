import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink, Send, Edit3 } from 'lucide-react';
import type { ServiceOrder } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface SendWhatsAppModalProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({ order, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      setLoading(true);
      api
        .getWhatsAppPayload(order.id, undefined, window.location.origin)
        .then((res) => {
          setMessage(res.message);
          setWhatsappUrl(res.whatsappUrl);
          setPhone(res.phone);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomMessageChange = (newText: string) => {
    setMessage(newText);
    const fullPhone = phone || '5511999999999';
    setWhatsappUrl(`https://wa.me/${fullPhone}?text=${encodeURIComponent(newText)}`);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Enviar OS pelo WhatsApp</h3>
            <p className="text-xs text-slate-400">
              Notificação com link único de rastreamento para o cliente
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Gerando mensagem da OS...</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Destinatário:</span>
              <span className="font-semibold text-white">
                {order.customerName} ({order.customerWhatsapp || order.customerPhone})
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Mensagem formatada (editável):</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>

              <textarea
                rows={9}
                value={message}
                onChange={(e) => handleCustomMessageChange(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700/80 p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
              />
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300">
              💡 <strong>Dica:</strong> A mensagem inclui o link exclusivo{' '}
              <code className="bg-cyan-950 px-1 py-0.5 rounded text-white">/os/{order.accessCode}</code>. O cliente acompanha as alterações de status em tempo real sem precisar receber mensagens repetidas.
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>📱 Abrir WhatsApp com a Mensagem</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
