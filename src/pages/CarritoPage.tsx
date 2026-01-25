import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ConfirmModal from '../components/Common/ConfirmModal';
import { useToast } from '../components/Common/Toast';
import { useCarrito } from '../context/CarritoContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useAuth } from '../context/AuthContext';
import catalogoService from '../services/catalogo.service';
import { getImagenProductoUrl, PLACEHOLDER_PRODUCTO } from '../config/api.config';
import { Producto } from '../types/catalogo.types';
import './CarritoPage.css';

const CarritoPage: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAuthenticated, user } = useAuth();
  const { 
    items, 
    totalItems, 
    totalPrecio, 
    carritoId,
    actualizarCantidad, 
    removerDelCarrito, 
    limpiarCarrito,
    agregarAlCarrito 
  } = useCarrito();
  
  const { toggleFavorito, esFavorito } = useFavoritos();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toast = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreatingPedido, setIsCreatingPedido] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuento, setDescuento] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState<{texto: string, tipo: 'success' | 'error' | 'info'} | null>(null);
  const [productosRecomendados, setProductosRecomendados] = useState<Producto[]>([]);

  // Estados para modales de confirmación
  const [modalVaciar, setModalVaciar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState<{show: boolean, id: string, nombre: string}>({ show: false, id: '', nombre: '' });

  // ✅ Ref para evitar navegaciones múltiples
  const navegacionRealizadaRef = useRef(false);

  // ✅ Detectar intención de checkout después del login
  useEffect(() => {
    const intentoCheckout = localStorage.getItem('intentoCheckout');
    
    if (
      intentoCheckout === 'true' && 
      isAuthenticated && 
      carritoId && 
      items.length > 0 &&
      !navegacionRealizadaRef.current
    ) {
      console.log('✅ Usuario autenticado, redirigiendo al checkout...');
      navegacionRealizadaRef.current = true;
      
      // Limpiar flag
      localStorage.removeItem('intentoCheckout');
      
      // Guardar datos del carrito para checkout
      const carritoData = {
        id_carrito: carritoId,
        items: items,
        total: totalPrecio,
        fecha: new Date().toISOString(),
      };
      localStorage.setItem('carritoCheckout', JSON.stringify(carritoData));
      
      mostrarNotificacion('Redirigiendo al checkout...', 'success');
      
      // Navegación inmediata
      navigate('/checkout', { replace: true });
    }
  }, [isAuthenticated, carritoId, items, totalPrecio, navigate]);

  // Cargar productos recomendados
  useEffect(() => {
    const cargarRecomendados = async () => {
      try {
        const response = await catalogoService.getProductos({ limite: 4, ordenarPor: 'popular' });
        // ✅ El servicio ya normaliza la respuesta
        const productos = response?.productos || [];
        // Filtrar productos que ya están en el carrito
        const productosEnCarrito = items.map(item => item.producto.id_producto);
        const filtrados = productos.filter(p => !productosEnCarrito.includes(p.id_producto));
        setProductosRecomendados(filtrados.slice(0, 4));
      } catch (error) {
        console.error('Error cargando recomendados:', error);
        setProductosRecomendados(getProductosFallback());
      }
    };
    cargarRecomendados();
  }, [items]);

  // Productos fallback
  const getProductosFallback = (): Producto[] => [
    {
      id_producto: 'rec-1',
      nombre: 'Heineken Pack x6',
      precio_venta: 8.99,
      precio_regular: 10.99,
      imagen_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=250&fit=crop&q=80',
      categoria: { id_categoria: 1, nombre: 'Cervezas' },
      marca: { id_marca: 1, nombre: 'Heineken' },
      stock: 50,
      descripcion: 'Pack de 6 cervezas Heineken',
      volumen_ml: 330,
      porcentaje_alcohol: 5.0,
      activo: true
    },
    {
      id_producto: 'rec-2',
      nombre: 'Santa Rita 120 Merlot',
      precio_venta: 9.99,
      precio_regular: 12.99,
      imagen_url: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=200&h=250&fit=crop&q=80',
      categoria: { id_categoria: 2, nombre: 'Vinos' },
      marca: { id_marca: 2, nombre: 'Santa Rita' },
      stock: 30,
      descripcion: 'Vino tinto Merlot',
      volumen_ml: 750,
      porcentaje_alcohol: 13.5,
      activo: true
    },
    {
      id_producto: 'rec-3',
      nombre: 'Ron Manabí 3 Años',
      precio_venta: 15.50,
      imagen_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=250&fit=crop&q=80',
      categoria: { id_categoria: 4, nombre: 'Ron' },
      marca: { id_marca: 3, nombre: 'Ron Manabí' },
      stock: 25,
      descripcion: 'Ron añejado 3 años',
      volumen_ml: 750,
      porcentaje_alcohol: 40,
      activo: true
    },
    {
      id_producto: 'rec-4',
      nombre: 'Bacardi Carta Blanca',
      precio_venta: 18.99,
      imagen_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=250&fit=crop&q=80',
      categoria: { id_categoria: 4, nombre: 'Ron' },
      marca: { id_marca: 4, nombre: 'Bacardi' },
      stock: 40,
      descripcion: 'Ron blanco premium',
      volumen_ml: 750,
      porcentaje_alcohol: 37.5,
      activo: true
    }
  ];

  // Mostrar notificación
  const mostrarNotificacion = (texto: string, tipo: 'success' | 'error' | 'info') => {
    setMensajeNotificacion({ texto, tipo });
    setTimeout(() => setMensajeNotificacion(null), 3000);
  };

  // Manejar cambio de cantidad - Validación: no menor a 1, no mayor que stock
  const handleCantidadChange = (idProducto: string, nuevaCantidad: number) => {
    // ✅ No permitir cantidades menores a 1
    if (nuevaCantidad < 1) {
      handleEliminar(idProducto);
      return;
    }
    
    // ✅ Validar contra el stock disponible
    const item = items.find(i => i.producto.id_producto === idProducto);
    const stockDisponible = item?.producto.stock || item?.producto.saldo_actual || 99;
    
    if (nuevaCantidad > stockDisponible) {
      mostrarNotificacion(`Stock disponible: ${stockDisponible} unidades`, 'error');
      return;
    }
    
    // Límite máximo general
    if (nuevaCantidad > 99) {
      mostrarNotificacion('Cantidad máxima: 99 unidades', 'info');
      return;
    }
    
    actualizarCantidad(idProducto, nuevaCantidad);
    mostrarNotificacion('Cantidad actualizada', 'success');
  };

  // Manejar eliminación - Heurística #3: Control y libertad del usuario
  const handleEliminar = (idProducto: string) => {
    const producto = items.find(item => item.producto.id_producto === idProducto);
    if (producto) {
      setModalEliminar({
        show: true,
        id: idProducto,
        nombre: producto.producto.nombre || 'este producto'
      });
    }
  };

  // Confirmar eliminación
  const confirmarEliminar = () => {
    removerDelCarrito(modalEliminar.id);
    // toast.info(`"${nombreProducto}" eliminado del carrito`);
    mostrarNotificacion('Producto eliminado del carrito', 'info');
    setModalEliminar({ show: false, id: '', nombre: '' });
  };

  // Vaciar carrito - Heurística #5: Prevención de errores
  const handleVaciarCarrito = () => {
    setModalVaciar(true);
  };

  // Confirmar vaciar carrito
  const confirmarVaciarCarrito = () => {
    limpiarCarrito();
    setModalVaciar(false);
    // toast.success(`Se eliminaron ${cantidadProductos} productos del carrito`, 5000);
    mostrarNotificacion('Carrito vaciado correctamente', 'info');
  };

  // Aplicar cupón
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAplicarCupon = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cupones: Record<string, number> = {
      'DESCUENTO10': 0.10,
      'VERANO15': 0.15,
      'PRIMERACOMPRA': 0.20,
      'BARBOX20': 0.20
    };

    const codigo = codigoCupon.trim().toUpperCase();
    
    if (cupones[codigo]) {
      setDescuento(cupones[codigo]);
      setCuponAplicado(true);
      // toast.success(`¡Cupón aplicado! ${cupones[codigo] * 100}% de descuento`);
      mostrarNotificacion(`¡Cupón aplicado! ${cupones[codigo] * 100}% de descuento`, 'success');
    } else {
      // toast.error('El cupón ingresado no es válido o ha expirado');
      mostrarNotificacion('Cupón inválido', 'error');
    }
  };

  // Agregar producto recomendado
  const handleAgregarRecomendado = (producto: Producto) => {
    agregarAlCarrito(producto);
    // toast.success(`¡${producto.nombre} agregado al carrito!`);
    mostrarNotificacion(`¡${producto.nombre} agregado al carrito!`, 'success');
  };

  // Calcular totales
  const subtotal = totalPrecio;
  const descuentoTotal = subtotal * descuento;
  const total = subtotal - descuentoTotal;

  // Obtener icono de categoría
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCategoryIcon = (categoria?: string): string => {
    const iconMap: Record<string, string> = {
      'Vino': 'fa-wine-glass-alt',
      'Ron': 'fa-cocktail',
      'Vodka': 'fa-glass-martini-alt',
      'Whisky': 'fa-glass-whiskey',
      'Cerveza': 'fa-beer',
      'Cocteles': 'fa-blender',
    };
    return iconMap[categoria || ''] || 'fa-wine-bottle';
  };

  return (
    <>
      <Header />
      
      <main className="cart-page">
        {/* Notificación */}
        {mensajeNotificacion && (
          <div className={`cart-notification cart-notification--${mensajeNotificacion.tipo}`}>
            <i className={`fas fa-${
              mensajeNotificacion.tipo === 'success' ? 'check-circle' : 
              mensajeNotificacion.tipo === 'error' ? 'exclamation-circle' : 'info-circle'
            }`}></i>
            <span>{mensajeNotificacion.texto}</span>
            <button onClick={() => setMensajeNotificacion(null)} aria-label="Cerrar notificación">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Cart Content */}
        <section className="cart-content">
          <div className="container">
            {items.length === 0 ? (
              /* Carrito Vacío */
              <div className="cart-empty">
                <div className="cart-empty__icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h2>Tu carrito está vacío</h2>
                <p>¡Agrega productos para comenzar tu compra!</p>
                <Link to="/catalogo" className="btn btn--primary btn--lg">
                  <i className="fas fa-shopping-bag"></i>
                  Ir al Catálogo
                </Link>
              </div>
            ) : (
              <div className="cart-layout">
                {/* Left: Resumen del pedido (items) */}
                <div className="cart-items">
                  <div className="cart-items__header">
                    <h2>Resumen del Pedido</h2>
                    <button className="btn-text" onClick={handleVaciarCarrito}>
                      <i className="fas fa-trash"></i>
                      Vaciar carrito
                    </button>
                  </div>

                  {items.map((item) => {
                    const tieneDescuento = item.producto.precio_regular && 
                      item.producto.precio_regular > item.producto.precio_venta;
                    
                    return (
                      <article key={item.producto.id_producto} className="cart-item">
                        <div className="cart-item__image">
                          {tieneDescuento && (
                            <span className="item-badge item-badge--promo">
                              -{Math.round((1 - Number(item.producto.precio_venta) / Number(item.producto.precio_regular)) * 100)}%
                            </span>
                          )}
                          <img 
                            src={getImagenProductoUrl(item.producto.imagen_url)}
                            alt={item.producto.nombre}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = PLACEHOLDER_PRODUCTO;
                            }}
                          />
                        </div>
                        
                        <div className="cart-item__details">
                          <h3 className="cart-item__name">{item.producto.nombre}</h3>
                          <p className="cart-item__category">
                            {item.producto.descripcion || item.producto.nombre}
                          </p>
                          {item.producto.volumen_ml && (
                            <p className="cart-item__specs">
                              {item.producto.volumen_ml}ml 
                              {item.producto.porcentaje_alcohol && ` • ${item.producto.porcentaje_alcohol}% Vol`}
                            </p>
                          )}
                          <div className="cart-item__actions-mobile">
                            <button
                              className={`btn-icon ${esFavorito(item.producto.id_producto) ? 'btn-icon--active' : ''}`}
                              onClick={() => toggleFavorito(item.producto.id_producto)}
                              aria-label="Agregar a favoritos"
                            >
                              <i className={`${esFavorito(item.producto.id_producto) ? 'fas' : 'far'} fa-heart`}></i>
                            </button>
                            <button 
                              className="btn-icon btn-icon--danger" 
                              onClick={() => handleEliminar(item.producto.id_producto)}
                              aria-label="Eliminar producto"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="cart-item__quantity">
                          <label className="sr-only">Cantidad</label>
                          <button 
                            className="qty-btn"
                            onClick={() => handleCantidadChange(item.producto.id_producto, item.cantidad - 1)}
                            aria-label="Disminuir cantidad"
                            tabIndex={0}
                          >
                            <i className="fas fa-minus"></i>
                          </button>
                          <input 
                            type="number" 
                            className="qty-input" 
                            value={item.cantidad}
                            onChange={(e) => handleCantidadChange(item.producto.id_producto, parseInt(e.target.value) || 1)}
                            min="1" 
                            max="99"
                            aria-label="Cantidad"
                            tabIndex={0}
                          />
                          <button 
                            className="qty-btn"
                            onClick={() => handleCantidadChange(item.producto.id_producto, item.cantidad + 1)}
                            aria-label="Aumentar cantidad"
                            tabIndex={0}
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                        
                        <div className="cart-item__price">
                          <span className="price-label">Precio unitario:</span>
                          {tieneDescuento && (
                            <span className="price-old">${Number(item.producto.precio_regular).toFixed(2)}</span>
                          )}
                          <span className="price-amount">${Number(item.producto.precio_venta).toFixed(2)}</span>
                        </div>
                        
                        <div className="cart-item__subtotal">
                          <span className="subtotal-label">Subtotal:</span>
                          <span className="subtotal-amount">
                            ${(Number(item.producto.precio_venta) * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="cart-item__remove">
                          <button 
                            className="btn-remove"
                            onClick={() => handleEliminar(item.producto.id_producto)}
                            aria-label="Eliminar producto"
                            tabIndex={0}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {/* Continue Shopping */}
                  <div className="cart-actions">
                    <Link 
                      to={localStorage.getItem('origenCarrito') || '/catalogo'} 
                      className="btn btn--outline"
                      onClick={() => localStorage.removeItem('origenCarrito')}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Seguir Comprando
                    </Link>
                  </div>
                </div>

                {/* Cart Summary */}
                <aside className="cart-summary">
                  <h2 className="summary-title">Resumen del Pedido</h2>
                  
                  <div className="summary-section">
                    <div className="summary-row">
                      <span>Subtotal ({totalItems} productos):</span>
                      <span className="summary-value">${subtotal.toFixed(2)}</span>
                    </div>
                    {descuento > 0 && (
                      <div className="summary-row">
                        <span>Descuento ({descuento * 100}%):</span>
                        <span className="summary-value summary-value--discount">-${descuentoTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="summary-divider"></div>
                    <div className="summary-row summary-row--total">
                      <span>Total:</span>
                      <span className="summary-total">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="trust-badges">
                    <div className="trust-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>Compra Segura</span>
                    </div>
                    <div className="trust-item">
                      <i className="fas fa-store"></i>
                      <span>Retiro en Tienda</span>
                    </div>
                    <div className="trust-item">
                      <i className="fas fa-headset"></i>
                      <span>Soporte 24/7</span>
                    </div>
                  </div>

                  {/* Accepted Payments */}
                  <div className="payment-methods-mini">
                    <p className="payment-label">Métodos de pago aceptados:</p>
                    <div className="payment-icons">
                      <div className="payment-icon-item" title="PayPal">
                        <i className="fab fa-paypal"></i>
                        <span>PayPal</span>
                      </div>
                      <div className="payment-icon-item" title="Tarjeta de Crédito/Débito">
                        <i className="fas fa-credit-card"></i>
                        <span>Tarjeta</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button - Ir directo al checkout */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      
                      console.log('🛒 Click en Proceder al Pago');
                      console.log('🔐 isAuthenticated:', isAuthenticated);
                      console.log('📦 carritoId:', carritoId);
                      console.log('📋 items.length:', items.length);
                      
                      if (!isAuthenticated) {
                        console.log('❌ Usuario no autenticado, redirigiendo al login...');
                        mostrarNotificacion('Debes iniciar sesión para continuar', 'info');
                        localStorage.setItem('intentoCheckout', 'true');
                        navigate('/login', { state: { from: '/carrito' } });
                        return;
                      }

                      if (!carritoId || items.length === 0) {
                        mostrarNotificacion('Error: El carrito está vacío', 'error');
                        return;
                      }

                      console.log('✅ Todo OK, navegando al checkout...');
                      
                      // Guardar datos del carrito para checkout
                      const carritoData = {
                        id_carrito: carritoId,
                        items: items,
                        total: totalPrecio,
                        fecha: new Date().toISOString(),
                      };
                      localStorage.setItem('carritoCheckout', JSON.stringify(carritoData));
                      
                      // Navegar inmediatamente
                      navigate('/checkout', { replace: true });
                    }}
                    className="btn btn--primary btn--block btn--lg checkout-btn"
                    disabled={items.length === 0}
                  >
                    <span className="checkout-btn-text">
                      <><i className="fas fa-shopping-bag"></i> Proceder al Pago</>
                    </span>
                    <span className="checkout-btn-price">${total.toFixed(2)}</span>
                  </button>
                  
                  <p className="checkout-note">
                    <i className="fas fa-lock"></i>
                    Compra 100% segura • Datos encriptados
                  </p>
                </aside>
              </div>
            )}
          </div>
        </section>

        {/* Recommended Products */}
        {items.length > 0 && productosRecomendados.length > 0 && (
          <section className="recommended-products">
            <div className="container">
              <h2 className="section-title">
                <i className="fas fa-star"></i>
                También te Puede Interesar
              </h2>
              <div className="products-slider">
                {productosRecomendados.map((producto) => {
                  const tieneDescuento = producto.precio_regular && 
                    producto.precio_regular > producto.precio_venta;
                  
                  return (
                    <article key={producto.id_producto} className="product-card-mini">
                      <div className="product-card-mini__image">
                        {tieneDescuento && (
                          <span className="item-badge">OFERTA</span>
                        )}
                        <img 
                          src={getImagenProductoUrl(producto.imagen_url)}
                          alt={producto.nombre}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_PRODUCTO;
                          }}
                        />
                      </div>
                      <div className="product-card-mini__content">
                        <h3 className="product-card-mini__title">{producto.nombre}</h3>
                        <p className="product-card-mini__category">
                          <i className="fas fa-tag"></i> {producto.categoria?.nombre || producto.nombre}
                        </p>
                        <div className="product-card-mini__price">
                          {tieneDescuento && (
                            <span className="price-original">${Number(producto.precio_regular).toFixed(2)}</span>
                          )}
                          <span className="price-current">${Number(producto.precio_venta).toFixed(2)}</span>
                        </div>
                        <button 
                          className="btn btn--primary btn--block btn--sm"
                          onClick={() => handleAgregarRecomendado(producto)}
                        >
                          <i className="fas fa-cart-plus"></i> Agregar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </main>

      <Footer />

      {/* Modal Confirmar Vaciar Carrito - Heurística #3, #5 */}
      <ConfirmModal
        isOpen={modalVaciar}
        onClose={() => setModalVaciar(false)}
        onConfirm={confirmarVaciarCarrito}
        type="danger"
        title="¿Vaciar todo el carrito?"
        message={`Se eliminarán ${totalItems} producto${totalItems > 1 ? 's' : ''} de tu carrito. Esta acción no se puede deshacer.`}
        confirmText="Sí, vaciar carrito"
        cancelText="Cancelar"
        itemsToDelete={items.map(item => `${item.producto.nombre} (${item.cantidad} unid.)`)}
        icon="fa-trash-alt"
      />

      {/* Modal Confirmar Eliminar Producto - Heurística #3, #5 */}
      <ConfirmModal
        isOpen={modalEliminar.show}
        onClose={() => setModalEliminar({ show: false, id: '', nombre: '' })}
        onConfirm={confirmarEliminar}
        type="warning"
        title="¿Eliminar producto?"
        message={`¿Estás seguro de eliminar "${modalEliminar.nombre}" de tu carrito?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        icon="fa-times-circle"
        secondaryAction={{
          text: 'Mover a favoritos',
          onClick: () => {
            const producto = items.find(i => i.producto.id_producto === modalEliminar.id);
            if (producto) {
              toggleFavorito(producto.producto.id_producto);
              removerDelCarrito(modalEliminar.id);
              mostrarNotificacion('Producto movido a favoritos', 'success');
            }
            setModalEliminar({ show: false, id: '', nombre: '' });
          }
        }}
      />
    </>
  );
};

export default CarritoPage;
