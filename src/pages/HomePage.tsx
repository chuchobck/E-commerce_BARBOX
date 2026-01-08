import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useCarrito } from '../context/CarritoContext';
import { useFavoritos } from '../context/FavoritosContext';
import catalogoService from '../services/catalogo.service';
import { Producto } from '../types/catalogo.types';
import { getImagenProductoUrl, PLACEHOLDER_PRODUCTO } from '../config/api.config';
import './HomePage.css';

const HomePage: React.FC = () => {
  // Estados
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([]);

  const navigate = useNavigate();
  const { agregarAlCarrito } = useCarrito();
  const { toggleFavorito, esFavorito } = useFavoritos();

  // Función para agregar al carrito y navegar
  const handleAgregarAlCarrito = (producto: Producto) => {
    agregarAlCarrito(producto);
    // Guardar página de origen para botón "Seguir Comprando"
    localStorage.setItem('origenCarrito', '/');
    // Navegar al carrito
    setTimeout(() => navigate('/carrito'), 300);
  };

  // Slides del carrusel - Promociones destacadas
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=480&fit=crop&q=80',
      caption: '🏢 CORPORATIVO PROMOCIONES',
      subtitle: 'Hasta 40% OFF en Whiskies Premium',
      badge: '-40%',
      link: '/promociones?categoria=Corporativo'
    },
    {
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=480&fit=crop&q=80',
      caption: '💝 PROMOCIONES',
      subtitle: '3x2 en Vinos Seleccionados',
      badge: '3x2',
      link: '/promociones?categoria=San Valentín'
    },
    {
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=480&fit=crop&q=80',
      caption: '🎊 FIESTAS PROMOCIONES',
      subtitle: 'Combos Especiales desde $29.99',
      badge: 'NUEVO',
      link: '/promociones?categoria=Fiestas'
    }
  ];

  // Cargar datos - CORREGIDO para manejar respuesta del backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        console.log('🏠 HomePage: Cargando productos destacados...');
        const response = await catalogoService.getProductos({ limite: 8, ordenarPor: 'popular' });
        
        // ✅ El servicio ya normaliza la respuesta a ProductosResponse - limitado a 8 (2 filas de 4)
        const productos = response?.productos || [];
        
        console.log('✅ Productos recibidos:', productos.length);
        if (productos.length > 0) {
          console.log('📸 Primera imagen:', productos[0]?.imagen_url);
        }
        
        setProductosDestacados(productos);
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setProductosDestacados(getProductosFallback());
      }
    };
    cargarDatos();
  }, []);

  // Auto-play carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Navegación carrusel
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Datos fallback
  const getProductosFallback = (): Producto[] => [
    {
      id_producto: 'P001',
      descripcion: 'Casillero del Diablo Reserva',
      precio_venta: 18.99,
      precio_regular: 22.99,
      volumen: 750,
      alcohol_vol: 13.5,
      origen: 'Chile',
      saldo_actual: 20,
      estado: 'ACT',
      marca: { id_marca: 1, nombre: 'Vino Tinto', id_categoria: 1, estado: 'ACT' }
    },
    {
      id_producto: 'P002',
      descripcion: 'Johnnie Walker Black Label',
      precio_venta: 42.99,
      volumen: 750,
      alcohol_vol: 40,
      origen: 'Escocia',
      saldo_actual: 15,
      estado: 'ACT',
      marca: { id_marca: 2, nombre: 'Whisky', id_categoria: 4, estado: 'ACT' }
    },
    {
      id_producto: 'P003',
      descripcion: 'Diplomático Reserva Exclusiva',
      precio_venta: 38.99,
      volumen: 750,
      alcohol_vol: 40,
      origen: 'Venezuela',
      saldo_actual: 10,
      estado: 'ACT',
      marca: { id_marca: 3, nombre: 'Ron', id_categoria: 2, estado: 'ACT' }
    },
    {
      id_producto: 'P004',
      descripcion: 'Pack Cerveza Artesanal IPA',
      precio_venta: 15.99,
      precio_regular: 19.99,
      volumen: 330,
      alcohol_vol: 6.5,
      origen: 'Ecuador',
      saldo_actual: 50,
      estado: 'ACT',
      marca: { id_marca: 4, nombre: 'Cerveza', id_categoria: 5, estado: 'ACT' }
    }
  ];

  // Categorías con iconos - IDs basados en la base de datos real (SIMÉTRICA: 2 filas de 3)
  const categoriasConIconos = [
    { nombre: 'Vino', icon: 'fa-wine-glass', count: '150+', categoriaId: 1 },
    { nombre: 'Ron', icon: 'fa-cocktail', count: '60+', categoriaId: 2 },
    { nombre: 'Vodka', icon: 'fa-fill-drip', count: '45+', categoriaId: 3 },
    { nombre: 'Whisky', icon: 'fa-glass-whiskey', count: '80+', categoriaId: 4 },
    { nombre: 'Cerveza', icon: 'fa-beer', count: '120+', categoriaId: 5 },
    { nombre: 'Cocteles', icon: 'fa-blender', count: '40+', categoriaId: 6 }
  ];

  return (
    <div className="home-page">
      <Header />

      {/* ==================== HERO SECTION ==================== */}
      <section className="hero">
        <div className="container hero__wrapper">
          <div className="hero__content">
            <h1 className="hero__title">
              Celebra la Vida con
              <span className="hero__highlight">Sabores Exclusivos</span>
            </h1>
            <p className="hero__description">
              Sumérgete en nuestra curada selección de vinos de colección, whiskies de autor
              y licores artesanales. La botella perfecta para cada ocasión.
            </p>
            <div className="hero__actions">
              <Link to="/promociones" className="btn btn--primary">
                <i className="fas fa-tags"></i>
                Nuestras Promociones
              </Link>
              <a href="#productos-destacados" className="btn btn--secondary">
                <i className="fas fa-star"></i>
                Nuestras Recomendaciones
              </a>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>500+</strong>
                <span>Etiquetas Exclusivas</span>
              </div>
              <div className="hero__stat">
                <strong>50+</strong>
                <span>Regiones del Mundo</span>
              </div>
              <div className="hero__stat">
                <strong>10K+</strong>
                <span>Clientes Satisfechos</span>
              </div>
            </div>
          </div>

          <div className="hero__carousel">
            <div className="carousel__track-container">
              <ul className="carousel__track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                  <li key={index} className={`carousel__slide ${index === currentSlide ? 'carousel__slide--current' : ''}`}>
                    <Link to={slide.link} className="carousel__link">
                      {slide.badge && <span className="carousel__badge">{slide.badge}</span>}
                      <img src={slide.image} alt={slide.caption} className="carousel__image" />
                      <div className="carousel__overlay">
                        <div className="carousel__caption">{slide.caption}</div>
                        {slide.subtitle && <div className="carousel__subtitle">{slide.subtitle}</div>}
                        <span className="carousel__cta">Ver ofertas <i className="fas fa-arrow-right"></i></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <button className="carousel__button carousel__button--prev" onClick={prevSlide} aria-label="Anterior">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="carousel__button carousel__button--next" onClick={nextSlide} aria-label="Siguiente">
              <i className="fas fa-chevron-right"></i>
            </button>
            <div className="carousel__nav">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel__indicator ${index === currentSlide ? 'carousel__indicator--current' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CATEGORÍAS ==================== */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Encuentra Tu Inspiración</h2>
            <p className="section-subtitle">Una experiencia curada en cada categoría</p>
          </div>

          <div className="categories__grid">
            {categoriasConIconos.map((cat, index) => (
              <Link
                key={index}
                to={`/catalogo?categoriaId=${cat.categoriaId}`}
                className="category-card"
              >
                <div className="category-card__icon">
                  <i className={`fas ${cat.icon}`}></i>
                </div>
                <h3 className="category-card__title">{cat.nombre}</h3>
                <p className="category-card__count">{cat.count} productos</p>
                <span className="category-card__link">
                  Ver todos <i className="fas fa-arrow-right"></i>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTOS DESTACADOS ==================== */}
      <section id="productos-destacados" className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Selección del Sommelier</h2>
            <p className="section-subtitle">Las botellas que no pueden faltar en tu colección</p>
          </div>

          <div className="products-grid">
            {(productosDestacados.length > 0 ? productosDestacados : getProductosFallback()).map((producto) => {
              const tieneDescuento = producto.precio_regular && producto.precio_regular > producto.precio_venta;
              const descuento = tieneDescuento
                ? Math.round(((producto.precio_regular! - producto.precio_venta) / producto.precio_regular!) * 100)
                : 0;

              return (
                <article key={producto.id_producto} className="product-card">
                  <div className="product-card__image">
                    {tieneDescuento && (
                      <span className="product-card__badge">-{descuento}%</span>
                    )}
                    <button
                      className={`product-card__wishlist ${esFavorito(producto.id_producto) ? 'active' : ''}`}
                      onClick={() => toggleFavorito(producto.id_producto)}
                      aria-label={esFavorito(producto.id_producto) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      tabIndex={0}
                    >
                      <i className={esFavorito(producto.id_producto) ? 'fas fa-heart' : 'far fa-heart'} aria-hidden="true"></i>
                    </button>
                    <img
                      src={getImagenProductoUrl(producto.imagen_url)}
                      alt={producto.descripcion}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_PRODUCTO;
                      }}
                    />
                  </div>
                  <div className="product-card__content">
                    <span className="product-card__category">{producto.marca?.nombre}</span>
                    <h3 className="product-card__title">{producto.descripcion}</h3>
                    <p className="product-card__description">
                      {producto.volumen}ml{producto.alcohol_vol ? ` • ${producto.alcohol_vol}%` : ''}
                    </p>
                    <div className="product-card__footer">
                      <div className="product-card__price">
                        ${Number(producto.precio_venta).toFixed(2)}
                        {tieneDescuento && (
                          <span className="product-card__price-old">${Number(producto.precio_regular).toFixed(2)}</span>
                        )}
                      </div>
                      <button
                        className="product-card__btn"
                        onClick={() => handleAgregarAlCarrito(producto)}
                        aria-label={`Agregar ${producto.descripcion} al carrito`}
                        tabIndex={0}
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;