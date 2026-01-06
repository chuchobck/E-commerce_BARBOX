// =============================================
// ⭐ SERVICIO DE FAVORITOS
// =============================================
import { api } from './api';
import { Favorito } from '../types/catalogo.types';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export const favoritosService = {
  /**
   * Obtener favoritos del usuario
   */
  async obtenerFavoritos(usuarioId: number): Promise<Favorito[]> {
    try {
      const response = await api.get<ApiResponse<Favorito[]>>(
        `/favoritos?usuarioId=${usuarioId}`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Agregar producto a favoritos
   */
  async agregarFavorito(usuarioId: number, productoId: string): Promise<Favorito> {
    try {
      const response = await api.post<ApiResponse<Favorito>>('/favoritos', {
        usuarioId,
        productoId
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar producto de favoritos
   */
  async eliminarFavorito(id_favorito: number): Promise<void> {
    try {
      await api.delete<ApiResponse<null>>(`/favoritos/${id_favorito}`);
    } catch (error) {
      throw error;
    }
  }
};
