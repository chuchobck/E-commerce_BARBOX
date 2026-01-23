import { api } from './api';

export interface CanalVenta {
  id_canal: string;
  descripcion: string;
  estado: 'ACT' | 'INA';
  _count?: {
    factura: number;
  };
}

export const canalVentaService = {
  /**
   * Obtener todos los canales de venta activos
   */
  async listarCanales(): Promise<CanalVenta[]> {
    try {
      const response = await api.get('/canales-venta');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al listar canales de venta:', error);
      throw error;
    }
  },

  /**
   * Obtener un canal específico
   */
  async obtenerCanal(id: string): Promise<CanalVenta> {
    try {
      const response = await api.get(`/canales-venta/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener canal de venta:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo canal (Admin)
   */
  async crearCanal(canal: Omit<CanalVenta, 'id_canal' | '_count'>): Promise<CanalVenta> {
    try {
      const response = await api.post('/canales-venta', canal);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear canal de venta:', error);
      throw error;
    }
  },

  /**
   * Actualizar un canal (Admin)
   */
  async actualizarCanal(id: string, datos: Partial<CanalVenta>): Promise<CanalVenta> {
    try {
      const response = await api.put(`/canales-venta/${id}`, datos);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar canal de venta:', error);
      throw error;
    }
  },

  /**
   * Eliminar un canal (Admin)
   */
  async eliminarCanal(id: string): Promise<void> {
    try {
      await api.delete(`/canales-venta/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar canal de venta:', error);
      throw error;
    }
  }
};
