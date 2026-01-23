// Tipos para el flujo de checkout
export interface PuntoRetiro {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: {
    id: string;
    nombre: string;
  };
  horario: string;
  telefono?: string;
}

export interface MetodoPago {
  id_metodo_pago: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  requiere_datos_adicionales?: boolean;
  disponible_web?: boolean;
}

export interface CheckoutData {
  id_carrito: string;
  id_metodo_pago: number;
  id_cliente: number;
  id_iva: number;
  datos_pago?: {
    numero_tarjeta?: string;
    nombre_titular?: string;
    fecha_expiracion?: string;
    cvv?: string;
  };
}

export interface CheckoutResponse {
  status: string;
  data: {
    factura: {
      id: string;
      numero_factura: string;
      fecha_emision: Date;
      subtotal: number;
      iva: number;
      total: number;
      estado_pago: string;
      estado_entrega: string;
    };
  };
  message: string;
}
