// =============================================
// 🏷️ SERVICIO DE MARCAS
// =============================================
import { api } from './api';
import { Marca } from '../types/catalogo.types';

export interface MarcaResponse {
  status: 'success' | 'error';
  message: string;
  data: Marca[];
  total: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FiltrosMarca {
  id_categoria?: number;
  nombre?: string;
  estado?: 'ACT' | 'INA' | 'ALL';
  incluirInactivas?: boolean;
  orderBy?: 'nombre' | 'productos';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const marcaService = {
  /**
   * Obtener todas las marcas con filtros opcionales
   */
  async getMarcas(filtros?: FiltrosMarca): Promise<MarcaResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filtros) {
        if (filtros.id_categoria) params.append('id_categoria', filtros.id_categoria.toString());
        if (filtros.nombre) params.append('nombre', filtros.nombre);
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.incluirInactivas !== undefined) params.append('incluirInactivas', filtros.incluirInactivas.toString());
        if (filtros.orderBy) params.append('orderBy', filtros.orderBy);
        if (filtros.order) params.append('order', filtros.order);
        if (filtros.page) params.append('page', filtros.page.toString());
        if (filtros.limit) params.append('limit', filtros.limit.toString());
      }

      const queryString = params.toString();
      const url = queryString ? `/marcas?${queryString}` : '/marcas';
      
      const response = await api.get<MarcaResponse>(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener marcas por categoría
   */
  async getMarcasByCategoria(id_categoria: number): Promise<Marca[]> {
    try {
      const response = await api.get<MarcaResponse>(
        `/marcas?id_categoria=${id_categoria}`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener una marca por ID
   */
  async getMarcaById(id: number, incluirProductos: boolean = false): Promise<Marca> {
    try {
      const url = incluirProductos 
        ? `/marcas/${id}?incluirProductos=true`
        : `/marcas/${id}`;
      
      const response = await api.get<{ status: string; message: string; data: Marca }>(url);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear una nueva marca
   */
  async crearMarca(marca: {
    nombre: string;
    id_categoria: number;
    logo_url?: string;
  }): Promise<Marca> {
    try {
      const response = await api.post<{ status: string; message: string; data: Marca }>(
        '/marcas',
        marca
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar una marca
   */
  async actualizarMarca(
    id: number,
    datos: {
      nombre?: string;
      id_categoria?: number;
      logo_url?: string;
      estado?: string;
    }
  ): Promise<Marca> {
    try {
      const response = await api.put<{ status: string; message: string; data: Marca }>(
        `/marcas/${id}`,
        datos
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar (desactivar) una marca
   */
  async eliminarMarca(id: number): Promise<Marca> {
    try {
      const response = await api.delete<{ status: string; message: string; data: Marca }>(
        `/marcas/${id}`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
};
