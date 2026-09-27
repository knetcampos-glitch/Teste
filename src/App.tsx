import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { api } from './services/api.ts';
import type { CompanySettings, GoogleReview } from './types/index.ts';

import { HomeView } from './pages/public/HomeView.tsx';
import { OrderTrackingView } from './pages/public/OrderTrackingView.tsx';
import { AdminLoginView } from './pages/admin/AdminLoginView.tsx';
import { AdminLayout } from './pages/admin/AdminLayout.tsx';

function AppContent() {
  const { user, loading: authLoading } = useAuth();

  const [currentRoute, setCurrentRoute] = useState<'home' | 'tracking' | 'admin'>('home');
  const [trackingCode, setTrackingCode] = useState<string>('');

  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);

  // Parse initial URL
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;

      if (path.startsWith('/admin')) {
        setCurrentRoute('admin');
      } else if (path.startsWith('/os')) {
        setCurrentRoute('tracking');
        // Check if there is a subpath like /os/8F72K
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          setTrackingCode(parts[1]);
        } else {
          // Check query param ?q= or ?codigo=
          const params = new URLSearchParams(window.location.search);
          const q = params.get('q') || params.get('codigo') || '';
          if (q) setTrackingCode(q);
        }
      } else {
        setCurrentRoute('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Fetch initial public company data & reviews
  useEffect(() => {
    api
      .getCompany()
      .then((c) => setCompany(c))
      .catch((err) => console.error('Failed loading company settings:', err));

    api
      .getReviews()
      .then((res) => setReviews(res.reviews))
      .catch((err) => console.error('Failed loading reviews:', err));
  }, []);

  const navigateTo = (view: 'home' | 'tracking' | 'admin', code?: string) => {
    setCurrentRoute(view);
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (view === 'tracking') {
      const path = code ? `/os/${code}` : '/os';
      setTrackingCode(code || '');
      window.history.pushState({}, '', path);
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-cyan-400">Iniciando Tech Assistência...</span>
        </div>
      </div>
    );
  }

  // Admin routing
  if (currentRoute === 'admin') {
    if (!user) {
      return <AdminLoginView onBackToSite={() => navigateTo('home')} />;
    }
    return <AdminLayout onBackToSite={() => navigateTo('home')} />;
  }

  // Public OS Tracking routing
  if (currentRoute === 'tracking') {
    return (
      <OrderTrackingView
        initialCode={trackingCode}
        onBackToHome={() => navigateTo('home')}
      />
    );
  }

  // Public Home View
  return (
    <HomeView
      company={company}
      reviews={reviews}
      onNavigate={(view, code) => navigateTo(view, code)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
