// src/pages/PromocionesPage.tsx - Página de Promociones
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useCarrito } from '../context/CarritoContext';
import promocionesService, { 
  Promocion, 
  CategoriaPromocion, 
  FiltrosPromocion 
} from '../services/promociones.service';
import { getImagenProductoUrl } from '../config/api.config';
import './PromocionesPage.css';

// Iconos para cada ocasión
const ICONOS_OCASIONES: { [key: string]: string } = {
  'Todas': 'fas fa-star',
  'NAVIDAD': 'fas fa-tree',
  'AÑO NUEVO': 'fas fa-champagne-glasses',
  'CUMPLEAÑOS': 'fas fa-birthday-cake',
  'BODAS': 'fas fa-ring',
  'SAN VALENTIN': 'fas fa-heart',
  'FIESTAS': 'fas fa-music',
  'CORPORATIVO': 'fas fa-briefcase',
  'Navidad': 'fas fa-tree',
  'Año Nuevo': 'fas fa-champagne-glasses',
  'Cumpleaños': 'fas fa-birthday-cake',
  'Bodas': 'fas fa-ring',
  'San Valentín': 'fas fa-heart',
  'Fiestas': 'fas fa-music',
  'Corporativo': 'fas fa-briefcase',
  'Día del Padre': 'fas fa-user-tie',
  'Día de la Madre': 'fas fa-heart',
  'Halloween': 'fas fa-ghost',
  'default': 'fas fa-gift'
};

const PromocionesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPromocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);
  const [ordenActivo, setOrdenActivo] = useState<string>('destacado');
  const [tituloSeccion, setTituloSeccion] = useState('Todas las Promociones');
  const [minPrecio, setMinPrecio] = useState<string>('');
  const [maxPrecio, setMaxPrecio] = useState<string>('');
  const [minPrecioFiltro, setMinPrecioFiltro] = useState<string>('');
  const [maxPrecioFiltro, setMaxPrecioFiltro] = useState<string>('');
  
  // Countdown
  const [countdown, setCountdown] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
  
  // Carrito
  const { agregarAlCarrito } = useCarrito();
  const [agregandoId, setAgregandoId] = useState<number | null>(null);

  // Ref para scroll automático
  const promosSeccionRef = React.useRef<HTMLElement>(null);

  // Cargar categorías
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await promocionesService.getCategorias();
        // Agregar opción "Todas" al inicio
        const todasLasOfertas = data.reduce((sum, cat) => sum + cat.totalOfertas, 0);
        setCategorias([
          { id: 0, nombre: 'Todas', totalOfertas: todasLasOfertas },
          ...data
        ]);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        // Categorías de prueba
        setCategorias([
          { id: 0, nombre: 'Todas', totalOfertas: 24 },
          { id: 1, nombre: 'Navidad', totalOfertas: 8 },
          { id: 2, nombre: 'Año Nuevo', totalOfertas: 6 },
          { id: 3, nombre: 'Cumpleaños', totalOfertas: 5 },
          { id: 4, nombre: 'Bodas', totalOfertas: 4 },
          { id: 5, nombre: 'San Valentín', totalOfertas: 3 },
          { id: 6, nombre: 'Fiestas', totalOfertas: 10 },
          { id: 7, nombre: 'Corporativo', totalOfertas: 4 }
        ]);
      }
    };
    cargarCategorias();
  }, []);

  // Leer categoría desde URL y establecer filtro
  useEffect(() => {
    const categoriaUrl = searchParams.get('categoria');
    if (categoriaUrl) {
      setCategoriaActiva(categoriaUrl);
      setTituloSeccion(`Promociones de ${categoriaUrl}`);
      
      // Scroll automático a la sección de promociones cuando viene desde carrusel
      setTimeout(() => {
        promosSeccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [searchParams]);

  // Cargar promociones
  const cargarPromociones = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filtros: FiltrosPromocion = {
        ordenarPor: ordenActivo as FiltrosPromocion['ordenarPor'],
        limite: 20
      };
      
      if (categoriaActiva) {
        filtros.categoria = categoriaActiva;
      }

      if (minPrecioFiltro) {
        filtros.minPrecio = parseFloat(minPrecioFiltro);
      }

      if (maxPrecioFiltro) {
        filtros.maxPrecio = parseFloat(maxPrecioFiltro);
      }

      const response = await promocionesService.getPromociones(filtros);
      setPromociones(response.promociones);
    } catch (err) {
      console.error('Error cargando promociones:', err);
      setError('Error al cargar promociones');
      // Datos de prueba filtrados
      const testData = getPromocionesDePrueba();
      const filteredData = categoriaActiva ? testData.filter(p => p.categoria_promocion.nombre === categoriaActiva) : testData;
      setPromociones(filteredData);
    } finally {
      setLoading(false);
    }
  }, [categoriaActiva, ordenActivo, minPrecioFiltro, maxPrecioFiltro]);

  useEffect(() => {
    cargarPromociones();
  }, [cargarPromociones]);

  // Countdown
  useEffect(() => {
    const updateCountdown = () => {
      const navidad = new Date(new Date().getFullYear(), 11, 25);
      const now = new Date();
      
      if (now > navidad) {
        navidad.setFullYear(navidad.getFullYear() + 1);
      }

      const diff = navidad.getTime() - now.getTime();
      
      setCountdown({
        dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
        horas: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutos: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleCategoriaClick = (categoria: CategoriaPromocion) => {
    setCategoriaActiva(categoria.id === 0 ? null : categoria.nombre);
    setTituloSeccion(categoria.id === 0 ? 'Todas las Promociones' : `Promociones de ${categoria.nombre}`);
    
    // Scroll automático a la sección de promociones
    setTimeout(() => {
      promosSeccionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOrdenClick = (orden: string) => {
    setOrdenActivo(orden);
  };

  const handleAplicarFiltros = () => {
    setMinPrecioFiltro(minPrecio);
    setMaxPrecioFiltro(maxPrecio);
  };

  const handleAgregarCarrito = async (promocion: Promocion) => {
    setAgregandoId(promocion.id);
    
    // Simular agregar al carrito
    const itemCarrito = {
      id_producto: `PROMO-${promocion.id}`,
      descripcion: promocion.nombre,
      precio_venta: Number(promocion.precio_promocional),
      precio_regular: Number(promocion.precio_original),
      imagen_url: promocion.promocion_productos?.[0]?.producto?.imagen_url,
      saldo_actual: promocion.stock_disponible,
      estado: 'ACT'
    };
    
    agregarAlCarrito(itemCarrito as any, 1);
    
    // Guardar origen y navegar al carrito
    localStorage.setItem('origenCarrito', '/promociones');
    
    setTimeout(() => {
      setAgregandoId(null);
      navigate('/carrito');
    }, 500);
  };

  const getIcono = (nombre: string): string => {
    return ICONOS_OCASIONES[nombre] || ICONOS_OCASIONES['default'];
  };

  const getBandera = (origen: string): string => {
    const banderas: { [key: string]: string } = {
      'Chile': '🇨🇱',
      'Escocia': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'España': '🇪🇸',
      'Argentina': '🇦🇷',
      'Estados Unidos': '🇺🇸',
      'Alemania': '🇩🇪'
    };
    return banderas[origen] || '🌍';
  };

  const getBottleIcon = (volumen: number): string => {
    if (volumen <= 330) return 'fas fa-beer';
    if (volumen <= 500) return 'fas fa-glass-whiskey';
    return 'fas fa-wine-bottle';
  };

  // Datos de prueba
  const getPromocionesDePrueba = (): Promocion[] => [
    {
      id: 1,
      nombre: 'Pack Navidad Premium',
      descripcion: 'El combo perfecto para celebrar en familia estas fiestas navideñas.',
      descripcion_corta: '3 botellas premium',
      precio_original: 138.50,
      precio_promocional: 89.99,
      porcentaje_descuento: 35,
      cantidad_vendida: 150,
      fecha_inicio: '2025-12-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: true,
      envio_gratis: false,
      stock_disponible: 50,
      categoria_promocion: { id: 1, nombre: 'Navidad' },
      promocion_productos: [
        { id: 1, cantidad: 1, es_regalo: false, producto: { id_producto: 'P001', descripcion: 'Johnnie Walker Black Label 750ml', imagen_url: '1.webp', volumen: 750, origen: 'Escocia' } },
        { id: 2, cantidad: 1, es_regalo: false, producto: { id_producto: 'P002', descripcion: 'Vino Casillero del Diablo', imagen_url: '2.webp', volumen: 750, origen: 'Chile' } },
        { id: 3, cantidad: 1, es_regalo: false, producto: { id_producto: 'P003', descripcion: 'Champagne Moët & Chandon', imagen_url: '3.webp', volumen: 750, origen: 'Francia' } }
      ]
    },
    {
      id: 2,
      nombre: 'Pack Brindis 2026',
      descripcion: '3 botellas de espumante para recibir el año nuevo con estilo.',
      descripcion_corta: 'Espumantes + copa regalo',
      precio_original: 125.00,
      precio_promocional: 75.00,
      porcentaje_descuento: 40,
      cantidad_vendida: 200,
      fecha_inicio: '2025-12-15',
      fecha_fin: '2026-01-01',
      activo: true,
      destacado: true,
      envio_gratis: true,
      stock_disponible: 30,
      categoria_promocion: { id: 2, nombre: 'Año Nuevo' },
      promocion_productos: [
        { id: 4, cantidad: 2, es_regalo: false, producto: { id_producto: 'P004', descripcion: 'Chandon Brut 750ml', imagen_url: '4.webp', volumen: 750 } },
        { id: 5, cantidad: 1, es_regalo: false, producto: { id_producto: 'P005', descripcion: 'Freixenet Carta Nevada', imagen_url: '5.webp', volumen: 750 } }
      ]
    },
    {
      id: 3,
      nombre: 'Pack Coctelería Party',
      descripcion: 'Todo lo necesario para preparar los mejores cócteles en tu fiesta.',
      descripcion_corta: 'Vodka + Ron + Mezcladores',
      precio_original: 73.50,
      precio_promocional: 55.00,
      porcentaje_descuento: 25,
      cantidad_vendida: 180,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: false,
      envio_gratis: false,
      stock_disponible: 45,
      categoria_promocion: { id: 3, nombre: 'Cumpleaños' },
      promocion_productos: [
        { id: 6, cantidad: 1, es_regalo: false, producto: { id_producto: 'P006', descripcion: 'Absolut Vodka 750ml', imagen_url: '6.webp', volumen: 750 } },
        { id: 7, cantidad: 1, es_regalo: false, producto: { id_producto: 'P007', descripcion: 'Bacardí Blanco 750ml', imagen_url: '7.webp', volumen: 750 } }
      ]
    },
    {
      id: 4,
      nombre: 'Pack Romántico',
      descripcion: 'Sorprende a tu pareja con esta selección especial de vinos.',
      descripcion_corta: 'Vinos + 2 copas de cristal',
      precio_original: 92.50,
      precio_promocional: 65.00,
      porcentaje_descuento: 30,
      cantidad_vendida: 95,
      fecha_inicio: '2025-02-01',
      fecha_fin: '2025-02-28',
      activo: true,
      destacado: true,
      envio_gratis: false,
      stock_disponible: 25,
      categoria_promocion: { id: 5, nombre: 'San Valentín' },
      promocion_productos: [
        { id: 8, cantidad: 1, es_regalo: false, producto: { id_producto: 'P008', descripcion: 'Vino Tinto Reserva', imagen_url: '8.webp', volumen: 750 } },
        { id: 9, cantidad: 1, es_regalo: false, producto: { id_producto: 'P009', descripcion: 'Espumante Rosé', imagen_url: '9.webp', volumen: 750 } }
      ]
    },
    {
      id: 5,
      nombre: 'Pack Boda Elegante',
      descripcion: 'Caja de 12 botellas para tu día especial con descuento exclusivo.',
      descripcion_corta: '6 Champagne + 6 Vinos',
      precio_original: 374.00,
      precio_promocional: 299.00,
      porcentaje_descuento: 20,
      cantidad_vendida: 45,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: true,
      envio_gratis: true,
      stock_disponible: 15,
      categoria_promocion: { id: 4, nombre: 'Bodas' },
      promocion_productos: [
        { id: 10, cantidad: 6, es_regalo: false, producto: { id_producto: 'P010', descripcion: 'Champagne Veuve Clicquot', imagen_url: '10.webp', volumen: 750 } },
        { id: 11, cantidad: 6, es_regalo: false, producto: { id_producto: 'P011', descripcion: 'Vino Blanco Premium', imagen_url: '11.webp', volumen: 750 } }
      ]
    },
    {
      id: 6,
      nombre: 'Pack Fiesta Total',
      descripcion: 'Todo lo que necesitas para una noche épica con amigos.',
      descripcion_corta: '24 Cervezas + Jäger + Red Bull',
      precio_original: 185.00,
      precio_promocional: 120.00,
      porcentaje_descuento: 35,
      cantidad_vendida: 250,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: false,
      envio_gratis: false,
      stock_disponible: 60,
      categoria_promocion: { id: 6, nombre: 'Fiestas' },
      promocion_productos: [
        { id: 12, cantidad: 24, es_regalo: false, producto: { id_producto: 'P012', descripcion: 'Cervezas Premium Mix', imagen_url: '12.webp', volumen: 330 } },
        { id: 13, cantidad: 1, es_regalo: false, producto: { id_producto: 'P013', descripcion: 'Jägermeister 700ml', imagen_url: '13.webp', volumen: 700 } }
      ]
    },
    {
      id: 7,
      nombre: 'Pack Corporativo Premium',
      descripcion: 'Selección exclusiva de whiskies para eventos empresariales.',
      descripcion_corta: '3 Whiskies Premium + Hielo',
      precio_original: 280.00,
      precio_promocional: 168.00,
      porcentaje_descuento: 40,
      cantidad_vendida: 85,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: true,
      envio_gratis: true,
      stock_disponible: 40,
      categoria_promocion: { id: 7, nombre: 'Corporativo' },
      promocion_productos: [
        { id: 14, cantidad: 1, es_regalo: false, producto: { id_producto: 'P014', descripcion: 'Johnnie Walker Blue Label', imagen_url: '1.webp', volumen: 750 } },
        { id: 15, cantidad: 1, es_regalo: false, producto: { id_producto: 'P015', descripcion: 'Chivas Regal 18 años', imagen_url: '2.webp', volumen: 750 } },
        { id: 16, cantidad: 1, es_regalo: false, producto: { id_producto: 'P016', descripcion: 'Glenfiddich 15 años', imagen_url: '3.webp', volumen: 750 } }
      ]
    },
    {
      id: 8,
      nombre: 'Pack Ejecutivo Gold',
      descripcion: 'Regalo corporativo ideal para clientes VIP y socios.',
      descripcion_corta: 'Champagne + Whisky + Estuche',
      precio_original: 195.00,
      precio_promocional: 135.00,
      porcentaje_descuento: 31,
      cantidad_vendida: 60,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: false,
      envio_gratis: true,
      stock_disponible: 30,
      categoria_promocion: { id: 7, nombre: 'Corporativo' },
      promocion_productos: [
        { id: 17, cantidad: 1, es_regalo: false, producto: { id_producto: 'P017', descripcion: 'Moët & Chandon Imperial', imagen_url: '4.webp', volumen: 750 } },
        { id: 18, cantidad: 1, es_regalo: false, producto: { id_producto: 'P018', descripcion: 'Johnnie Walker Black Label', imagen_url: '5.webp', volumen: 750 } }
      ]
    },
    {
      id: 9,
      nombre: 'Pack Fiesta Reventón',
      descripcion: 'Mega pack con todo lo necesario para una fiesta inolvidable.',
      descripcion_corta: 'Ron + Vodka + Tequila + Mixers',
      precio_original: 165.00,
      precio_promocional: 115.00,
      porcentaje_descuento: 30,
      cantidad_vendida: 190,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: true,
      envio_gratis: false,
      stock_disponible: 55,
      categoria_promocion: { id: 6, nombre: 'Fiestas' },
      promocion_productos: [
        { id: 19, cantidad: 1, es_regalo: false, producto: { id_producto: 'P019', descripcion: 'Ron Barceló Imperial', imagen_url: '6.webp', volumen: 1000 } },
        { id: 20, cantidad: 1, es_regalo: false, producto: { id_producto: 'P020', descripcion: 'Absolut Vodka', imagen_url: '7.webp', volumen: 1000 } },
        { id: 21, cantidad: 1, es_regalo: false, producto: { id_producto: 'P021', descripcion: 'Tequila José Cuervo', imagen_url: '8.webp', volumen: 750 } }
      ]
    },
    {
      id: 10,
      nombre: 'Pack Prefiesta DJ',
      descripcion: 'Para empezar la noche con energía antes de salir.',
      descripcion_corta: '12 Cervezas + 2 Energéticas',
      precio_original: 48.00,
      precio_promocional: 35.00,
      porcentaje_descuento: 27,
      cantidad_vendida: 320,
      fecha_inicio: '2025-01-01',
      fecha_fin: '2025-12-31',
      activo: true,
      destacado: false,
      envio_gratis: false,
      stock_disponible: 75,
      categoria_promocion: { id: 6, nombre: 'Fiestas' },
      promocion_productos: [
        { id: 22, cantidad: 12, es_regalo: false, producto: { id_producto: 'P022', descripcion: 'Cerveza Pilsener', imagen_url: '9.webp', volumen: 330 } }
      ]
    }
  ];

  return (
    <>
      <Header />
      
      <main className="promo-page">
        {/* Hero Banner */}
        <section className="promo-hero">
          <div className="promo-hero__content">
            <h1 className="promo-hero__title">Promociones Especiales</h1>
            <p className="promo-hero__subtitle">
              Descubre packs increíbles para cada ocasión. ¡Ahorra hasta un 40%!
            </p>
          </div>
        </section>

        {/* Sección de Ocasiones */}
        <section className="occasions-section">
          <div className="section-header">
            <h2 className="section-header__title">¿Para qué ocasión buscas?</h2>
            <p className="section-header__subtitle">Selecciona una categoría y encuentra el pack perfecto</p>
          </div>

          <div className="occasions-grid">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className={`occasion-card ${(categoriaActiva === cat.nombre) || (cat.id === 0 && categoriaActiva === null) ? 'active' : ''}`}
                onClick={() => handleCategoriaClick(cat)}
              >
                <div className="occasion-card__icon">
                  <i className={getIcono(cat.nombre)}></i>
                </div>
                <h3 className="occasion-card__title">{cat.nombre}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Countdown - Solo mostrar para Navidad */}
        {(categoriaActiva === 'Navidad' || (categoriaActiva === null && categorias.some(c => c.nombre === 'Navidad'))) && (
          <section className="countdown-banner">
            <div className="countdown-banner__content">
              <h2 className="countdown-banner__title">
                <i className="fas fa-bell"></i> ¡Ofertas de Navidad terminan en!
              </h2>
              <div className="countdown">
                <div className="countdown__item">
                  <span className="countdown__number">{String(countdown.dias).padStart(2, '0')}</span>
                  <span className="countdown__label">Días</span>
                </div>
                <div className="countdown__item">
                  <span className="countdown__number">{String(countdown.horas).padStart(2, '0')}</span>
                  <span className="countdown__label">Horas</span>
                </div>
                <div className="countdown__item">
                  <span className="countdown__number">{String(countdown.minutos).padStart(2, '0')}</span>
                  <span className="countdown__label">Minutos</span>
                </div>
                <div className="countdown__item">
                  <span className="countdown__number">{String(countdown.segundos).padStart(2, '0')}</span>
                  <span className="countdown__label">Segundos</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sección de Promociones */}
        <section className="promos-section" ref={promosSeccionRef}>
          <div className="promos-header">
            <h2 className="promos-header__title">
              <i className="fas fa-box-open"></i>
              <span>{tituloSeccion}</span>
            </h2>
            <div className="promos-header__filters">
              <button 
                className={`filter-btn ${ordenActivo === 'destacado' ? 'active' : ''}`}
                onClick={() => handleOrdenClick('destacado')}
              >
                Todos
              </button>
              <button 
                className={`filter-btn ${ordenActivo === 'mayor-descuento' ? 'active' : ''}`}
                onClick={() => handleOrdenClick('mayor-descuento')}
              >
                Mayor Descuento
              </button>
              <button 
                className={`filter-btn ${ordenActivo === 'menor-precio' ? 'active' : ''}`}
                onClick={() => handleOrdenClick('menor-precio')}
              >
                Menor Precio
              </button>
              <button 
                className={`filter-btn ${ordenActivo === 'mas-vendidos' ? 'active' : ''}`}
                onClick={() => handleOrdenClick('mas-vendidos')}
              >
                Más Vendidos
              </button>
            </div>
          </div>

          {loading ? (
            <div className="promos-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Cargando promociones...</p>
            </div>
          ) : error && promociones.length === 0 ? (
            <div className="promos-empty show">
              <i className="fas fa-box-open promos-empty__icon"></i>
              <h3 className="promos-empty__title">No hay promociones disponibles</h3>
              <p className="promos-empty__text">Selecciona otra categoría o vuelve pronto para ver nuevas ofertas.</p>
            </div>
          ) : (
            <div className="promos-grid">
              {promociones.map((promo, index) => (
                <article 
                  key={promo.id} 
                  className="promo-pack"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="promo-pack__badge">-{Number(promo.porcentaje_descuento).toFixed(0)}%</span>
                  
                  <div className="promo-pack__image">
                    <div className="promo-pack__products">
                      {promo.promocion_productos?.slice(0, 3).map((pp, i) => (
                        <div key={pp.producto.id_producto} className="promo-pack__product-icon" title={pp.producto.descripcion}>
                          {pp.producto.imagen_url ? (
                            <img 
                              src={getImagenProductoUrl(pp.producto.imagen_url)} 
                              alt={pp.producto.descripcion}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <i className={`${getBottleIcon(pp.producto.volumen || 750)} ${pp.producto.imagen_url ? 'hidden' : ''}`}></i>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="promo-pack__body">
                    <span className="promo-pack__occasion">
                      <i className={getIcono(promo.categoria_promocion.nombre)}></i> {promo.categoria_promocion.nombre}
                    </span>
                    <h3 className="promo-pack__title">{promo.nombre}</h3>
                    <p className="promo-pack__desc">{promo.descripcion || promo.descripcion_corta}</p>
                    
                    <div className="promo-pack__includes">
                      <p className="promo-pack__includes-title">Incluye:</p>
                      <ul className="promo-pack__includes-list">
                        {promo.promocion_productos?.map((pp, i) => (
                          <li key={pp.producto.id_producto} title={pp.producto.descripcion}>
                            <i className="fas fa-check"></i>
                            {pp.cantidad > 1 ? `${pp.cantidad} ` : ''}{pp.producto.descripcion}
                            {pp.producto.origen && <span className="origen-flag">{getBandera(pp.producto.origen)}</span>}
                            {pp.es_regalo && <span className="regalo-tag">🎁 Regalo</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="promo-pack__footer">
                      <div className="promo-pack__prices">
                        <span className="promo-pack__price-old">${Number(promo.precio_original).toFixed(2)}</span>
                        <span className="promo-pack__price-new">${Number(promo.precio_promocional).toFixed(2)}</span>
                      </div>
                      <button 
                        className={`promo-pack__btn ${agregandoId === promo.id ? 'added' : ''}`}
                        onClick={() => handleAgregarCarrito(promo)}
                        disabled={agregandoId === promo.id || promo.stock_disponible <= 0}
                      >
                        {agregandoId === promo.id ? (
                          <>
                            <i className="fas fa-check"></i> ¡Agregado!
                          </>
                        ) : promo.stock_disponible <= 0 ? (
                          <>
                            <i className="fas fa-times"></i> Agotado
                          </>
                        ) : (
                          <>
                            <i className="fas fa-cart-plus"></i> Agregar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default PromocionesPage;
