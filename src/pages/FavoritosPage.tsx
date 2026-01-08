// src/pages/FavoritosPage.tsx - Página de Lista de Deseos/Favoritos
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useFavoritos } from '../context/FavoritosContext';
import { useCarrito } from '../context/CarritoContext';
import catalogoService from '../services/catalogo.service';
import { getImagenProductoUrl, PLACEHOLDER_PRODUCTO } from '../config/api.config';
import { Producto } from '../types/catalogo.types';
import './FavoritosPage.css';

const FavoritosPage: React.FC = () => {
  const navigate = useNavigate();
  const { favoritos, favoritosCompletos, toggleFavorito, limpiarFavoritos } = useFavoritos();
  const { agregarAlCarrito } = useCarrito();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificacion, setNotificacion] = useState<{mensaje: string, tipo: 'success' | 'error' | 'info'} | null>(null);

  // Cargar productos favoritos desde API o context
  useEffect(() => {
    const cargarFavoritos = async () => {
      if (favoritos.length === 0) {
        setProductos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Si tenemos favoritos completos del API, usarlos
        if (favoritosCompletos.length > 0) {
          const productosConDatos = favoritosCompletos
            .filter(f => f.producto)
            .map(f => f.producto as Producto);
          setProductos(productosConDatos);
        } else {
          // Fallback: cargar desde la API de productos
          const response = await catalogoService.getProductos({ limite: 100 });
          const productosFavoritos = response.productos.filter(p => 
            favoritos.includes(p.id_producto)
          );
          setProductos(productosFavoritos);
        }
      } catch (error) {
        console.error('Error cargando favoritos:', error);
        // Productos de prueba si falla la API
        setProductos(getProductosFallback().filter(p => favoritos.includes(p.id_producto)));
      } finally {
        setLoading(false);
      }
    };

    cargarFavoritos();
  }, [favoritos, favoritosCompletos]);

  // Productos fallback
  const getProductosFallback = (): Producto[] => [
    {
      id_producto: 'fav-1',
      nombre: 'Johnnie Walker Black Label',
      precio_venta: 45.99,
      precio_regular: 52.99,
      imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=500&fit=crop&q=80',
      categoria: { id_categoria: 1, nombre: 'Whisky' },
      marca: { id_marca: 1, nombre: 'Johnnie Walker' },
      stock: 25,
      descripcion: 'Whisky escocés premium 12 años',
      volumen_ml: 750,
      porcentaje_alcohol: 40,
      activo: true
    },
    {
      id_producto: 'fav-2',
      nombre: 'Casillero del Diablo Cabernet',
      precio_venta: 12.99,
      imagen_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=500&fit=crop&q=80',
      categoria: { id_categoria: 2, nombre: 'Vinos' },
      marca: { id_marca: 2, nombre: 'Concha y Toro' },
      stock: 40,
      descripcion: 'Vino tinto chileno',
      volumen_ml: 750,
      porcentaje_alcohol: 13.5,
      activo: true
    },
  ];

  // Mostrar notificación
  const mostrarNotificacion = (mensaje: string, tipo: 'success' | 'error' | 'info') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // Agregar al carrito
  const handleAgregarCarrito = (producto: Producto) => {
    agregarAlCarrito(producto);
    mostrarNotificacion(`¡${producto.nombre} agregado al carrito!`, 'success');
    // Guardar origen y navegar al carrito
    localStorage.setItem('origenCarrito', '/favoritos');
    setTimeout(() => navigate('/carrito'), 500);
  };

  // Agregar todos al carrito
  const handleAgregarTodos = () => {
    productos.forEach(producto => agregarAlCarrito(producto));
    mostrarNotificacion(`¡${productos.length} producto(s) agregados al carrito!`, 'success');
    // Guardar origen y navegar al carrito
    localStorage.setItem('origenCarrito', '/favoritos');
    setTimeout(() => navigate('/carrito'), 500);
  };

  // Quitar de favoritos
  const handleQuitarFavorito = (idProducto: string, nombre: string) => {
    toggleFavorito(idProducto);
    mostrarNotificacion(`${nombre} eliminado de favoritos`, 'info');
  };

  // Vaciar favoritos
  const handleVaciarFavoritos = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar tu lista de deseos?')) {
      limpiarFavoritos();
      mostrarNotificacion('Lista de deseos vaciada', 'info');
    }
  };

  // Obtener icono de categoría
  const getCategoryIcon = (categoria?: string): string => {
    const iconMap: Record<string, string> = {
      'Whisky': 'fa-glass-whiskey',
      'Vinos': 'fa-wine-glass-alt',
      'Vino': 'fa-wine-glass-alt',
      'Cervezas': 'fa-beer',
      'Cerveza': 'fa-beer',
      'Ron': 'fa-cocktail',
      'Vodka': 'fa-glass-martini-alt',
    };
    return iconMap[categoria || ''] || 'fa-wine-bottle';
  };

  return (
    <>
      <Header />

      <main className="favoritos-page">
        {/* Notificación */}
        {notificacion && (
          <div className={`favoritos-notificacion favoritos-notificacion--${notificacion.tipo}`}>
            <i className={`fas fa-${
              notificacion.tipo === 'success' ? 'check-circle' : 
              notificacion.tipo === 'error' ? 'exclamation-circle' : 'info-circle'
            }`}></i>
            <span>{notificacion.mensaje}</span>
          </div>
        )}

        {/* Hero Section */}
        <section className="favoritos-hero">
          <div className="container">
            <div className="favoritos-hero__content">
              <i className="fas fa-heart"></i>
              <div>
                <h1>Mi Lista de Deseos</h1>
                <p>Tus productos favoritos guardados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="favoritos-content">
          <div className="container">
            {loading ? (
              <div className="favoritos-loading">
                <div className="spinner"></div>
                <p>Cargando favoritos...</p>
              </div>
            ) : productos.length === 0 ? (
              /* Lista Vacía */
              <div className="favoritos-vacio">
                <div className="favoritos-vacio__icon">
                  <i className="far fa-heart"></i>
                </div>
                <h2>Tu lista de deseos está vacía</h2>
                <p>¡Explora nuestro catálogo y guarda tus productos favoritos!</p>
                <Link to="/catalogo" className="btn-primary">
                  <i className="fas fa-shopping-bag"></i>
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <>
                {/* Header con acciones */}
                <div className="favoritos-header">
                  <h2>{productos.length} producto{productos.length !== 1 ? 's' : ''} en tu lista</h2>
                  <div className="favoritos-actions">
                    <button 
                      className="btn-agregar-todos"
                      onClick={handleAgregarTodos}
                    >
                      <i className="fas fa-cart-plus"></i>
                      Agregar todos al carrito
                    </button>
                    <button 
                      className="btn-vaciar"
                      onClick={handleVaciarFavoritos}
                    >
                      <i className="fas fa-trash"></i>
                      Vaciar lista
                    </button>
                  </div>
                </div>

                {/* Grid de productos */}
                <div className="favoritos-grid">
                  {productos.map((producto) => {
                    const tieneDescuento = producto.precio_regular && 
                      producto.precio_regular > producto.precio_venta;
                    const porcentajeDescuento = tieneDescuento 
                      ? Math.round((1 - Number(producto.precio_venta) / Number(producto.precio_regular)) * 100)
                      : 0;

                    return (
                      <article key={producto.id_producto} className="favorito-card">
                        {tieneDescuento && (
                          <span className="favorito-badge">-{porcentajeDescuento}%</span>
                        )}
                        
                        <button 
                          className="favorito-remove"
                          onClick={() => handleQuitarFavorito(producto.id_producto, producto.nombre || 'Producto')}
                          aria-label="Quitar de favoritos"
                        >
                          <i className="fas fa-times"></i>
                        </button>

                        <div className="favorito-card__image">
                          <img 
                            src={getImagenProductoUrl(producto.imagen_url)}
                            alt={producto.nombre}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_PRODUCTO;
                            }}
                          />
                        </div>

                        <div className="favorito-card__content">
                          <span className="favorito-categoria">
                            <i className={`fas ${getCategoryIcon(producto.categoria?.nombre)}`}></i>
                            {producto.categoria?.nombre || 'Licores'}
                          </span>
                          
                          <h3 className="favorito-nombre">{producto.nombre}</h3>
                          
                          {producto.volumen_ml && (
                            <p className="favorito-specs">
                              {producto.volumen_ml}ml
                              {producto.porcentaje_alcohol && ` • ${producto.porcentaje_alcohol}%`}
                            </p>
                          )}

                          <div className="favorito-precio">
                            {tieneDescuento && (
                              <span className="precio-old">${Number(producto.precio_regular).toFixed(2)}</span>
                            )}
                            <span className="precio-actual">${Number(producto.precio_venta).toFixed(2)}</span>
                          </div>

                          <div className="favorito-card__actions">
                            <button 
                              className="btn-agregar"
                              onClick={() => handleAgregarCarrito(producto)}
                            >
                              <i className="fas fa-cart-plus"></i>
                              Agregar al carrito
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Link al catálogo */}
                <div className="favoritos-footer">
                  <Link to="/catalogo" className="btn-seguir-comprando">
                    <i className="fas fa-arrow-left"></i>
                    Seguir explorando el catálogo
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FavoritosPage;
