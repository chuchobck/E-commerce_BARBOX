import { api } from './api';
import { getErrorInfo, createRetryHandler } from '../utils/errorHandler';
import { marcaService } from './marca.service'; // 🆕 Importar servicio de marcas
import { 
  Categoria, 
  Marca, 
  Producto, 
  FiltrosProducto, 
  ProductosResponse,
  FiltrosDinamicos 
} from '../types/catalogo.types';

// Crear handler de retry para operaciones de red
const retryHandler = createRetryHandler(3, 1000);

export const catalogoService = {
  // ==================== CATEGORÍAS ====================
  async getCategorias(): Promise<Categoria[]> {
    try {
      const response = await retryHandler(() =>
        api.get<{ data: Categoria[] }>('/categorias')
      );
      return response.data.data;
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('❌ Error al obtener categorías:', errorInfo);
      throw error;
    }
  },

  async getCategoriaById(id: number): Promise<Categoria> {
    try {
      const response = await api.get<{ data: Categoria }>(`/categorias/${id}`);
      return response.data.data;
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('❌ Error al obtener categoría:', errorInfo);
      throw error;
    }
  },

  // ==================== MARCAS ====================
  // 🔄 Ahora usa el servicio de marcas dedicado
  async getMarcas(categoria?: string): Promise<Marca[]> {
    try {
      const filtros = categoria ? { id_categoria: parseInt(categoria) } : {};
      const response = await marcaService.getMarcas(filtros);
      return response.data;
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('❌ Error al obtener marcas:', errorInfo);
      throw error;
    }
  },

  async getMarcasByCategoria(categoria: string): Promise<Marca[]> {
    try {
      return await marcaService.getMarcasByCategoria(parseInt(categoria));
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('❌ Error al obtener marcas por categoría:', errorInfo);
      throw error;
    }
  },

  // ==================== PRODUCTOS ====================
  async getProductos(filtros?: FiltrosProducto): Promise<ProductosResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filtros) {
        if (filtros.categoriaId) params.append('categoria', filtros.categoriaId.toString());
        if (filtros.marcaId) params.append('marcaId', filtros.marcaId.toString());
        if (filtros.precioMin) params.append('precioMin', filtros.precioMin.toString());
        if (filtros.precioMax) params.append('precioMax', filtros.precioMax.toString());
        if (filtros.volumen) params.append('volumen', filtros.volumen);
        if (filtros.origen) params.append('origen', filtros.origen);
        if (filtros.enStock !== undefined) params.append('soloDisponibles', filtros.enStock.toString());
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.ordenarPor) params.append('ordenarPor', filtros.ordenarPor);
        if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
        if (filtros.limite) params.append('limite', filtros.limite.toString());
      }

      const response = await retryHandler(() =>
        api.get(`/productos/buscar?${params.toString()}`)
      );
      
      console.log('🔍 Respuesta completa del backend:', response.data);
      
      // ✅ Normalizar respuesta del backend a ProductosResponse
      const backendData = response.data?.data || response.data;
      const pagination = response.data?.pagination;
      const productos = Array.isArray(backendData) ? backendData : (backendData?.productos || []);
      
      console.log('📊 Paginación recibida:', pagination);
      console.log('📦 Total de productos según backend:', pagination?.total || productos.length);
      
      return {
        productos,
        total: pagination?.total || productos.length,
        pagina: pagination?.pagina || filtros?.pagina || 1,
        totalPaginas: pagination?.totalPaginas || Math.ceil((pagination?.total || productos.length) / (filtros?.limite || 10))
      };
    } catch (error) {
      const errorInfo = getErrorInfo(error);
      console.error('❌ Error al obtener productos:', errorInfo);
      throw error;
    }
  },

  async getProductoById(id: string): Promise<Producto> {
    const response = await api.get<{ data: Producto }>(`/productos/${id}`);
    return response.data.data;
  },

  async buscarProductos(query: string): Promise<Producto[]> {
    const response = await api.get<{ data: Producto[] }>(`/productos/buscar?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  // ==================== FILTROS DINÁMICOS ====================
  async getFiltrosDinamicos(categoria?: string, marcaId?: number): Promise<FiltrosDinamicos> {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (marcaId) params.append('marcaId', marcaId.toString());
    
    const response = await api.get<{ data: FiltrosDinamicos }>(`/productos/filtros?${params.toString()}`);
    return response.data.data;
  },

  // ==================== PRODUCTOS DESTACADOS ====================
  async getProductosDestacados(limite: number = 8): Promise<Producto[]> {
    const response = await api.get<{ data: Producto[] }>(`/productos/destacados?limite=${limite}`);
    return response.data.data;
  },

  async getProductosNuevos(limite: number = 8): Promise<Producto[]> {
    const response = await api.get<{ data: Producto[] }>(`/productos/nuevos?limite=${limite}`);
    return response.data.data;
  },
};

export default catalogoService;
