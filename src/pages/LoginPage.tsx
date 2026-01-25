import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Si viene de /register, mostrar tab de registro
  React.useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    }
  }, [location.pathname]);

  return (
    <>
      <Header />

      <main className="login-page-modern">
        {/* Main Content */}
        <section className="login-content-modern">
          <div className="container">
            <div className="login-wrapper-modern">
              {/* Tabs de navegación */}
              <div className="login-tabs">
                <button
                  className={`login-tab ${activeTab === 'login' ? 'login-tab--active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Iniciar Sesión
                </button>
                <button
                  className={`login-tab ${activeTab === 'register' ? 'login-tab--active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  <i className="fas fa-user-plus"></i>
                  Registrarse
                </button>
              </div>

              {/* Contenido según tab activo */}
              <div className="login-form-container-modern">
                {activeTab === 'login' ? (
                  <Login />
                ) : (
                  <Register />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default LoginPage;
