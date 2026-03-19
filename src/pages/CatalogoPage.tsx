import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ProductCard from '../components/Catalog/ProductCard';
import ProductDetailModal from '../components/Catalog/ProductDetailModal';
import CatalogFilters from '../components/Catalog/CatalogFilters';
import { useCarrito } from '../context/CarritoContext';
import {
  Producto,
  Categoria,
  Marca,
  FiltrosProducto,
  FiltrosDinamicos
} from '../types/catalogo.types';
import catalogoService from '../services/catalogo.service';
import './CatalogoPage.css';

const CatalogoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { totalItems } = useCarrito();

  // Estados
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [filtrosDinamicos, setFiltrosDinamicos] = useState<FiltrosDinamicos | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación para carga perezosa
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalProductos, setTotalProductos] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasProductos, setHayMasProductos] = useState(true);
  const productosPorPagina = 24; // Aumentado para mostrar más productos inicialmente
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // UI States
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [vistaGrid, setVistaGrid] = useState<'grid' | 'list'>('grid');
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  // Filtros desde URL
  const [filtros, setFiltros] = useState<FiltrosProducto>(() => ({
    categoriaId: searchParams.get('categoriaId') ? parseInt(searchParams.get('categoriaId')!) : undefined,
    marcaId: searchParams.get('marcaId') ? parseInt(searchParams.get('marcaId')!) : undefined,
    busqueda: searchParams.get('busqueda') || undefined,
    ordenarPor: (searchParams.get('ordenarPor') as FiltrosProducto['ordenarPor']) || 'aleatorio',
    pagina: 1,
    limite: productosPorPagina,
  }));

  // Sincronizar filtros con URL params
  useEffect(() => {
    setFiltros({
      categoriaId: searchParams.get('categoriaId') ? parseInt(searchParams.get('categoriaId')!) : undefined,
      marcaId: searchParams.get('marcaId') ? parseInt(searchParams.get('marcaId')!) : undefined,
      busqueda: searchParams.get('busqueda') || undefined,
      ordenarPor: (searchParams.get('ordenarPor') as FiltrosProducto['ordenarPor']) || 'aleatorio',
      pagina: 1,
      limite: productosPorPagina,
    });
    setPaginaActual(1);
    setHayMasProductos(true);
  }, [searchParams]);

  // Cargar categorías al inicio
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await catalogoService.getCategorias();
        
        // ✅ Eliminar duplicados por id_prod_categoria y nombre
        const categoriasUnicas = data.reduce((acc, cat) => {
          const existe = acc.find(c => 
            c.id_prod_categoria === cat.id_prod_categoria || 
            c.nombre.toLowerCase() === cat.nombre.toLowerCase()
          );
          if (!existe) {
            acc.push(cat);
          }
          return acc;
        }, [] as Categoria[]);
        
        console.log(`✅ Categorías cargadas: ${data.length} (${categoriasUnicas.length} únicas)`);
        setCategorias(categoriasUnicas);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    cargarCategorias();
  }, []);

  // Cargar marcas cuando cambia la categoría
  useEffect(() => {
    const cargarMarcas = async () => {
      try {
        const data = await catalogoService.getMarcas(filtros.categoriaId?.toString());
        setMarcas(data);
      } catch (err) {
        console.error('Error cargando marcas:', err);
        setMarcas([]);
      }
    };
    cargarMarcas();
  }, [filtros.categoriaId]);

  // Cargar productos cuando cambian filtros
  const cargarProductos = useCallback(async (reset: boolean = false) => {
    // Prevenir cargas duplicadas
    if (!reset && (loadingMore || loading)) {
      console.log('⏳ Ya hay una carga en proceso, saltando...');
      return;
    }

    if (reset) {
      setLoading(true);
      setProductos([]);
      setPaginaActual(1);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const paginaACargar = reset ? 1 : paginaActual;

    try {
      console.log('🔍 Cargando productos - Página:', paginaACargar, '- Reset:', reset);
      const response = await catalogoService.getProductos({ ...filtros, pagina: paginaACargar });
      console.log('✅ Respuesta del backend:', response);
      
      // ✅ El servicio ya normaliza la respuesta a ProductosResponse
      const productos = response?.productos || [];
      const total = response?.total || 0;
      const totalPaginas = response?.totalPaginas || 0;
      
      console.log(`📦 Productos recibidos: ${productos.length} - Total en BD: ${total} - Página ${paginaACargar} de ${totalPaginas}`);

      if (reset) {
        setProductos(productos);
        setPaginaActual(2); // Preparar para la siguiente carga
      } else {
        setProductos(prev => {
          // Evitar duplicados
          const idsExistentes = new Set(prev.map(p => p.id_producto));
          const nuevosProductos = productos.filter(p => !idsExistentes.has(p.id_producto));
          console.log(`➕ Agregando ${nuevosProductos.length} productos nuevos (${productos.length - nuevosProductos.length} duplicados ignorados)`);
          return [...prev, ...nuevosProductos];
        });
        setPaginaActual(prev => prev + 1); // Incrementar para la siguiente carga
      }

      setTotalProductos(total);
      // Hay más productos si la página actual es menor al total de páginas
      setHayMasProductos(paginaACargar < totalPaginas);
    } catch (err: any) {
      console.error('❌ ERROR cargando productos:', err);
      console.error('❌ ERROR details:', err.response?.data || err.message);
      
      // Si es 404, significa que no hay productos con esos filtros, no es un error grave
      if (err.response?.status === 404) {
        setProductos([]);
        setTotalProductos(0);
        setHayMasProductos(false);
        setError(null); // No mostrar error, solo el mensaje de "no hay productos"
      } else {
        // Para otros errores, mostrar mensaje amigable
        setError('No pudimos cargar los productos. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, paginaActual, loading, loadingMore]);

  useEffect(() => {
    // Asegurar que la vista vuelva al inicio del catálogo al cambiar filtros
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      /* noop en entornos donde window no exista */
    }

    cargarProductos(true); // Reset cuando cambian filtros
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.categoriaId, filtros.marcaId, filtros.busqueda, filtros.ordenarPor, filtros.precioMin, filtros.precioMax, filtros.volumen, filtros.origen, filtros.enStock]);

  // Intersection Observer para carga perezosa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hayMasProductos && !loading && !loadingMore) {
          console.log('📥 Cargando más productos...');
          cargarProductos(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hayMasProductos, loading, loadingMore, cargarProductos]);

  // Cargar filtros dinámicos
  useEffect(() => {
    const cargarFiltrosDinamicos = async () => {
      try {
        const data = await catalogoService.getFiltrosDinamicos(filtros.categoriaId?.toString(), filtros.marcaId);
        setFiltrosDinamicos(data);
      } catch (err) {
        // Filtros estáticos de fallback
        setFiltrosDinamicos({
          volumenes: [350, 700, 750, 1000, 1750],
          alcoholRango: { min: 5, max: 50 },
          precioRango: { min: 10, max: 500 }
        });
      }
    };
    cargarFiltrosDinamicos();
  }, [filtros.categoriaId, filtros.marcaId]);

  // Actualizar URL cuando cambian filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId.toString());
    if (filtros.marcaId) params.set('marcaId', filtros.marcaId.toString());
    if (filtros.busqueda) params.set('busqueda', filtros.busqueda);
    if (filtros.ordenarPor) params.set('ordenarPor', filtros.ordenarPor);
    // Usar replace para no llenar el historial con cada cambio de filtro
    setSearchParams(params, { replace: true });
  }, [filtros, setSearchParams]);

  // Handlers
  const handleFiltrosChange = (nuevosFiltros: Partial<FiltrosProducto>) => {
    // Si cambian categoría o marca, limpiar búsqueda para evitar conflictos
    const filtrosActualizados = { ...nuevosFiltros };
    if ('categoriaId' in nuevosFiltros || 'marcaId' in nuevosFiltros) {
      filtrosActualizados.busqueda = undefined;
    }
    
    setFiltros(prev => ({ ...prev, ...filtrosActualizados }));
    setPaginaActual(1);
    setHayMasProductos(true);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      ordenarPor: 'aleatorio',
      pagina: 1,
      limite: productosPorPagina,
    });
    setPaginaActual(1);
    setHayMasProductos(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOrdenarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFiltrosChange({ ordenarPor: e.target.value as FiltrosProducto['ordenarPor'] });
  };

  const handleVerDetalle = (producto: Producto) => {
    setProductoDetalle(producto);
    setModalAbierto(true);
  };





  return (
    <div className="catalogo-page">
      <Header />

      <main className="catalog-main" id="main-content" role="main">
        {/* Catalog Header */}
        <section className="catalog-header" aria-labelledby="catalog-title">
          <div className="container">
            <div className="catalog-header__content">
              <div className="catalog-header__text">
                <h1 id="catalog-title" className="catalog-header__title">Nuestro Catálogo</h1>
                <p className="catalog-header__subtitle">
                  Descubre nuestra selección de bebidas premium. Calidad garantizada con entrega rápida.
                </p>
              </div>
              <div className="catalog-header__actions">
                <button
                  className="btn-filtros-mobile"
                  onClick={() => setFiltrosAbiertos(true)}
                  aria-expanded={filtrosAbiertos}
                  aria-controls="catalog-filters"
                  type="button"
                >
                  <i className="fas fa-sliders-h" aria-hidden="true"></i>
                  <span>Filtros</span>
                </button>
                <div className="view-toggle" role="group" aria-label="Cambiar vista de productos">
                  <button
                    className={`view-btn ${vistaGrid === 'grid' ? 'active' : ''}`}
                    onClick={() => setVistaGrid('grid')}
                    aria-label="Vista de cuadrícula"
                    aria-pressed={vistaGrid === 'grid'}
                    type="button"
                  >
                    <i className="fas fa-th" aria-hidden="true"></i>
                  </button>
                  <button
                    className={`view-btn ${vistaGrid === 'list' ? 'active' : ''}`}
                    onClick={() => setVistaGrid('list')}
                    aria-label="Vista de lista"
                    aria-pressed={vistaGrid === 'list'}
                    type="button"
                  >
                    <i className="fas fa-list" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Content */}
        <section className="catalog-content" aria-label="Productos del catálogo">
          <div className="container">
            <div className="catalog-layout">
              {/* Sidebar Filtros */}
              <CatalogFilters
                categorias={categorias}
                marcas={marcas}
                filtros={filtros}
                filtrosDinamicos={filtrosDinamicos}
                onFiltrosChange={handleFiltrosChange}
                onLimpiarFiltros={handleLimpiarFiltros}
                isOpen={filtrosAbiertos}
                onClose={() => setFiltrosAbiertos(false)}
              />

              {/* Products Area */}
              <div className="catalog-products">
                {/* Filtro activo de búsqueda */}
                {filtros.busqueda && (
                  <div className="search-active-badge">
                    <i className="fas fa-search"></i>
                    <span>Buscando: <strong>{filtros.busqueda}</strong></span>
                    <button
                      onClick={() => handleFiltrosChange({ busqueda: undefined })}
                      className="search-active-badge__clear"
                      aria-label="Limpiar búsqueda"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}

                {/* Toolbar */}
                <div className="catalog-toolbar">
                  {/* Toolbar vacío o se puede agregar otro contenido */}
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="catalog-loading" role="status" aria-live="polite">
                    <div className="spinner" aria-hidden="true"></div>
                    <p>Cargando productos...</p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div className="catalog-error" role="alert">
                    <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    <p>{error}</p>
                    <button onClick={() => cargarProductos(true)} type="button">Reintentar</button>
                  </div>
                )}

                {/* Products Grid */}
                {!loading && productos.length > 0 && (
                  <>
                    <div
                      className={`products-grid ${vistaGrid === 'list' ? 'products-grid--list' : ''}`}
                      role="region"
                      aria-label="Lista de productos"
                    >
                      {productos.map((producto, index) => (
                        <ProductCard
                          key={`${producto.id_producto}-${index}`}
                          producto={producto}
                          onVerDetalle={handleVerDetalle}
                        />
                      ))}
                    </div>

                    {/* Observer target para carga perezosa */}
                    <div ref={observerTarget} className="lazy-load-trigger" aria-hidden="true"></div>

                    {/* Loading More indicator */}
                    {loadingMore && (
                      <div className="catalog-loading-more" role="status" aria-live="polite">
                        <div className="spinner-small" aria-hidden="true"></div>
                        <p>Cargando más productos...</p>
                      </div>
                    )}

                    {/* Final message cuando no hay más productos */}
                    {!hayMasProductos && productos.length > 0 && (
                      <div className="catalog-end-message" role="status">
                        <i className="fas fa-check-circle" aria-hidden="true"></i>
                        <p>Ya viste todos los productos</p>
                      </div>
                    )}
                  </>
                )}

                {/* Empty State */}
                {!loading && productos.length === 0 && (
                  <div className="catalog-empty" role="status">
                    <i className="fas fa-wine-bottle" aria-hidden="true"></i>
                    <h3>No encontramos productos</h3>
                    <p>Intenta ajustar los filtros o buscar algo diferente</p>
                    <button onClick={handleLimpiarFiltros} type="button">Limpiar filtros</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        producto={productoDetalle}
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setProductoDetalle(null);
        }}
      />

      <Footer />
    </div>
  );
};

export default CatalogoPage;
