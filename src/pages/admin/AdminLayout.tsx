import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wrench,
  Users,
  HardDrive,
  Star,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Plus,
  Cpu,
  Menu,
  X,
  Lock,
  Search,
} from 'lucide-react';
import { TechLogo } from '../../components/common/TechLogo.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import type {
  ServiceOrder,
  Customer,
  Equipment,
  GoogleReview,
  CompanySettings,
  PublicServiceRequest,
} from '../../types/index.ts';

import { AdminDashboardView } from './AdminDashboardView.tsx';
import { AdminOrdersView } from './AdminOrdersView.tsx';
import { AdminCustomersView } from './AdminCustomersView.tsx';
import { AdminEquipmentsView } from './AdminEquipmentsView.tsx';
import { AdminReviewsView } from './AdminReviewsView.tsx';
import { AdminLeadsView } from './AdminLeadsView.tsx';
import { AdminSettingsView } from './AdminSettingsView.tsx';

import { OrderFormModal } from '../../components/admin/OrderFormModal.tsx';
import { OrderStatusModal } from '../../components/admin/OrderStatusModal.tsx';
import { SendWhatsAppModal } from '../../components/admin/SendWhatsAppModal.tsx';
import { OrderReceiptModal } from '../../components/admin/OrderReceiptModal.tsx';
import { CustomerFormModal } from '../../components/admin/CustomerFormModal.tsx';
import { EquipmentFormModal } from '../../components/admin/EquipmentFormModal.tsx';
import { ChangePasswordModal } from '../../components/admin/ChangePasswordModal.tsx';

