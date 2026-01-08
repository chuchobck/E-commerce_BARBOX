import React from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './ContactoPage.css';

const ContactoPage: React.FC = () => {
  return (

    <>
      <Header />

      <main className="contact-page">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="container">
            <div className="contact-hero__content">
              <h1 className="contact-hero__title">¿Cómo podemos ayudarte?</h1>
              <p className="contact-hero__subtitle">
                Estamos aquí para atenderte. Contáctanos por el canal de tu preferencia.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Contact Cards */}
        <section className="quick-contact">
          <div className="container">
            <div className="quick-contact-grid quick-contact-grid--single">
              <a
                href="https://wa.me/593991730968"
                className="quick-contact-card quick-contact-card--whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={0}
                aria-label="Contactar por WhatsApp al +593 99 173 0968"
              >
                <div className="quick-contact-card__icon">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <h2 className="quick-contact-card__title">WhatsApp</h2>
                <p className="quick-contact-card__text">Atención inmediata 24/7</p>
                <p className="quick-contact-card__value">+593 99 173 0968</p>
                <span className="quick-contact-card__badge">Recomendado</span>
              </a>
            </div>
          </div>
        </section>



        {/* Locations */}
        <section className="contact-locations">
          <div className="container">
            <h2 className="section-title">Nuestras Sucursales</h2>
            <p className="section-subtitle">Visítanos en nuestras tiendas físicas</p>

            <div className="locations-contact-grid">
              <div className="location-contact-card">
                <div className="location-contact-card__image">
                  <img
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop&q=85"
                    alt="Sucursal Quito"
                    loading="lazy"
                  />
                  <span className="location-badge">Principal</span>
                </div>
                <div className="location-contact-card__content">
                  <h3 className="location-contact-card__city">
                    <i className="fas fa-map-marker-alt"></i>
                    Quito - Matriz
                  </h3>
                  <p className="location-contact-card__address">
                    <i className="fas fa-location-dot"></i>
                    Av. Amazonas N24-156 y Colón<br />
                    Edificio España, Local 3<br />
                    Sector La Mariscal
                  </p>
                  <div className="location-contact-card__details">
                    <div className="location-detail">
                      <i className="fab fa-whatsapp"></i>
                      <a href="https://wa.me/593991730968" target="_blank" rel="noopener noreferrer">
                        +593 99 173 0968
                      </a>
                    </div>
                    <div className="location-detail">
                      <i className="fas fa-clock"></i>
                      <span>Lun-Sáb: 9:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com"
                    className="btn btn--outline btn--sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-directions"></i>
                    Cómo llegar
                  </a>
                </div>
              </div>

              <div className="location-contact-card">
                <div className="location-contact-card__image">
                  <img
                    src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop&q=85"
                    alt="Sucursal Guayaquil"
                    loading="lazy"
                  />
                </div>
                <div className="location-contact-card__content">
                  <h3 className="location-contact-card__city">
                    <i className="fas fa-map-marker-alt"></i>
                    Guayaquil
                  </h3>
                  <p className="location-contact-card__address">
                    <i className="fas fa-location-dot"></i>
                    Av. Francisco de Orellana<br />
                    Mall del Sol, Local 215<br />
                    Segundo Piso
                  </p>
                  <div className="location-contact-card__details">
                    <div className="location-detail">
                      <i className="fab fa-whatsapp"></i>
                      <a href="https://wa.me/593991730968" target="_blank" rel="noopener noreferrer">
                        +593 99 173 0968
                      </a>
                    </div>
                    <div className="location-detail">
                      <i className="fas fa-clock"></i>
                      <span>Lun-Dom: 10:00 AM - 9:00 PM</span>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com"
                    className="btn btn--outline btn--sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-directions"></i>
                    Cómo llegar
                  </a>
                </div>
              </div>

              <div className="location-contact-card">
                <div className="location-contact-card__image">
                  <img
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop&q=85"
                    alt="Sucursal Cuenca"
                    loading="lazy"
                  />
                </div>
                <div className="location-contact-card__content">
                  <h3 className="location-contact-card__city">
                    <i className="fas fa-map-marker-alt"></i>
                    Cuenca
                  </h3>
                  <p className="location-contact-card__address">
                    <i className="fas fa-location-dot"></i>
                    Av. Ordóñez Lasso y<br />
                    Miguel Cordero, Esquina<br />
                    Sector Racar
                  </p>
                  <div className="location-contact-card__details">
                    <div className="location-detail">
                      <i className="fab fa-whatsapp"></i>
                      <a href="https://wa.me/593991730968" target="_blank" rel="noopener noreferrer">
                        +593 99 173 0968
                      </a>
                    </div>
                    <div className="location-detail">
                      <i className="fas fa-clock"></i>
                      <span>Lun-Sáb: 9:00 AM - 7:00 PM</span>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com"
                    className="btn btn--outline btn--sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-directions"></i>
                    Cómo llegar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal & Policies */}
      </main>

      <Footer />
    </>
  );
};

export default ContactoPage;
