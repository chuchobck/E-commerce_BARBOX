import { api } from './api';
import { MetodoPago, CheckoutData, CheckoutResponse } from '../types/checkout.types';

export const checkoutService = {
  // Obtener métodos de pago disponibles para web
  async getMetodosPago(): Promise<MetodoPago[]> {
    try {
      console.log('🔍 Obteniendo métodos de pago...');
      const response = await api.get('/metodos-pago/disponibles-web');
      console.log('✅ Métodos de pago obtenidos:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error obteniendo métodos de pago:', error);
      throw error;
    }
  },

  // Procesar checkout - Crear factura
  async procesarCheckout(data: CheckoutData): Promise<CheckoutResponse> {
    console.log('📦 Procesando checkout con datos:', data);
    
    // La ruta correcta es POST /facturas (no /facturas/checkout)
    const response = await api.post<CheckoutResponse>('/facturas', data);
    
    console.log('✅ Respuesta del checkout:', response.data);
    
    // Limpiar carrito del localStorage después de checkout exitoso
    if (response.data.status === 'success') {
      localStorage.removeItem('barbox_cart_id');
      localStorage.removeItem('barbox_session_id');
      localStorage.removeItem('carritoCheckout');
    }
    
    return response.data;
  },

  // Obtener mis pedidos
  async getMisPedidos() {
    const response = await api.get('/facturas/mis-pedidos');
    return response.data;
  },

  // PayPal: Crear orden
  async crearOrdenPayPal(id_carrito: string, total: number) {
    const response = await api.post('/paypal/crear-orden', {
      id_carrito,
      total
    });
    return response.data;
  },

  // PayPal: Confirmar pago
  async confirmarPagoPayPal(order_id: string, id_carrito: string, id_metodo_pago: number, id_iva: number) {
    const response = await api.post('/paypal/confirmar', {
      order_id,
      id_carrito,
      id_metodo_pago,
      id_iva
    });
    return response.data;
  },
};
