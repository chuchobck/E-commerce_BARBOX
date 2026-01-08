import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Producto } from '../../types/catalogo.types';
import './ProductDetailModal.css';
import { useCarrito } from '../../context/CarritoContext';
import { useFavoritos } from '../../context/FavoritosContext';
import { getImagenProductoUrl, PLACEHOLDER_PRODUCTO } from '../../config/api.config';

interface ProductDetailModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ producto, isOpen, onClose }) => {
  const [cantidad, setCantidad] = React.useState(1);
  const navigate = useNavigate();
  const { agregarAlCarrito, estaEnCarrito } = useCarrito();
  const { toggleFavorito, esFavorito } = useFavoritos();

  if (!isOpen || !producto) return null;

  const enFavoritos = esFavorito(producto.id_producto);
  const enCarrito = estaEnCarrito(producto.id_producto);
  const tieneDescuento = producto.precio_regular && Number(producto.precio_regular) > Number(producto.precio_venta);
  const descuentoPorcentaje = tieneDescuento 
    ? Math.round(((Number(producto.precio_regular) - Number(producto.precio_venta)) / Number(producto.precio_regular)) * 100)
    : 0;
  const enStock = (producto.saldo_actual || 0) > 0;

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(precio);
  };

  const handleAgregarCarrito = async () => {
    if (enStock) {
      await agregarAlCarrito(producto, cantidad);
      // Guardar página de origen para botón "Seguir Comprando"
      localStorage.setItem('origenCarrito', '/catalogo');
      // Cerrar modal, scroll to top y navegar al carrito
      onClose();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigate('/carrito');
    }
  };

  const imagenUrl = getImagenProductoUrl(producto.imagen_url);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} tabIndex={0} aria-label="Cerrar modal">
          <i className="fas fa-times"></i>
        </button>

        <div className="product-modal__content">
          {/* Imagen */}
          <div className="product-modal__image">
            <img 
              src={imagenUrl} 
              alt={producto.descripcion}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_PRODUCTO;
              }}
            />
            {tieneDescuento && (
              <span className="product-modal__badge">-{descuentoPorcentaje}%</span>
            )}
          </div>

          {/* Info */}
          <div className="product-modal__info">
            {/* Marca */}
            {producto.marca && (
              <span className="product-modal__marca">{producto.marca.nombre}</span>
            )}

            {/* Nombre */}
            <h2 className="product-modal__nombre">{producto.descripcion}</h2>

            {/* Categoría */}
            {producto.categoria_producto && (
              <span className="product-modal__categoria">
                <i className="fas fa-tag"></i> {producto.categoria_producto.nombre}
              </span>
            )}

            {/* Notas de Cata */}
            {producto.notas_cata && (
              <div className="product-modal__notas">
                <h4><i className="fas fa-wine-glass"></i> Notas de Cata</h4>
                <p>{producto.notas_cata}</p>
              </div>
            )}

            {/* Precios */}
            <div className="product-modal__precios">
              {tieneDescuento && (
                <span className="product-modal__precio-regular">
                  {formatearPrecio(Number(producto.precio_regular))}
                </span>
              )}
              <span className="product-modal__precio-venta">
                {formatearPrecio(Number(producto.precio_venta))}
              </span>
              {tieneDescuento && (
                <span className="product-modal__ahorro">
                  Ahorras {formatearPrecio(Number(producto.precio_regular) - Number(producto.precio_venta))}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className={`product-modal__stock ${enStock ? 'en-stock' : 'sin-stock'}`}>
              <i className={`fas fa-${enStock ? 'check-circle' : 'times-circle'}`}></i>
              {enStock ? (
                <span>{producto.saldo_actual} unidades disponibles</span>
              ) : (
                <span>Producto agotado</span>
              )}
            </div>

            {/* Acciones */}
            <div className="product-modal__acciones">
              {enStock && (
                <div className="product-modal__cantidad">
                  <button 
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    disabled={cantidad <= 1}
                    tabIndex={0}
                    aria-label="Reducir cantidad"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span aria-live="polite">{cantidad}</span>
                  <button 
                    onClick={() => setCantidad(Math.min(producto.saldo_actual || 10, cantidad + 1))}
                    disabled={cantidad >= (producto.saldo_actual || 10)}
                    tabIndex={0}
                    aria-label="Aumentar cantidad"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              )}

              <button 
                className={`btn-agregar ${enCarrito ? 'en-carrito' : ''}`}
                onClick={handleAgregarCarrito}
                disabled={!enStock}
                tabIndex={0}
                aria-label={enCarrito ? 'Ya está en el carrito' : 'Agregar al carrito'}
              >
                <i className={`fas fa-${enCarrito ? 'check' : 'cart-plus'}`}></i>
                {enCarrito ? 'En el Carrito' : 'Agregar al Carrito'}
              </button>

              <button 
                className={`btn-favorito ${enFavoritos ? 'active' : ''}`}
                onClick={() => toggleFavorito(producto.id_producto)}
                tabIndex={0}
                aria-label={enFavoritos ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <i className={`fa${enFavoritos ? 's' : 'r'} fa-heart`}></i>
              </button>
            </div>

            {/* Info adicional */}
            <div className="product-modal__extras">
              <div className="extra-item">
                <i className="fas fa-shield-alt"></i>
                <span>Producto 100% original</span>
              </div>
              <div className="extra-item">
                <i className="fas fa-undo"></i>
                <span>Devolución sin costo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
