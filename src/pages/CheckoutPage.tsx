import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons } from '@paypal/react-paypal-js';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { checkoutService } from '../services/checkout.service';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { items, limpiarCarrito, carritoId: contextCarritoId } = useCarrito();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertMessage, setAlertMessage] = useState('');
  
  // Tab de método de pago: 'paypal' o 'tarjeta'
  const [activeTab, setActiveTab] = useState<'paypal' | 'tarjeta'>('paypal');
  
  // Datos de tarjeta (simulación visual)
  const [cardData, setCardData] = useState({
    numero: '',
    nombre: '',
    expiracion: '',
    cvv: ''
  });
  
  // Visualización de tarjeta
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'unknown'>('unknown');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const carritoId = localStorage.getItem('barbox_cart_id') || contextCarritoId;

  // Verificar autenticación y carrito
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    const carritoCheckout = localStorage.getItem('carritoCheckout');
    const carritoData = carritoCheckout ? JSON.parse(carritoCheckout) : null;
    
    if (!carritoId && !carritoData?.id_carrito) {
      mostrarAlerta('No hay productos en el carrito', 'error');
      setTimeout(() => navigate('/carrito'), 2000);
      return;
    }
    
    const itemsCount = carritoData?.items?.length || items?.length || 0;
    if (itemsCount === 0) {
      mostrarAlerta('No hay productos en el carrito', 'error');
      setTimeout(() => navigate('/carrito'), 2000);
      return;
    }

    setLoadingData(false);
  }, [isAuthenticated, carritoId, items, navigate]);

  const mostrarAlerta = (mensaje: string, tipo: 'success' | 'error') => {
    setAlertMessage(mensaje);
    setAlertType(tipo);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Detectar tipo de tarjeta por número
  const detectCardType = (numero: string) => {
    const cleaned = numero.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  // Formatear fecha de expiración
  const formatExpiration = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardData({ ...cardData, numero: formatted });
      setCardType(detectCardType(formatted));
    }
  };

  const handleExpirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiration(e.target.value);
    if (formatted.length <= 5) {
      setCardData({ ...cardData, expiracion: formatted });
    }
  };

  // Procesar pago con tarjeta (simulación)
  const handlePagoTarjeta = async () => {
    if (!cardData.numero || !cardData.nombre || !cardData.expiracion || !cardData.cvv) {
      mostrarAlerta('Por favor completa todos los campos de la tarjeta', 'error');
      return;
    }

    if (!carritoId) {
      mostrarAlerta('Error: No se encontró el carrito', 'error');
      return;
    }

    // Obtener id_cliente del usuario autenticado
    const id_cliente = user?.cliente?.id_cliente;
    if (!id_cliente) {
      console.error('❌ No se encontró id_cliente en user:', user);
      mostrarAlerta('Error: No se encontró información del cliente', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('💳 Procesando pago con tarjeta...');
      console.log('  carritoId:', carritoId);
      console.log('  id_cliente:', id_cliente);
      
      const response = await checkoutService.procesarCheckout({
        id_carrito: carritoId,
        id_metodo_pago: 2, // ID para tarjeta de crédito
        id_cliente: id_cliente,
        id_iva: 2
      });

      if (response.status === 'success') {
        mostrarAlerta('¡Pago realizado con éxito!', 'success');
        limpiarCarrito();
        localStorage.removeItem('carritoCheckout');
        
        setTimeout(() => {
          navigate('/confirmacion-pedido', {
            state: { factura: response.data }
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error en pago:', error);
      mostrarAlerta(error.response?.data?.message || 'Error al procesar el pago', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // PayPal - Crear orden
  const createPayPalOrder = async () => {
    try {
      const total = (totalCarrito * 1.15).toFixed(2);
      const response = await checkoutService.crearOrdenPayPal(carritoId!, parseFloat(total));
      return response.data.order_id;
    } catch (error) {
      console.error('Error creando orden PayPal:', error);
      mostrarAlerta('Error al crear orden de PayPal', 'error');
      throw error;
    }
  };

  // PayPal - Capturar pago
  const onPayPalApprove = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await checkoutService.confirmarPagoPayPal(
        data.orderID,
        carritoId!,
        4, // ID método pago PayPal (agregado a la BD)
        2  // ID IVA
      );

      if (response.status === 'success') {
        mostrarAlerta('¡Pago con PayPal exitoso!', 'success');
        limpiarCarrito();
        localStorage.removeItem('carritoCheckout');
        
        setTimeout(() => {
          navigate('/confirmacion-pedido', {
            state: { 
              factura: response.data?.factura,
              transaccion: data.orderID
            }
          });
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error capturando pago PayPal:', error);
      mostrarAlerta(error.response?.data?.message || 'Error al procesar pago PayPal', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const totalCarrito = items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  const iva = totalCarrito * 0.15;
  const totalConIva = totalCarrito + iva;

  if (loadingData) {
    return (
      <>
        <Header />
        <main className="checkout-page">
          <div className="container">
            <div className="loading-screen">
              <div className="spinner"></div>
              <p>Cargando checkout...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="checkout-page">
        <div className="container">
          {/* Header */}
          <div className="checkout-header">
            <button className="checkout-back-btn" onClick={() => navigate('/carrito')}>
              <i className="fas fa-arrow-left"></i>
              <span>Volver al carrito</span>
            </button>
            <h1 className="checkout-title">
              <i className="fas fa-credit-card"></i>
              Finalizar Compra
            </h1>
          </div>

          {/* Progress */}
          <div className="checkout-progress">
            <div className="progress-step completed">
              <span className="step-number">1</span>
              <span className="step-label">Carrito</span>
            </div>
            <div className="progress-line completed"></div>
            <div className="progress-step active">
              <span className="step-number">2</span>
              <span className="step-label">Pago</span>
            </div>
            <div className="progress-line"></div>
            <div className="progress-step">
              <span className="step-number">3</span>
              <span className="step-label">Confirmación</span>
            </div>
          </div>

          {/* Alertas */}
          {showAlert && (
            <div className={`alert alert-${alertType} show`}>
              <i className={`fas fa-${alertType === 'success' ? 'check' : 'exclamation'}-circle`}></i>
              {alertMessage}
            </div>
          )}

          <div className="checkout-wrapper">
            {/* Sección de Pago */}
            <div className="checkout-form">
              <div className="form-section">
                <h2><i className="fas fa-wallet"></i> Método de Pago</h2>
                
                {/* Tabs de método de pago */}
                <div className="payment-tabs">
                  <button 
                    className={`payment-tab ${activeTab === 'paypal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('paypal')}
                  >
                    <i className="fab fa-paypal"></i>
                    PayPal
                  </button>
                  <button 
                    className={`payment-tab ${activeTab === 'tarjeta' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tarjeta')}
                  >
                    <i className="fas fa-credit-card"></i>
                    Tarjeta
                  </button>
                </div>

                <div className="payment-content">
                  {/* Contenido PayPal */}
                  {activeTab === 'paypal' && (
                    <div className="paypal-section">
                      <div className="paypal-info">
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                          alt="PayPal" 
                          className="paypal-logo"
                        />
                        <p>Paga de forma segura con tu cuenta PayPal o tarjeta de crédito a través de PayPal.</p>
                      </div>
                      
                      <div className="paypal-buttons-container">
                        <PayPalButtons
                          style={{
                            layout: 'vertical',
                            color: 'blue',
                            shape: 'rect',
                            label: 'paypal',
                            height: 50
                          }}
                          createOrder={createPayPalOrder}
                          onApprove={onPayPalApprove}
                          onError={(err) => {
                            console.error('Error PayPal:', err);
                            mostrarAlerta('Error con PayPal. Intenta de nuevo.', 'error');
                          }}
                          onCancel={() => {
                            mostrarAlerta('Pago cancelado', 'error');
                          }}
                        />
                      </div>

                      <div className="paypal-features">
                        <div className="feature">
                          <i className="fas fa-shield-alt"></i>
                          <span>Protección al comprador</span>
                        </div>
                        <div className="feature">
                          <i className="fas fa-lock"></i>
                          <span>Datos encriptados</span>
                        </div>
                        <div className="feature">
                          <i className="fas fa-undo"></i>
                          <span>Reembolso fácil</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contenido Tarjeta */}
                  {activeTab === 'tarjeta' && (
                    <div className="card-section">
                      {/* Vista previa de tarjeta */}
                      <div className={`card-preview ${isCardFlipped ? 'flipped' : ''}`}>
                        <div className="card-front">
                          <div className="card-chip"></div>
                          <div className="card-type-logo">
                            {cardType === 'visa' && <i className="fab fa-cc-visa"></i>}
                            {cardType === 'mastercard' && <i className="fab fa-cc-mastercard"></i>}
                            {cardType === 'amex' && <i className="fab fa-cc-amex"></i>}
                            {cardType === 'unknown' && <i className="fas fa-credit-card"></i>}
                          </div>
                          <div className="card-number-display">
                            {cardData.numero || '•••• •••• •••• ••••'}
                          </div>
                          <div className="card-bottom">
                            <div className="card-holder">
                              <span className="label">TITULAR</span>
                              <span className="value">{cardData.nombre || 'NOMBRE COMPLETO'}</span>
                            </div>
                            <div className="card-expiry">
                              <span className="label">VENCE</span>
                              <span className="value">{cardData.expiracion || 'MM/AA'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="card-back">
                          <div className="card-stripe"></div>
                          <div className="card-cvv-display">
                            <span className="label">CVV</span>
                            <span className="value">{cardData.cvv || '•••'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Formulario de tarjeta */}
                      <div className="card-form">
                        <div className="form-row full">
                          <div className="form-group">
                            <label>Número de tarjeta <span className="required">*</span></label>
                            <input
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              value={cardData.numero}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                            />
                          </div>
                        </div>
                        
                        <div className="form-row full">
                          <div className="form-group">
                            <label>Nombre en la tarjeta <span className="required">*</span></label>
                            <input
                              type="text"
                              placeholder="JUAN PEREZ"
                              value={cardData.nombre}
                              onChange={(e) => setCardData({ ...cardData, nombre: e.target.value.toUpperCase() })}
                            />
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Fecha de expiración <span className="required">*</span></label>
                            <input
                              type="text"
                              placeholder="MM/AA"
                              value={cardData.expiracion}
                              onChange={handleExpirationChange}
                              maxLength={5}
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV <span className="required">*</span></label>
                            <input
                              type="text"
                              placeholder="123"
                              value={cardData.cvv}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 4) {
                                  setCardData({ ...cardData, cvv: val });
                                }
                              }}
                              onFocus={() => setIsCardFlipped(true)}
                              onBlur={() => setIsCardFlipped(false)}
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary btn-pagar"
                          onClick={handlePagoTarjeta}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner"></span>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-lock"></i>
                              Pagar ${totalConIva.toFixed(2)}
                            </>
                          )}
                        </button>
                      </div>

                      <div className="card-logos">
                        <i className="fab fa-cc-visa"></i>
                        <i className="fab fa-cc-mastercard"></i>
                        <i className="fab fa-cc-amex"></i>
                        <i className="fab fa-cc-discover"></i>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen del Pedido */}
            <div className="order-summary">
              <h2><i className="fas fa-shopping-cart"></i> Resumen del Pedido</h2>
              
              <div className="cart-items">
                {items?.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.producto.nombre}</span>
                      <span className="item-qty">x{item.cantidad}</span>
                    </div>
                    <span className="item-price">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span className="summary-label">Subtotal:</span>
                  <span className="summary-value">${totalCarrito.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">IVA (15%):</span>
                  <span className="summary-value">${iva.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span className="summary-label">Total:</span>
                  <span className="summary-value">${totalConIva.toFixed(2)}</span>
                </div>
              </div>

              <div className="trust-badges">
                <div className="badge">
                  <i className="fas fa-shield-alt"></i>
                  <span>Compra Segura</span>
                </div>
                <div className="badge">
                  <i className="fas fa-lock"></i>
                  <span>SSL 256-bit</span>
                </div>
                <div className="badge">
                  <i className="fas fa-undo"></i>
                  <span>Devolución</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Loader overlay */}
      {isLoading && (
        <div className="loader show">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;
