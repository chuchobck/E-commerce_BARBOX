import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import './MiCuentaPage.css';

const MiCuentaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');
  const [editMode, setEditMode] = useState(false);
  
  // Estado del formulario de perfil - Se sincroniza con los datos del usuario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ruc_cedula: '',
  });

  // ✅ Sincronizar datos del usuario al cargar o cuando cambie el usuario
  React.useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.cliente?.nombre1 || '',
        apellido: user.cliente?.apellido1 || '',
        email: user.email || '',
        telefono: user.cliente?.telefono || '',
        celular: user.cliente?.celular || '',
        direccion: user.cliente?.direccion || '',
        ruc_cedula: user.cliente?.ruc_cedula || '',
      });
    }
  }, [user]);

  // Redirigir si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/mi-cuenta' } });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar actualización de perfil con API
    setEditMode(false);
    alert('Perfil actualizado correctamente');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Header />
      
      <main className="mi-cuenta-page">
        {/* Hero Section */}
        <section className="cuenta-hero">
          <div className="container">
            <div className="cuenta-hero__content">
              <div className="cuenta-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div className="cuenta-hero__info">
                <h1>¡Hola, {user.cliente?.nombre1 || 'Usuario'}!</h1>
                <p>Gestiona tu cuenta y preferencias</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="cuenta-content">
          <div className="container">
            <div className="cuenta-layout">
              
              {/* Sidebar */}
              <aside className="cuenta-sidebar">
                <nav className="cuenta-nav">
                  <button 
                    className={`cuenta-nav__item ${activeTab === 'perfil' ? 'active' : ''}`}
                    onClick={() => setActiveTab('perfil')}
                    tabIndex={0}
                    aria-current={activeTab === 'perfil' ? 'page' : undefined}
                  >
                    <i className="fas fa-user-circle"></i>
                    <span>Mi Perfil</span>
                  </button>
                  <button 
                    className={`cuenta-nav__item ${activeTab === 'seguridad' ? 'active' : ''}`}
                    onClick={() => setActiveTab('seguridad')}
                    tabIndex={0}
                    aria-current={activeTab === 'seguridad' ? 'page' : undefined}
                  >
                    <i className="fas fa-shield-alt"></i>
                    <span>Seguridad</span>
                  </button>
                  <button 
                    className="cuenta-nav__item"
                    onClick={() => navigate('/mis-pedidos')}
                  >
                    <i className="fas fa-box"></i>
                    <span>Mis Pedidos</span>
                  </button>
                  <button 
                    className="cuenta-nav__item"
                    onClick={() => navigate('/favoritos')}
                  >
                    <i className="fas fa-heart"></i>
                    <span>Favoritos</span>
                  </button>
                  <button 
                    className="cuenta-nav__item cuenta-nav__item--danger"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                  </button>
                </nav>
              </aside>

              {/* Main Panel */}
              <div className="cuenta-panel">
                
                {/* Tab: Perfil */}
                {activeTab === 'perfil' && (
                  <div className="cuenta-section">
                    <div className="cuenta-section__header">
                      <h2>
                        <i className="fas fa-user-circle"></i>
                        Información Personal
                      </h2>
                      {!editMode && (
                        <button 
                          className="btn-edit"
                          onClick={() => setEditMode(true)}
                        >
                          <i className="fas fa-edit"></i>
                          Editar
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSaveProfile} className="cuenta-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="nombre">Nombre</label>
                          <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Tu nombre"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="apellido">Apellido</label>
                          <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="Tu apellido"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="telefono">Teléfono</label>
                          <input
                            type="tel"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="022 123 4567"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="celular">Celular</label>
                          <input
                            type="tel"
                            id="celular"
                            name="celular"
                            value={formData.celular}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            placeholder="099 123 4567"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="ruc_cedula">Cédula / RUC</label>
                        <input
                          type="text"
                          id="ruc_cedula"
                          name="ruc_cedula"
                          value={formData.ruc_cedula}
                          onChange={handleInputChange}
                          disabled={true}
                          placeholder="1234567890"
                        />
                        <small className="field-hint">Este campo no se puede modificar</small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <input
                          type="text"
                          id="direccion"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          placeholder="Tu dirección de entrega"
                        />
                      </div>

                      {editMode && (
                        <div className="form-actions">
                          <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => setEditMode(false)}
                          >
                            Cancelar
                          </button>
                          <button type="submit" className="btn-primary">
                            <i className="fas fa-save"></i>
                            Guardar Cambios
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Tab: Seguridad */}
                {activeTab === 'seguridad' && (
                  <div className="cuenta-section">
                    <div className="cuenta-section__header">
                      <h2>
                        <i className="fas fa-shield-alt"></i>
                        Seguridad de la Cuenta
                      </h2>
                    </div>

                    <div className="security-options">
                      <div className="security-item">
                        <div className="security-item__info">
                          <h3>Cambiar Contraseña</h3>
                          <p>Actualiza tu contraseña periódicamente para mayor seguridad</p>
                        </div>
                        <button className="btn-outline">
                          <i className="fas fa-key"></i>
                          Cambiar
                        </button>
                      </div>
                    </div>
                  </div>
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

export default MiCuentaPage;
