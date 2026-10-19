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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-[#082363] border border-[#A3E229]/40 p-6 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-bold font-orbitron text-white mb-2">Copa Navidad LMSC 2026</h2>
            <p className="text-sm text-blue-200 mb-4">
              Actualizando datos en tiempo real...
            </p>
            <button
              onClick={() => { window.location.reload(); }}
              className="px-5 py-2.5 rounded-xl bg-[#A3E229] text-[#150D8B] font-black text-xs font-orbitron uppercase tracking-wider"
            >
              Actualizar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
        <ErrorBoundary>
          {currentView === 'landing' ? (
            <>
              <Hero />
              <RegistrationForm onSuccess={(data) => setSuccessData(data)} />
              <SponsorsSection />
            </>
          ) : (
            <AdminDashboard onLogout={handleLogout} currentUser={currentUser} />
          )}
        </ErrorBoundary>
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
