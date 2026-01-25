// src/services/promociones.service.ts - Servicio para promociones
import { api } from './api';

export interface CategoriaPromocion {
  id: number;
  nombre: string;
  descripcion?: string;
  orden?: number;
  totalOfertas: number;
  icono?: string;
}

export interface ProductoPromocion {
  id_producto?: string;
  id_promocion?: number;
  cantidad: number;
  es_principal?: boolean;
  es_regalo?: boolean;
  orden?: number;
  producto: {
    id_producto: string;
    descripcion: string;
    imagen_url?: string;
    volumen?: number;
    origen?: string;
  };
}

export interface Promocion {
  id: number;
  nombre: string;
  descripcion?: string;
  descripcion_corta?: string;
  marca?: string;
  precio_original: number;
  precio_promocional: number;
  porcentaje_descuento: number;
  cantidad_vendida?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  destacado?: boolean;
  envio_gratis?: boolean;
  cantidad_maxima_cliente?: number;
  stock_disponible: number;
  mensaje_regalo?: string;
  categoria_promocion: {
    id: number;
    nombre: string;
  };
  promocion_productos?: ProductoPromocion[];
}

export interface FiltrosPromocion {
  categoria?: string;
  ordenarPor?: 'destacado' | 'mayor-descuento' | 'menor-precio' | 'mas-vendidos' | 'fecha';
  pagina?: number;
  limite?: number;
  soloActivas?: boolean;
  minPrecio?: number;
  maxPrecio?: number;
}

export interface RespuestaPromociones {
  promociones: Promocion[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limite: number;
}

export interface Countdown {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  fechaObjetivo: string;
}

class PromocionesService {
  // Obtener categorías de promoción (ocasiones)
  async getCategorias(): Promise<CategoriaPromocion[]> {
    try {
      const response = await api.get('/categorias-promocion');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Obtener promociones con filtros
  async getPromociones(filtros: FiltrosPromocion = {}): Promise<RespuestaPromociones> {
    try {
      const params = new URLSearchParams();
      
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.ordenarPor) params.append('ordenarPor', filtros.ordenarPor);
      if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
      if (filtros.limite) params.append('limite', filtros.limite.toString());
      if (filtros.soloActivas !== undefined) params.append('soloActivas', filtros.soloActivas.toString());
      if (filtros.minPrecio !== undefined) params.append('minPrecio', filtros.minPrecio.toString());
      if (filtros.maxPrecio !== undefined) params.append('maxPrecio', filtros.maxPrecio.toString());

      const response = await api.get(`/promociones?${params.toString()}`);
      // El backend devuelve { status, message, data } donde data es el array de promociones
      const promocionesRaw = response.data.data || [];
      
      // Mapear detalle_promocion a promocion_productos
      const promociones = promocionesRaw.map((promo: any) => ({
        ...promo,
        promocion_productos: promo.detalle_promocion || promo.promocion_productos || []
      }));
      
      return {
        promociones: promociones,
        total: promociones.length || 0,
        pagina: filtros.pagina || 1,
        totalPaginas: Math.ceil((promociones.length || 0) / (filtros.limite || 20)),
        limite: filtros.limite || 20
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener promociones destacadas
  async getPromocionesDestacadas(limite: number = 6): Promise<Promocion[]> {
    try {
      const response = await api.get(`/promociones/destacadas?limite=${limite}`);
      const promocionesRaw = response.data.data || [];
      
      // Mapear detalle_promocion a promocion_productos
      return promocionesRaw.map((promo: any) => ({
        ...promo,
        promocion_productos: promo.detalle_promocion || promo.promocion_productos || []
      }));
    } catch (error) {
      throw error;
    }
  }

  // Obtener una promoción por ID
  async getPromocion(id: number): Promise<Promocion> {
    try {
      const response = await api.get(`/promociones/${id}`);
      const promo = response.data.data;
      
      // Mapear detalle_promocion a promocion_productos
      return {
        ...promo,
        promocion_productos: promo.detalle_promocion || promo.promocion_productos || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener countdown de Navidad
  async getCountdownNavidad(): Promise<Countdown> {
    try {
      const response = await api.get('/promociones/countdown/navidad');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

const promocionesService = new PromocionesService();
export default promocionesService;
