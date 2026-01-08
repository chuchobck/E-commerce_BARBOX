import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Producto } from '../../types/catalogo.types';
import { useCarrito } from '../../context/CarritoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { getImagenProductoUrl, PLACEHOLDER_PRODUCTO } from '../../config/api.config';
import './ProductCard.css';

interface ProductCardProps {
  producto: Producto;
  onVerDetalle: (producto: Producto) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ producto, onVerDetalle }) => {
  const [cantidad, setCantidad] = useState(1);
  const [animandoCarrito, setAnimandoCarrito] = useState(false);
  const navigate = useNavigate();
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { toggleFavorito, esFavorito } = useFavoritos();

  const enFavoritos = esFavorito(producto.id_producto);
  const enCarrito = estaEnCarrito(producto.id_producto);
  const tieneDescuento = producto.precio_regular && Number(producto.precio_regular) > Number(producto.precio_venta);
  const descuentoPorcentaje = tieneDescuento 
    ? Math.round(((Number(producto.precio_regular) - Number(producto.precio_venta)) / Number(producto.precio_regular)) * 100)
    : 0;
  const enStock = (producto.saldo_actual || 0) > 0;

  const handleAgregarCarrito = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (enStock) {
      // Activar animación
      setAnimandoCarrito(true);
      
      await agregarAlCarrito(producto, cantidad);
      
      // Guardar página de origen para botón "Seguir Comprando"
      localStorage.setItem('origenCarrito', '/catalogo');
      
      // Esperar un poco para mostrar la animación antes de navegar
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/carrito');
      }, 600);
    }
  };

  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorito(producto.id_producto);
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(precio);
  };

  // Construir URL de imagen desde el backend
  const imagenUrl = getImagenProductoUrl(producto.imagen_url);

  return (
    <article 
      className={`product-card ${!enStock ? 'product-card--sin-stock' : ''}`}
      aria-label={`Producto: ${producto.descripcion}. Precio: ${formatearPrecio(Number(producto.precio_venta))}${!enStock ? '. Agotado' : ''}`}
    >
      {/* Badges */}
      <div className="product-card__badges" aria-hidden="true">
        {tieneDescuento && (
          <span className="product-badge product-badge--descuento">
            -{descuentoPorcentaje}%
          </span>
        )}
        {!enStock && (
          <span className="product-badge product-badge--agotado">
            Agotado
          </span>
        )}
      </div>

      {/* Favorito Button */}
      <button 
        className={`product-card__favorito ${enFavoritos ? 'active' : ''}`}
        onClick={handleToggleFavorito}
        aria-label={enFavoritos ? `Quitar ${producto.descripcion} de favoritos` : `Agregar ${producto.descripcion} a favoritos`}
        aria-pressed={enFavoritos}
        type="button"
      >
        <i className={`fa${enFavoritos ? 's' : 'r'} fa-heart`} aria-hidden="true"></i>
      </button>

      {/* Imagen con overlay - Botón accesible */}
      <div className="product-card__image">
        <button
          className="product-card__image-btn"
          onClick={() => onVerDetalle(producto)}
          aria-label={`Ver detalles de ${producto.descripcion}`}
          type="button"
        >
          <img 
            src={imagenUrl} 
            alt={`${producto.descripcion}${producto.marca ? ` - ${producto.marca.nombre}` : ''}${producto.volumen ? ` - ${producto.volumen}ml` : ''}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_PRODUCTO;
            }}
          />
        </button>
        
        {/* Hover Overlay */}
        <div className="product-card__overlay" aria-hidden="true">
          <button 
            className="product-card__ver-detalle"
            onClick={() => onVerDetalle(producto)}
            tabIndex={-1}
            type="button"
          >
            <i className="fas fa-eye" aria-hidden="true"></i>
            <span>Ver Detalle</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="product-card__info">
        {/* Marca */}
        {producto.marca && (
          <span className="product-card__marca">{producto.marca.nombre}</span>
        )}

        {/* Nombre - Botón accesible en lugar de h3 clickeable */}
        <h3 className="product-card__nombre">
          <button
            className="product-card__nombre-btn"
            onClick={() => onVerDetalle(producto)}
            type="button"
          >
            {producto.descripcion}
          </button>
        </h3>

        {/* Precios */}
        <div className="product-card__precios">
          {tieneDescuento && (
            <span className="product-card__precio-regular" aria-label={`Precio original: ${formatearPrecio(Number(producto.precio_regular))}`}>
              <span className="sr-only">Precio original: </span>
              <s>{formatearPrecio(Number(producto.precio_regular))}</s>
            </span>
          )}
          <span className="product-card__precio-venta" aria-label={`Precio actual: ${formatearPrecio(Number(producto.precio_venta))}`}>
            <span className="sr-only">Precio: </span>
            {formatearPrecio(Number(producto.precio_venta))}
          </span>
          {tieneDescuento && (
            <span className="sr-only">Descuento del {descuentoPorcentaje} por ciento</span>
          )}
        </div>

        {/* Stock indicator */}
        {enStock && producto.saldo_actual && producto.saldo_actual <= 5 && (
          <p className="product-card__stock-bajo" role="alert" aria-live="polite">
            <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
            ¡Últimas {producto.saldo_actual} unidades!
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="product-card__acciones">
        {enStock ? (
          <>
            <div className="product-card__cantidad" role="group" aria-label={`Cantidad para ${producto.descripcion}`}>
              <button 
                onClick={(e) => { e.stopPropagation(); setCantidad(Math.max(1, cantidad - 1)); }}
                disabled={cantidad <= 1}
                aria-label="Reducir cantidad"
                type="button"
              >
                <i className="fas fa-minus" aria-hidden="true"></i>
              </button>
              <span aria-live="polite" aria-atomic="true">
                <span className="sr-only">Cantidad seleccionada:</span> {cantidad}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setCantidad(Math.min(producto.saldo_actual || 10, cantidad + 1)); }}
                disabled={cantidad >= (producto.saldo_actual || 10)}
                aria-label="Aumentar cantidad"
                type="button"
              >
                <i className="fas fa-plus" aria-hidden="true"></i>
              </button>
            </div>
            <button 
              className={`product-card__agregar ${enCarrito ? 'en-carrito' : ''} ${animandoCarrito ? 'animando-carrito' : ''}`}
              onClick={handleAgregarCarrito}
              aria-label={enCarrito ? `${producto.descripcion} ya está en el carrito` : `Agregar ${cantidad} ${cantidad > 1 ? 'unidades' : 'unidad'} de ${producto.descripcion} al carrito`}
              aria-pressed={enCarrito}
              type="button"
            >
              <i className={`fas fa-${enCarrito ? 'check' : 'cart-plus'} ${animandoCarrito ? 'icon-volando' : ''}`} aria-hidden="true"></i>
              <span>{enCarrito ? 'En Carrito' : 'Agregar'}</span>
            </button>
          </>
        ) : (
          <button 
            className="product-card__notificar" 
            onClick={(e) => e.stopPropagation()}
            aria-label={`Notificarme cuando ${producto.descripcion} esté disponible`}
            type="button"
          >
            <i className="fas fa-bell" aria-hidden="true"></i>
            <span>Notificarme</span>
          </button>
        )}
      </div>
    </article>
  );
};

export default ProductCard;
