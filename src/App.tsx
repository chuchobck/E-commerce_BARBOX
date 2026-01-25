import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { ToastProvider } from './components/Common/Toast';
import ErrorBoundary from './components/Common/ErrorBoundary';
import KeyboardShortcutsHelp from './components/Common/KeyboardShortcutsHelp';
import SkipLink from './components/Common/SkipLink';
import FloatingCart from './components/FloatingCart/FloatingCart';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CatalogoPage from './pages/CatalogoPage';
import PromocionesPage from './pages/PromocionesPage';
import ContactoPage from './pages/ContactoPage';
import AcercaPage from './pages/AcercaPage';
import CarritoPage from './pages/CarritoPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmacionPedidoPage from './pages/ConfirmacionPedidoPage';
import MiCuentaPage from './pages/MiCuentaPage';
import MisPedidosNewPage from './pages/MisPedidosNewPage';
import FavoritosPage from './pages/FavoritosPage';
import NotFoundPage from './pages/NotFoundPage';
import './styles/accessibility.css'; // WCAG 2.2 Accessibility Styles
import './App.css';

// 💳 Configuración de PayPal
// Client ID de PayPal Sandbox
const paypalOptions = {
  clientId: 'AS6D0zcPMVvNOtc0IxDNQDyHzIZewqKfLrOVELOSKB8A_zrho0TaWThxPF6tLJm0Havv4XYVQdFHogpj',
  currency: 'USD',
  intent: 'capture',
};

// Componente para rutas protegidas (Mi Cuenta, Checkout, etc.)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Componente que usa hooks que requieren Router
const RouterContent: React.FC<{ showKeyboardHelp: boolean; setShowKeyboardHelp: (v: boolean) => void }> = ({ showKeyboardHelp, setShowKeyboardHelp }) => {
  useKeyboardShortcuts();

  return (
    <>
      {/* WCAG 2.4.1: Skip Link para saltar navegación */}
      <SkipLink targetId="main-content" label="Saltar al contenido principal" />
      
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/promociones" element={<PromocionesPage />} />
        <Route path="/contacto" element={<ContactoPage />} />
        <Route path="/acerca" element={<AcercaPage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/favoritos" element={<FavoritosPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/terminos" element={<AcercaPage />} />
        <Route path="/privacidad" element={<AcercaPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/confirmacion-pedido" element={<ProtectedRoute><ConfirmacionPedidoPage /></ProtectedRoute>} />
        <Route path="/mi-cuenta" element={<ProtectedRoute><MiCuentaPage /></ProtectedRoute>} />
        <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidosNewPage /></ProtectedRoute>} />
        
        {/* Ruta 404 - Debe estar al final */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Carrito flotante - visible en todas las páginas */}
      <FloatingCart />
      
      <KeyboardShortcutsHelp 
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
    </>
  );
};

// Componente interno que usa los hooks y auth
const AppContent: React.FC = () => {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const { user } = useAuth();

  // Exponer el modal de ayuda globalmente para Ctrl+/
  React.useEffect(() => {
    window.addEventListener('show-keyboard-help' as any, () => {
      setShowKeyboardHelp(true);
    });
  }, []);

  return (
    <CarritoProvider usuarioId={user?.id_usuario}>
      <FavoritosProvider usuarioId={user?.id_usuario}>
        <ToastProvider>
          <Router>
            <RouterContent showKeyboardHelp={showKeyboardHelp} setShowKeyboardHelp={setShowKeyboardHelp} />
          </Router>
        </ToastProvider>
      </FavoritosProvider>
    </CarritoProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <PayPalScriptProvider options={paypalOptions}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PayPalScriptProvider>
    </ErrorBoundary>
  );
}

export default App;
