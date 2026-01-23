import { api } from './api';

export interface Ciudad {
  id_ciudad: string;
  descripcion: string;
  cantidad_clientes?: number;
  cantidad_proveedores?: number;
  estado?: string;
}

export const ciudadesService = {
  /**
   * Obtener todas las ciudades
   */
  async listarCiudades(): Promise<Ciudad[]> {
    try {
      const response = await api.get('/ciudades');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al listar ciudades:', error);
      throw error;
    }
  },

  /**
   * Obtener una ciudad específica
   */
  async obtenerCiudad(id: string): Promise<Ciudad> {
    try {
      const response = await api.get(`/ciudades/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener ciudad:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva ciudad (Admin)
   */
  async crearCiudad(ciudad: Omit<Ciudad, 'id_ciudad'>): Promise<Ciudad> {
    try {
      const response = await api.post('/ciudades', ciudad);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear ciudad:', error);
      throw error;
    }
  },

  /**
   * Actualizar una ciudad (Admin)
   */
  async actualizarCiudad(id: string, datos: Partial<Ciudad>): Promise<Ciudad> {
    try {
      const response = await api.put(`/ciudades/${id}`, datos);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar ciudad:', error);
      throw error;
    }
  },

  /**
   * Eliminar una ciudad (Admin)
   */
  async eliminarCiudad(id: string): Promise<void> {
    try {
      await api.delete(`/ciudades/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar ciudad:', error);
      throw error;
    }
  }
};
