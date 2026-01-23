import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { checkoutService } from '../services/checkout.service';
import { useCarrito } from '../context/CarritoContext';
import './PagoExitosoPage.css';

const PagoExitosoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { limpiarCarrito } = useCarrito();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facturaData, setFacturaData] = useState<any>(null);

  useEffect(() => {
    const procesarPagoPayPal = async () => {
      try {
        // Obtener token de PayPal de la URL
        const token = searchParams.get('token');
        
        if (!token) {
          setError('Token de PayPal no encontrado');
          setIsProcessing(false);
          return;
        }

        // Recuperar datos del checkout de localStorage
        const checkoutDataStr = localStorage.getItem('paypal_checkout_data');
        if (!checkoutDataStr) {
          setError('Datos de checkout no encontrados');
          setIsProcessing(false);
          return;
        }

        const checkoutData = JSON.parse(checkoutDataStr);

        // Confirmar pago en backend
        const response = await checkoutService.confirmarPagoPayPal(
          checkoutData.order_id,
          checkoutData.id_carrito,
          checkoutData.id_metodo_pago,
          checkoutData.id_iva
        );

        if (response.status === 'success') {
          // Limpiar datos de PayPal
          localStorage.removeItem('paypal_checkout_data');
          
          // Limpiar carrito
          limpiarCarrito();
          
          // Guardar datos de factura
          setFacturaData(response.data);
          setIsProcessing(false);

          // Redirigir a confirmación después de 3 segundos
          setTimeout(() => {
            navigate('/confirmacion-pedido', {
              state: { 
                factura: {
                  id: response.data.id_factura,
                  numero_factura: response.data.id_factura
                }
              }
            });
          }, 3000);
        } else {
          setError('Error al confirmar el pago');
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('Error procesando pago PayPal:', err);
        setError(err.response?.data?.message || 'Error al procesar el pago');
        setIsProcessing(false);
      }
    };

    procesarPagoPayPal();
  }, [searchParams, navigate, limpiarCarrito]);

  if (error) {
    return (
      <>
        <Header />
        <main className="pago-exitoso-page">
          <div className="container">
            <div className="pago-exitoso-card error">
              <div className="icon-wrapper">
                <i className="fas fa-times-circle"></i>
              </div>
              <h1>Error en el Pago</h1>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/checkout')}
              >
                Volver al Checkout
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isProcessing) {
    return (
      <>
        <Header />
        <main className="pago-exitoso-page">
          <div className="container">
            <div className="pago-exitoso-card processing">
              <div className="spinner-large"></div>
              <h1>Procesando tu Pago</h1>
              <p>Estamos confirmando tu pago con PayPal y creando tu factura...</p>
              <p className="warning-text">
                <i className="fas fa-exclamation-triangle"></i>
                No cierres esta ventana
              </p>
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
      <main className="pago-exitoso-page">
        <div className="container">
          <div className="pago-exitoso-card success">
            <div className="icon-wrapper">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>¡Pago Exitoso!</h1>
            <p>Tu pago con PayPal ha sido confirmado</p>
            {facturaData && (
              <div className="factura-info">
                <p><strong>Factura:</strong> {facturaData.id_factura}</p>
                <p><strong>Estado:</strong> Aprobada</p>
              </div>
            )}
            <p className="redirect-text">
              Serás redirigido a la confirmación de tu pedido en unos segundos...
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PagoExitosoPage;
