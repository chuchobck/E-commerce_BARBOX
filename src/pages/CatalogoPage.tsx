import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  const [totalProductos, setTotalProductos] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [hayMasProductos, setHayMasProductos] = useState(true);
  const productosPorPagina = 12;
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
    ordenarPor: (searchParams.get('ordenarPor') as FiltrosProducto['ordenarPor']) || 'nombre_asc',
    pagina: 1,
    limite: productosPorPagina,
  }));

  // Sincronizar filtros con URL params
  useEffect(() => {
    setFiltros({
      categoriaId: searchParams.get('categoriaId') ? parseInt(searchParams.get('categoriaId')!) : undefined,
      marcaId: searchParams.get('marcaId') ? parseInt(searchParams.get('marcaId')!) : undefined,
      busqueda: searchParams.get('busqueda') || undefined,
      ordenarPor: (searchParams.get('ordenarPor') as FiltrosProducto['ordenarPor']) || 'nombre_asc',
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
        setCategorias(data);
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
      console.log('🔍 Cargando productos con filtros:', { ...filtros, pagina: paginaACargar });
      const response = await catalogoService.getProductos({ ...filtros, pagina: paginaACargar });
      console.log('✅ Respuesta del backend:', response);
      
      // ✅ El servicio ya normaliza la respuesta a ProductosResponse
      const productos = response?.productos || [];
      const total = response?.total || productos.length;
      const totalPaginas = Math.ceil(total / productosPorPagina);
      
      console.log('📦 Total productos recibidos:', productos.length);

      if (reset) {
        setProductos(productos);
      } else {
        setProductos(prev => [...prev, ...productos]);
      }

      setTotalProductos(total);
      setHayMasProductos(productos.length === productosPorPagina && paginaACargar < totalPaginas);

      if (!reset && productos.length > 0) {
        setPaginaActual(prev => prev + 1);
      }
    } catch (err: any) {
  console.error('❌ ERROR cargando productos:', err);
  console.error('❌ ERROR details:', err.response?.data || err.message);
  setError(`Error al cargar productos: ${err.response?.data?.error || err.message}`);

  if (reset) {
    console.warn('⚠️  Usando productos de prueba por error en backend');
    setProductos(getProductosDePrueba());
    setTotalProductos(8);
    setHayMasProductos(false);
  }
} finally {
  setLoading(false);
  setLoadingMore(false);
}
  }, [filtros, paginaActual]);

  useEffect(() => {
    // Asegurar que la vista vuelva al inicio del catálogo al cambiar filtros
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      /* noop en entornos donde window no exista */
    }

    cargarProductos(true); // Reset cuando cambian filtros
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
          origenes: ['Escocia', 'Estados Unidos', 'México', 'España', 'Francia'],
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
    setSearchParams(params);
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
      ordenarPor: 'nombre_asc',
      pagina: 1,
      limite: productosPorPagina,
    });
    setPaginaActual(1);
    setHayMasProductos(true);
  };

  const handleOrdenarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleFiltrosChange({ ordenarPor: e.target.value as FiltrosProducto['ordenarPor'] });
  };

  const handleVerDetalle = (producto: Producto) => {
    setProductoDetalle(producto);
    setModalAbierto(true);
  };

  // Datos de prueba (cuando no hay backend)
  const getProductosDePrueba = (): Producto[] => [
    {
      id_producto: 'P001',
      descripcion: 'Johnnie Walker Black Label 12 Años',
      precio_venta: 45.99,
      precio_regular: 55.00,
      volumen: 750,
      alcohol_vol: 40,
      origen: 'Escocia',
      notas_cata: 'Notas ahumadas con toques de vainilla y caramelo',
      saldo_actual: 15,
      estado: 'ACT',
      marca: { id_marca: 1, nombre: 'Johnnie Walker', id_categoria: 1, estado: 'ACT' }
    },
    {
      id_producto: 'P002',
      descripcion: 'Jack Daniels Tennessee Whiskey',
      precio_venta: 38.50,
      volumen: 700,
      alcohol_vol: 40,
      origen: 'Estados Unidos',
      saldo_actual: 8,
      estado: 'ACT',
      marca: { id_marca: 2, nombre: 'Jack Daniels', id_categoria: 1, estado: 'ACT' }
    },
    {
      id_producto: 'P003',
      descripcion: 'Glenfiddich 15 Años Solera',
      precio_venta: 89.99,
      precio_regular: 99.99,
      volumen: 750,
      alcohol_vol: 40,
      origen: 'Escocia',
      notas_cata: 'Frutas maduras, especias y miel con un final sedoso',
      saldo_actual: 5,
      estado: 'ACT',
      marca: { id_marca: 3, nombre: 'Glenfiddich', id_categoria: 1, estado: 'ACT' }
    },
    {
      id_producto: 'P004',
      descripcion: 'Chivas Regal 12 Años',
      precio_venta: 42.00,
      volumen: 750,
      alcohol_vol: 40,
      origen: 'Escocia',
      saldo_actual: 20,
      estado: 'ACT',
      marca: { id_marca: 4, nombre: 'Chivas Regal', id_categoria: 1, estado: 'ACT' }
    },
    {
      id_producto: 'P005',
      descripcion: 'Bacardi Carta Blanca',
      precio_venta: 18.99,
      volumen: 750,
      alcohol_vol: 37.5,
      origen: 'Puerto Rico',
      saldo_actual: 30,
      estado: 'ACT',
      marca: { id_marca: 5, nombre: 'Bacardí', id_categoria: 4, estado: 'ACT' }
    },
    {
      id_producto: 'P006',
      descripcion: 'Absolut Vodka Original',
      precio_venta: 24.50,
      volumen: 700,
      alcohol_vol: 40,
      origen: 'Suecia',
      saldo_actual: 25,
      estado: 'ACT',
      marca: { id_marca: 6, nombre: 'Absolut', id_categoria: 5, estado: 'ACT' }
    },
    {
      id_producto: 'P007',
      descripcion: 'Jose Cuervo Especial Gold',
      precio_venta: 22.00,
      volumen: 750,
      alcohol_vol: 38,
      origen: 'México',
      saldo_actual: 0,
      estado: 'ACT',
      marca: { id_marca: 7, nombre: 'Jose Cuervo', id_categoria: 6, estado: 'ACT' }
    },
    {
      id_producto: 'P008',
      descripcion: 'Casillero del Diablo Cabernet Sauvignon',
      precio_venta: 12.99,
      volumen: 750,
      alcohol_vol: 13.5,
      origen: 'Chile',
      notas_cata: 'Aromas a frutas rojas maduras con notas de vainilla',
      saldo_actual: 40,
      estado: 'ACT',
      marca: { id_marca: 8, nombre: 'Casillero del Diablo', id_categoria: 2, estado: 'ACT' }
    },
  ];

  // Categorías de prueba si no hay datos
  const categoriasDefault: Categoria[] = [
    { id_categoria_producto: 1, nombre: 'Whisky', activo: true },
    { id_categoria_producto: 2, nombre: 'Vinos', activo: true },
    { id_categoria_producto: 3, nombre: 'Cervezas', activo: true },
    { id_categoria_producto: 4, nombre: 'Ron', activo: true },
    { id_categoria_producto: 5, nombre: 'Vodka', activo: true },
    { id_categoria_producto: 6, nombre: 'Tequila', activo: true },
  ];

  const categoriasAMostrar = categorias.length > 0 ? categorias : categoriasDefault;

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
                categorias={categoriasAMostrar}
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
                  <p className="catalog-toolbar__results" aria-live="polite" aria-atomic="true">
                    Mostrando <strong>{productos.length}</strong> de <strong>{totalProductos}</strong> productos
                  </p>
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
                      {productos.map((producto) => (
                        <ProductCard
                          key={producto.id_producto}
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
                        <p>Has visto todos los productos ({totalProductos} en total)</p>
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
