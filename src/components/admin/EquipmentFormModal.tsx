import React, { useState, useEffect } from 'react';
import { X, HardDrive, Eye, EyeOff, Upload, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import type { Equipment, Customer, EquipmentType } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface EquipmentFormModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (equipment: Equipment) => void;
  customers: Customer[];
  defaultCustomerId?: string;
}

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onSaved,
  customers,
  defaultCustomerId,
}) => {
  const isEditing = Boolean(equipment);

  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState<EquipmentType>('Notebook');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [accessories, setAccessories] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [physicalCondition, setPhysicalCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (equipment) {
      setCustomerId(equipment.customerId);
      setType(equipment.type);
      setBrand(equipment.brand);
      setModel(equipment.model);
      setSerialNumber(equipment.serialNumber || '');
      setAssetTag(equipment.assetTag || '');
      setAccessories(equipment.accessories || '');
      setPassword(equipment.password || '');
      setPhysicalCondition(equipment.physicalCondition || '');
      setNotes(equipment.notes || '');
      setPhotos(equipment.photos || []);
    } else {
      setCustomerId(defaultCustomerId || customers[0]?.id || '');
      setType('Notebook');
      setBrand('');
      setModel('');
      setSerialNumber('');
      setAssetTag('');
      setAccessories('Carregador e cabo de força original');
      setPassword('');
      setPhysicalCondition('Sem avarias visíveis');
      setNotes('');
      setPhotos([]);
    }
    setError('');
  }, [equipment, isOpen, customers, defaultCustomerId]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Selecione o proprietário (cliente).');
      return;
    }
    if (!brand.trim() || !model.trim()) {
      setError('Marca e modelo são obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        customerId,
        type,
        brand: brand.trim(),
        model: model.trim(),
        serialNumber: serialNumber.trim(),
        assetTag: assetTag.trim(),
        accessories: accessories.trim(),
        password: password.trim(),
        physicalCondition: physicalCondition.trim(),
        notes: notes.trim(),
        photos,
      };

      let res: Equipment;
      if (isEditing && equipment) {
        res = await api.updateEquipment(equipment.id, payload);
      } else {
        res = await api.createEquipment(payload);
      }
      onSaved(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar equipamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="h-9 w-9 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Editar Equipamento' : 'Cadastrar Equipamento'}
            </h3>
            <p className="text-xs text-slate-400">
              Vincule o dispositivo a um cliente para abertura de OS
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cliente Proprietário *
            </label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="">Selecione o cliente...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Aparelho *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EquipmentType)}
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="Notebook">Notebook</option>
                <option value="Computador">Computador</option>
                <option value="Desktop">Desktop / Gabinete</option>
                <option value="All-in-One">All-in-One</option>
                <option value="Outro">Outro Equipamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca / Fabricante *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: Dell, Lenovo, Apple, Asus"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: Inspiron 15, ThinkPad T14"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Série (S/N)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Ex: CN-0M981-BR"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patrimônio / Tag</label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="Ex: PAT-0192"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Senha do Equipamento</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-0.5"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  <span>{showPassword ? 'Ocultar' : 'Ver'}</span>
                </button>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de logon do Windows/Mac"
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Acessórios Entregues</label>
            <input
              type="text"
              value={accessories}
              onChange={(e) => setAccessories(e.target.value)}
              placeholder="Ex: Fonte carregador Dell 65W, mouse sem fio, capa de proteção"
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Estado Físico na Entrada
            </label>
            <textarea
              rows={2}
              value={physicalCondition}
              onChange={(e) => setPhysicalCondition(e.target.value)}
              placeholder="Ex: Arranhões na tampa superior, dobradiça esquerda com folga, sem parafusos na base..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Observações Gerais</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionais sobre o equipamento..."
              className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Photos Upload Section */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-cyan-400" />
                <span>Fotos do Equipamento na Entrada</span>
              </span>
              <label className="cursor-pointer text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <Upload className="h-3.5 w-3.5" />
                <span>Anexar Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-900 h-24">
                    <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-rose-900/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic py-2">
                Nenhuma foto anexada. Registre fotos de riscos, tela ou estado de entrada.
              </p>
            )}
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
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