interface AdminLayoutProps {
  onBackToSite: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToSite }) => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'customers' | 'equipments' | 'reviews' | 'leads' | 'settings'
  >('dashboard');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [leads, setLeads] = useState<PublicServiceRequest[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  // Modals
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusOrder, setStatusOrder] = useState<ServiceOrder | null>(null);

  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappOrder, setWhatsappOrder] = useState<ServiceOrder | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<ServiceOrder | null>(null);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [targetCustomerIdForEquipment, setTargetCustomerIdForEquipment] = useState<string | undefined>();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Load all data
  const loadData = async () => {
    try {
      const [m, ords, custs, eqs, revs, lds, sets] = await Promise.all([
        api.getDashboard(),
        api.getOrders(),
        api.getCustomers(),
        api.getEquipments(),
        api.getAdminReviews(),
        api.getServiceRequests(),
        api.getSettings(),
      ]);
      setMetrics(m);
      setOrders(ords);
      setCustomers(custs);
      setEquipments(eqs);
      setReviews(revs);
      setLeads(lds);
      setSettings(sets);
    } catch (err) {
      console.error('[Admin] Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderSaved = (saved: ServiceOrder) => {
    loadData();
  };

  const handleStatusUpdated = (updated: ServiceOrder) => {
    loadData();
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      loadData();
    } catch (err) {
      alert('Erro ao excluir Ordem de Serviço.');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await api.deleteCustomer(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cliente.');
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    try {
      await api.deleteEquipment(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir equipamento.');
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await api.updateServiceRequestStatus(id, status);
      loadData();
    } catch (err) {
      alert('Erro ao atualizar solicitação.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Ordens de Serviço', icon: Wrench, badge: metrics?.activeOrdersCount },
    { id: 'customers', label: 'Clientes', icon: Users, badge: customers.length },
    { id: 'equipments', label: 'Equipamentos', icon: HardDrive, badge: equipments.length },
    { id: 'reviews', label: 'Avaliações Google', icon: Star },
    {
      id: 'leads',
      label: 'Solicitações Web',
      icon: Inbox,
      badge: leads.filter((l) => l.status === 'Novo').length,
    },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-950 p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2">
            <TechLogo size="md" />
            <div>
              <span className="font-black text-base tracking-tight">
                <span className="text-red-600">Tech</span> <span className="text-white">Assistência</span>
              </span>
              <p className="text-[10px] text-cyan-400 font-mono">PAINEL ADMINISTRATIVO</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => {
              setSelectedOrder(null);
              setOrderModalOpen(true);
            }}
            className="w-full py-2.5 px-3 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Ordem de Serviço</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-cyan-400 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account & Logout */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <span className="text-[11px] font-bold text-white block truncate">{user?.name || 'Administrador'}</span>
            <span className="text-[10px] text-slate-400 font-mono truncate block">{user?.email}</span>
          </div>

          <button
            onClick={() => setPasswordModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Alterar Senha</span>
          </button>

          <button
            onClick={onBackToSite}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver Site Público</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <TechLogo size="sm" />
          <span className="font-black text-sm">
            <span className="text-red-600">Tech</span> <span className="text-white">Assistência Admin</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOrder(null);
              setOrderModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold"
            title="Nova OS"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg ${
                  activeTab === item.id ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={onBackToSite}
              className="flex-1 py-2 text-xs text-center text-slate-300 bg-slate-900 rounded-lg"
            >
              Ver Site
            </button>
            <button
              onClick={logout}
              className="flex-1 py-2 text-xs text-center text-rose-300 bg-rose-950/40 rounded-lg"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'dashboard' && (
            <AdminDashboardView
              metrics={metrics}
              onOpenOrder={(ord) => {
                setSelectedOrder(ord);
                setOrderModalOpen(true);
              }}
              onSendWhatsApp={(ord) => {
                setWhatsappOrder(ord);
                setWhatsappModalOpen(true);
              }}
              onUpdateStatus={(ord) => {
                setStatusOrder(ord);
                setStatusModalOpen(true);
              }}
              onNewOrder={() => {
                setSelectedOrder(null);
                setOrderModalOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersView
              orders={orders}
              onNewOrder={() => {
                setSelectedOrder(null);
                setOrderModalOpen(true);
              }}
              onEditOrder={(ord) => {
                setSelectedOrder(ord);
                setOrderModalOpen(true);
              }}
              onSendWhatsApp={(ord) => {
                setWhatsappOrder(ord);
                setWhatsappModalOpen(true);
              }}
              onUpdateStatus={(ord) => {
                setStatusOrder(ord);
                setStatusModalOpen(true);
              }}
              onPrintReceipt={(ord) => {
                setReceiptOrder(ord);
                setReceiptModalOpen(true);
              }}
              onDeleteOrder={handleDeleteOrder}
            />
          )}

          {activeTab === 'customers' && (
            <AdminCustomersView
              customers={customers}
              equipments={equipments}
              orders={orders}
              onNewCustomer={() => {
                setSelectedCustomer(null);
                setCustomerModalOpen(true);
              }}
              onEditCustomer={(c) => {
                setSelectedCustomer(c);
                setCustomerModalOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
              onNewOrderForCustomer={(cid) => {
                setSelectedOrder(null);
                setOrderModalOpen(true);
              }}
              onNewEquipmentForCustomer={(cid) => {
                setSelectedEquipment(null);
                setTargetCustomerIdForEquipment(cid);
                setEquipmentModalOpen(true);
              }}
            />
          )}

          {activeTab === 'equipments' && (
            <AdminEquipmentsView
              equipments={equipments}
              customers={customers}
              onNewEquipment={() => {
                setSelectedEquipment(null);
                setEquipmentModalOpen(true);
              }}
              onEditEquipment={(eq) => {
                setSelectedEquipment(eq);
                setEquipmentModalOpen(true);
              }}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviewsView
              reviews={reviews}
              company={settings}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'leads' && (
            <AdminLeadsView
              leads={leads}
              onUpdateStatus={handleUpdateLeadStatus}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsView
              settings={settings}
              onSaved={(newSet) => setSettings(newSet)}
              onOpenChangePassword={() => setPasswordModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Global Modals */}
      <OrderFormModal
        isOpen={orderModalOpen}
        order={selectedOrder}
        onClose={() => setOrderModalOpen(false)}
        onSaved={handleOrderSaved}
        customers={customers}
        equipments={equipments}
      />

      <OrderStatusModal
        isOpen={statusModalOpen}
        order={statusOrder}
        onClose={() => setStatusModalOpen(false)}
        onUpdated={handleStatusUpdated}
      />

      <SendWhatsAppModal
        isOpen={whatsappModalOpen}
        order={whatsappOrder}
        onClose={() => setWhatsappModalOpen(false)}
      />

      <OrderReceiptModal
        isOpen={receiptModalOpen}
        order={receiptOrder}
        company={settings}
        onClose={() => setReceiptModalOpen(false)}
      />

      <CustomerFormModal
        isOpen={customerModalOpen}
        customer={selectedCustomer}
        onClose={() => setCustomerModalOpen(false)}
        onSaved={() => loadData()}
      />

      <EquipmentFormModal
        isOpen={equipmentModalOpen}
        equipment={selectedEquipment}
        defaultCustomerId={targetCustomerIdForEquipment}
        customers={customers}
        onClose={() => {
          setEquipmentModalOpen(false);
          setTargetCustomerIdForEquipment(undefined);
        }}
        onSaved={() => loadData()}
      />

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};
