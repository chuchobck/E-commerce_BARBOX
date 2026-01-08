import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar newsletter
    alert('¡Gracias por suscribirte!');
  };

  // Scroll to top y navegar
  const handleLinkClick = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  return (
    <footer className="footer" role="contentinfo">
      {/* Age Verification Banner */}
      <div className="footer-age-banner" role="alert" aria-label="Advertencia de edad">
        <div className="container">
          <div className="age-banner">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <p>
              <strong>VENTA RESPONSABLE:</strong> Prohibida la venta a menores de 18 años. Bebe con moderación.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="footer-badges" aria-label="Beneficios de comprar en BARBOX">
        <div className="container">
          <div className="badges-grid" role="list">
            <div className="badge-item" role="listitem">
              <i className="fas fa-shipping-fast" aria-hidden="true"></i>
              <div>
                <strong>Envío 24-48h</strong>
                <span>En pedidos +$50</span>
              </div>
            </div>
            <div className="badge-item" role="listitem">
              <i className="fab fa-whatsapp" aria-hidden="true"></i>
              <div>
                <strong>Atención 24/7</strong>
                <span>Soporte WhatsApp</span>
              </div>
            </div>
            <div className="badge-item" role="listitem">
              <i className="fas fa-lock" aria-hidden="true"></i>
              <div>
                <strong>Pago Seguro</strong>
                <span>100% Protegido</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Contact */}
            <div className="footer-col">
              <div className="footer-logo">
                <i className="fas fa-wine-glass-alt"></i>
                <span>BARBOX</span>
              </div>
              <p className="footer-tagline">Bebidas premium desde 2020</p>

              <ul className="contact-list">
                <li>
                  <i className="fab fa-whatsapp" aria-hidden="true"></i>
                  <a href="https://wa.me/593991730968" target="_blank" rel="noopener noreferrer" tabIndex={0} aria-label="Contactar por WhatsApp al +593 99 173 0968">
                    +593 99 173 0968
                  </a>
                </li>
              </ul>

              {/* Social Media */}
              <div className="footer-social" role="group" aria-label="Redes sociales">
                <a href="https://instagram.com/barbox" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram (abre en nueva ventana)" tabIndex={0}>
                  <i className="fab fa-instagram" aria-hidden="true"></i>
                  <span>@barbox</span>
                </a>
              </div>
            </div>

            {/* Column 2: Navegación Principal */}
            <div className="footer-col">
              <h3 className="footer-title">Navegación</h3>
              <ul className="footer-list">
                <li><Link to="/" tabIndex={0}>Inicio</Link></li>
                <li><Link to="/catalogo" tabIndex={0}>Catálogo</Link></li>
                <li><Link to="/promociones" tabIndex={0}>Promociones</Link></li>
                <li><Link to="/contacto" tabIndex={0}>Contacto</Link></li>
                <li><Link to="/acerca" tabIndex={0}>Nosotros</Link></li>
              </ul>
            </div>

            {/* Column 3: Categories */}
            <div className="footer-col">
              <h3 className="footer-title">Categorías</h3>
              <ul className="footer-list">
                <li><Link to="/catalogo?categoriaId=1" tabIndex={0}>Whisky</Link></li>
                <li><Link to="/catalogo?categoriaId=2" tabIndex={0}>Vinos</Link></li>
                <li><Link to="/catalogo?categoriaId=3" tabIndex={0}>Cervezas</Link></li>
                <li><Link to="/catalogo?categoriaId=4" tabIndex={0}>Ron</Link></li>
                <li><Link to="/catalogo?categoriaId=5" tabIndex={0}>Vodka</Link></li>
                <li><Link to="/catalogo" tabIndex={0}>Ver todo</Link></li>
              </ul>
            </div>

            {/* Column 4: Mi Cuenta */}
            <div className="footer-col">
              <h3 className="footer-title">Mi Cuenta</h3>
              <ul className="footer-list">
                <li><Link to="/login" tabIndex={0}>Iniciar Sesión</Link></li>
                <li><Link to="/register" tabIndex={0}>Registrarse</Link></li>
                <li><Link to="/mi-cuenta" tabIndex={0}>Mi Perfil</Link></li>
                <li><Link to="/mis-pedidos" tabIndex={0}>Mis Pedidos</Link></li>
                <li><Link to="/carrito" tabIndex={0}>Mi Carrito</Link></li>
                <li><Link to="/favoritos" tabIndex={0}>Favoritos</Link></li>
              </ul>
            </div>

            {/* Column 5: Newsletter */}
            <div className="footer-col">
              <h3 className="footer-title" id="newsletter-heading">Newsletter</h3>
              <p className="footer-newsletter__text" id="newsletter-desc">Recibe ofertas exclusivas</p>

              <form
                className="newsletter-form"
                onSubmit={handleNewsletterSubmit}
                aria-labelledby="newsletter-heading"
                aria-describedby="newsletter-desc"
              >
                <label htmlFor="newsletter-email" className="sr-only">Correo electrónico para newsletter</label>
                <input
                  type="email"
                  id="newsletter-email"
                  placeholder="tu@email.com"
                  required
                  aria-required="true"
                  autoComplete="email"
                />
                <button type="submit" aria-label="Suscribirse al newsletter" tabIndex={0}>
                  <i className="fas fa-paper-plane" aria-hidden="true"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="footer-payments">
        <div className="container">
          <p className="payment-methods-title" id="payment-heading">Métodos de pago aceptados</p>
          <div className="payment-methods" role="list" aria-labelledby="payment-heading">
            <div className="payment-icon" role="listitem" aria-label="PayPal">
              <i className="fab fa-paypal" aria-hidden="true"></i>
              <span>PayPal</span>
            </div>
            <div className="payment-icon" role="listitem" aria-label="Tarjeta de Crédito o Débito">
              <i className="fas fa-credit-card" aria-hidden="true"></i>
              <span>Tarjeta de crédito</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom__content">
            <p>&copy; 2020-2025 <strong>BARBOX</strong>. Todos los derechos reservados.</p>
            <p className="footer-disclaimer">
              Las marcas e imágenes pertenecen a sus respectivos propietarios.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="back-to-top"
              aria-label="Volver al inicio de la página"
              tabIndex={0}
            >
              <i className="fas fa-arrow-up" aria-hidden="true"></i> <span>Arriba</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
