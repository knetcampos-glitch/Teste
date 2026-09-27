import React, { useState } from 'react';
import { Navbar } from '../../components/public/Navbar.tsx';
import { Hero } from '../../components/public/Hero.tsx';
import { ServicesGrid } from '../../components/public/ServicesGrid.tsx';
import { Differentials } from '../../components/public/Differentials.tsx';
import { ReviewsSection } from '../../components/public/ReviewsSection.tsx';
import { Footer } from '../../components/public/Footer.tsx';
import { ServiceRequestModal } from '../../components/public/ServiceRequestModal.tsx';
import type { CompanySettings, GoogleReview, EquipmentType } from '../../types/index.ts';

interface HomeViewProps {
  company: CompanySettings | null;
  reviews: GoogleReview[];
  onNavigate: (view: 'home' | 'tracking' | 'admin', trackingCode?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  company,
  reviews,
  onNavigate,
}) => {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState<EquipmentType>('Notebook');

  const handleOpenRequest = (service = '', deviceType: EquipmentType = 'Notebook') => {
    setSelectedService(service);
    setSelectedDeviceType(deviceType);
    setRequestModalOpen(true);
  };

  const handleOpenWhatsApp = () => {
    const phone = company?.whatsapp || '62992482720';
    const message = 'Olá! Gostaria de informações sobre atendimento e assistência técnica para meu equipamento.';
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        company={company}
        onNavigate={onNavigate}
        onRequestService={() => handleOpenRequest()}
        currentView="home"
      />

      <main className="flex-1">
        <Hero
          company={company}
          onRequestService={() => handleOpenRequest()}
          onTrackOrder={() => onNavigate('tracking')}
          onOpenWhatsApp={handleOpenWhatsApp}
        />

        <ServicesGrid
          onSelectService={(service, deviceType) => handleOpenRequest(service, deviceType)}
        />

        <Differentials />

        <ReviewsSection reviews={reviews} company={company} />
      </main>

      <Footer company={company} onNavigate={onNavigate} />

      <ServiceRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        defaultService={selectedService}
        defaultDeviceType={selectedDeviceType}
      />
    </div>
  );
};
