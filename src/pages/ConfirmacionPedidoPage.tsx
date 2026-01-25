import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import './ConfirmacionPedidoPage.css';

interface FacturaData {
  id_factura?: string;
  numero_factura?: string;
  fecha_emision?: Date;
  subtotal?: number;
  iva?: number;
  total?: number;
  estado_pago?: string;
  estado_entrega?: string;
}

const ConfirmacionPedidoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const facturaData = location.state?.factura as FacturaData;

  const descargarPDF = async () => {
    try {
      const numeroFactura = facturaData.id_factura || facturaData.numero_factura;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${API_URL}/facturas/${numeroFactura}/imprimir`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Por ahora abrimos los datos en una nueva ventana
        // Más adelante se puede implementar generación de PDF real
        const ventana = window.open('', '_blank');
        if (ventana) {
          ventana.document.write(`
            <html>
              <head>
                <title>Factura ${data.data.numero_factura}</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 40px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .detalle { margin: 20px 0; }
                  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #d4af37; color: white; }
                  .total { font-size: 18px; font-weight: bold; text-align: right; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>FACTURA</h1>
                  <p>N°: ${data.data.numero_factura}</p>
                  <p>Fecha: ${new Date(data.data.fecha_emision).toLocaleDateString('es-EC')}</p>
                </div>
                <div class="detalle">
                  <h3>Cliente</h3>
                  <p><strong>Nombre:</strong> ${data.data.cliente.nombre_completo}</p>
                  <p><strong>Identificación:</strong> ${data.data.cliente.identificacion}</p>
                  <p><strong>Dirección:</strong> ${data.data.cliente.direccion || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> ${data.data.cliente.telefono || 'N/A'}</p>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.data.detalles.map((d: any) => `
                      <tr>
                        <td>${d.descripcion}</td>
                        <td>${d.cantidad}</td>
                        <td>$${d.precio_unitario.toFixed(2)}</td>
                        <td>$${d.subtotal.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="total">
                  <p>Subtotal: $${data.data.subtotal.toFixed(2)}</p>
                  <p>IVA (${data.data.porcentaje_iva}%): $${data.data.valor_iva.toFixed(2)}</p>
                  <p><strong>TOTAL: $${data.data.total.toFixed(2)}</strong></p>
                </div>
                <script>window.print();</script>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al generar la factura');
    }
  };

  useEffect(() => {
    if (!facturaData) {
      navigate('/');
    }
  }, [facturaData, navigate]);

  if (!facturaData) {
    return null;
  }

  // Obtener número de factura (puede venir como id_factura o numero_factura)
  const numeroFactura = facturaData.id_factura || facturaData.numero_factura || 'N/A';
  
  // Valores por defecto para evitar errores con toFixed
  const subtotal = typeof facturaData.subtotal === 'number' ? facturaData.subtotal : 0;
  const iva = typeof facturaData.iva === 'number' ? facturaData.iva : subtotal * 0.15;
  const total = typeof facturaData.total === 'number' ? facturaData.total : subtotal * 1.15;

  return (
    <>
      <Header />
      
      <main className="confirmacion-page">
        <div className="container">
          <div className="confirmacion-card">
            <div className="confirmacion-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            
            <h1>¡Compra Exitosa!</h1>
            <p className="confirmacion-subtitle">
              Tu pedido ha sido procesado correctamente
            </p>

            <div className="confirmacion-details">
              <div className="detail-row">
                <span className="detail-label">Número de Factura:</span>
                <span className="detail-value">{numeroFactura}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">
                  {new Date().toLocaleDateString('es-EC', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className="detail-value badge badge-success">
                  Aprobada
                </span>
              </div>

              <div className="detail-divider"></div>

              {subtotal > 0 && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Subtotal:</span>
                    <span className="detail-value">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">IVA (15%):</span>
                    <span className="detail-value">${iva.toFixed(2)}</span>
                  </div>

                  <div className="detail-row total-row">
                    <span className="detail-label">Total:</span>
                    <span className="detail-value">${total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="confirmacion-info">
              <i className="fas fa-info-circle"></i>
              <p>
                Recibirás un correo de confirmación con los detalles de tu pedido.
                Podrás ver tu compra en la sección "Mis Compras".
              </p>
            </div>

            <div className="confirmacion-actions">
              <button 
                className="btn-primary"
                onClick={descargarPDF}
              >
                <i className="fas fa-file-pdf"></i>
                Descargar Factura
              </button>

              <button 
                className="btn-primary"
                onClick={() => navigate('/mis-pedidos')}
              >
                <i className="fas fa-shopping-bag"></i>
                Ver Mis Compras
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-home"></i>
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ConfirmacionPedidoPage;
