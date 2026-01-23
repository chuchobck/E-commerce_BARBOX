import { api } from './api';

export interface Categoria {
  id_prod_categoria?: number;
  id_categoria_producto?: number;
  nombre: string;
  nombre_categoria?: string;
  descripcion?: string;
  activo?: boolean;
  _count?: {
    producto?: number;
    marca?: number;
  };
}

export const categoriasService = {
  /**
   * Obtener todas las categorías
   */
  async listarCategorias(): Promise<Categoria[]> {
    try {
      console.log('🔍 Obteniendo categorías desde API...');
      const response = await api.get('/categorias');
      const data = response.data.data || [];
      console.log(`✅ Se obtuvieron ${data.length} categorías`);
      return data;
    } catch (error: any) {
      console.error('❌ Error al listar categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría específica
   */
  async obtenerCategoria(id: number): Promise<Categoria> {
    try {
      const response = await api.get(`/categorias/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva categoría (Admin)
   */
  async crearCategoria(categoria: Omit<Categoria, 'id_prod_categoria' | 'id_categoria_producto'>): Promise<Categoria> {
    try {
      const response = await api.post('/categorias', categoria);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría (Admin)
   */
  async actualizarCategoria(id: number, datos: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await api.put(`/categorias/${id}`, datos);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  },

  /**
   * Eliminar una categoría (Admin)
   */
  async eliminarCategoria(id: number): Promise<void> {
    try {
      await api.delete(`/categorias/${id}`);
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
};
