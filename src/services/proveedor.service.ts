import { api } from './api';

export interface Proveedor {
  id_proveedor: string;
  ruc_cedula: string;
  razon_social: string;
  id_ciudad: string;
  email: string;
  telefono: string;
  estado: 'ACT' | 'INA';
  _count?: {
    compra: number;
  };
}

export const proveedorService = {
  /**
   * Obtener todos los proveedores
   */
  async listarProveedores(): Promise<Proveedor[]> {
    try {
      const response = await api.get('/proveedores');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error al listar proveedores:', error);
      throw error;
    }
  },

  /**
   * Obtener un proveedor específico
   */
  async obtenerProveedor(id: string): Promise<Proveedor> {
    try {
      const response = await api.get(`/proveedores/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener proveedor:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo proveedor (Admin)
   */
  async crearProveedor(proveedor: Omit<Proveedor, 'id_proveedor' | '_count'>): Promise<Proveedor> {
    try {
      const response = await api.post('/proveedores', proveedor);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear proveedor:', error);
      throw error;
    }
  },

  /**
   * Actualizar un proveedor (Admin)
   */
  async actualizarProveedor(id: string, datos: Partial<Proveedor>): Promise<Proveedor> {
    try {
      const response = await api.put(`/proveedores/${id}`, datos);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  },

  /**
   * Eliminar un proveedor (Admin)
   */
  async eliminarProveedor(id: string): Promise<void> {
    try {
      await api.delete(`/proveedores/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar proveedor:', error);
      throw error;
    }
  }
};
