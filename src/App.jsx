import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import RegistrationForm from './components/RegistrationForm';
import SponsorsSection from './components/SponsorsSection';
import ConfirmationModal from './components/ConfirmationModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // DETECCIÓN DE RUTA PRIVADA /admin EN LA URL
  // El público general no ve ningún enlace al admin en el home.
  // Solo se accede al escribir /admin o #/admin en el navegador.
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      const isAdminRequested = 
        path.endsWith('/admin') || 
        hash.includes('admin') || 
        search.includes('admin');

      if (isAdminRequested) {
        if (!isAdminLoggedIn) {
          setShowLoginModal(true);
        } else {
          setCurrentView('admin');
        }
      } else {
        if (currentView === 'admin' && !isAdminLoggedIn) {
          setCurrentView('landing');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, [isAdminLoggedIn, currentView]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user || { nombre: 'Administrador Principal', rol: 'Super Admin' });
    setIsAdminLoggedIn(true);
    setShowLoginModal(false);
    setCurrentView('admin');
    // Asegurar que la URL refleje /admin sin recargar
    if (!window.location.pathname.endsWith('/admin') && !window.location.hash.includes('admin')) {
      window.history.pushState(null, '', '#/admin');
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    if (!isAdminLoggedIn) {
      setCurrentView('landing');
      // Limpiar /admin de la URL
      if (window.location.pathname.endsWith('/admin')) {
        window.history.pushState(null, '', '/');
      } else if (window.location.hash.includes('admin')) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('landing');
    setShowLoginModal(false);
    // Limpiar /admin de la URL
    if (window.location.pathname.endsWith('/admin')) {
      window.history.pushState(null, '', '/');
    } else if (window.location.hash.includes('admin')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a389c] via-[#082b7c] to-[#071f5c] text-[#f3f4f2] flex flex-col font-sans selection:bg-[#A3E229] selection:text-[#150D8B]">
      
      {/* HEADER NAVEGABLE (Sin accesos visibles de administración) */}
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        {currentView === 'landing' ? (
          <>
            <Hero />
            <RegistrationForm onSuccess={(data) => setSuccessData(data)} />
            <SponsorsSection />
          </>
        ) : (
          <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />
        )}
      </main>

      {/* MODAL DE CONFIRMACIÓN DE INSCRIPCIÓN */}
      <ConfirmationModal 
        data={successData} 
        onClose={() => setSuccessData(null)} 
      />

      {/* MODAL DE LOGIN ADMIN (Activado exclusivamente al visitar /admin en la URL) */}
      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* BOTÓN FLOTANTE WHATSAPP DE ATENCIÓN DIRECTA */}
      <FloatingWhatsApp />

      {/* PIE DE PÁGINA (100% público) */}
      <Footer />

    </div>
  );
}
