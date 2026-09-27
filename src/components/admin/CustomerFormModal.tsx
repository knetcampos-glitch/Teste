import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import type { Customer } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface CustomerFormModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSaved,
}) => {
  const isEditing = Boolean(customer);

  const [fullName, setFullName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName);
      setDocument(customer.document || '');
      setPhone(customer.phone);
      setWhatsapp(customer.whatsapp || customer.phone);
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
    } else {
      setFullName('');
      setDocument('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
    setError('');
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError('Nome completo e telefone são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName: fullName.trim(),
        document: document.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).trim(),
        email: email.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };

      let res: Customer;
      if (isEditing && customer) {
        res = await api.updateCustomer(customer.id, payload);
      } else {
        res = await api.createCustomer(payload);
      }
      onSaved(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente.');
    } finally {
      setLoading(false);
    }
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

        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h3>
            <p className="text-xs text-slate-400">
              Dados de contato e identificação para abertura de OS
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Ana Clara Souza"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CPF ou CNPJ</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone Principal *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp (com DDD)</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="62992482720"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Internas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Empresa parceira, prefere contato no período da tarde..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg"
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
