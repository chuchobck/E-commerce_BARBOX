import React from 'react';
import { Categoria, Marca, FiltrosProducto, FiltrosDinamicos } from '../../types/catalogo.types';
import { getLogoMarcaUrl } from '../../config/api.config';
import './CatalogFilters.css';

interface CatalogFiltersProps {
  categorias: Categoria[];
  marcas: Marca[];
  filtros: FiltrosProducto;
  filtrosDinamicos: FiltrosDinamicos | null;
  onFiltrosChange: (nuevosFiltros: Partial<FiltrosProducto>) => void;
  onLimpiarFiltros: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  categorias,
  marcas,
  filtros,
  filtrosDinamicos,
  onFiltrosChange,
  onLimpiarFiltros,
  isOpen,
  onClose,
}) => {
  // Función auxiliar para obtener el ID de categoría de forma consistente
  // El backend puede devolver id_prod_categoria, id_categoria_producto o id_categoria
  const getCategoriaId = (cat: Categoria): number => {
    return cat.id_prod_categoria || cat.id_categoria_producto || cat.id_categoria || 0;
  };

  const handleCategoriaChange = (categoriaId: number | undefined) => {
    console.log('🔄 Cambiando categoría a:', categoriaId);
    onFiltrosChange({
      categoriaId: categoriaId,
      marcaId: undefined,
      busqueda: undefined
    });
  };

  const handleMarcaChange = (marcaId: number | undefined) => {
    onFiltrosChange({ 
      marcaId: marcaId,
      busqueda: undefined
    });
  };

  const handleCategoriaClick = (e: React.MouseEvent, categoriaId: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    // Evitar clics múltiples
    const target = e.currentTarget as HTMLElement;
    if (target.dataset.processing === 'true') return;
    target.dataset.processing = 'true';
    
    handleCategoriaChange(categoriaId);
    
    setTimeout(() => {
      target.dataset.processing = 'false';
    }, 300);
  };

  const handleMarcaClick = (e: React.MouseEvent, marcaId: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    handleMarcaChange(marcaId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEnStockChange = () => {
    onFiltrosChange({ enStock: !filtros.enStock });
  };

  const tieneFiltrosActivos = () => {
    return filtros.categoriaId || filtros.marcaId || filtros.precioMin ||
      filtros.precioMax || filtros.volumen || filtros.enStock;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="filters-overlay" onClick={onClose}></div>}

      <aside className={`catalog-filters ${isOpen ? 'open' : ''}`}>
        {/* Header Mobile */}
        <div className="filters-header-mobile">
          <h3>Filtros</h3>
          <button className="filters-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Botón limpiar filtros */}
        {tieneFiltrosActivos() && (
          <button className="filters-clear" onClick={onLimpiarFiltros}>
            <i className="fas fa-eraser"></i>
            Limpiar filtros
          </button>
        )}

        {/* CATEGORÍAS */}
        <div className="filter-section">
          <h4 className="filter-title">
            <i className="fas fa-wine-bottle"></i>
            Categorías
          </h4>
          <div className="filter-options">
            <div
              className={`filter-option ${!filtros.categoriaId ? 'active' : ''}`}
              onClick={(e) => handleCategoriaClick(e, undefined)}
             
              role="button"
              aria-pressed={!filtros.categoriaId}
              onKeyDown={(e) => e.key === 'Enter' && handleCategoriaChange(undefined)}
            >
              <span className="filter-radio"></span>
              <span>Todas las categorías</span>
            </div>
            {categorias.map((cat) => {
              const catId = getCategoriaId(cat);
              const isActive = filtros.categoriaId === catId;
              return (
                <div
                  key={catId}
                  className={`filter-option ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleCategoriaClick(e, catId)}
                 
                  role="button"
                  aria-pressed={isActive}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoriaChange(catId)}
                >
                  <span className="filter-radio"></span>
                  <span>{cat.nombre}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MARCAS (Solo si hay categoría seleccionada y marcas disponibles) */}
        {marcas.length > 0 && (
          <div className="filter-section">
            <h4 className="filter-title">
              <i className="fas fa-tag"></i>
              Marcas
              {filtros.categoriaId && (
                <span className="filter-badge">{marcas.length}</span>
              )}
            </h4>
            {filtros.categoriaId && (
              <p className="filter-info-text">
                <i className="fas fa-info-circle"></i>
                Mostrando marcas de la categoría seleccionada
              </p>
            )}
            <div className="filter-options filter-options--marcas">
              <div
                className={`filter-option ${!filtros.marcaId ? 'active' : ''}`}
                onClick={(e) => handleMarcaClick(e, undefined)}
               
                role="button"
                onKeyDown={(e) => e.key === 'Enter' && handleMarcaChange(undefined)}
              >
                <span>Todas las marcas</span>
              </div>
              {marcas.map((marca) => (
                <div
                  key={marca.id_marca}
                  className={`filter-option filter-option--marca ${filtros.marcaId === marca.id_marca ? 'active' : ''}`}
                  onClick={(e) => handleMarcaClick(e, marca.id_marca)}
                 
                  role="button"
                  onKeyDown={(e) => e.key === 'Enter' && handleMarcaChange(marca.id_marca)}
                >
                  {marca.imagen_url && (
                    <img
                      src={getLogoMarcaUrl(marca.imagen_url)}
                      alt={marca.nombre}
                      className="marca-logo"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{marca.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRECIO */}
        <div className="filter-section">
          <h4 className="filter-title">
            <i className="fas fa-dollar-sign"></i>
            Rango de Precio
          </h4>
          <div className="filter-price-range">
            <div className="price-input-group">
              <label><span className="currency-label">$</span> Desde</label>
              <input
                type="number"
                className="price-input-field"
                placeholder="0"
                value={filtros.precioMin || ''}
                onChange={(e) => {
                  const valor = e.target.value ? parseFloat(e.target.value) : undefined;
                  // Validar que no sea 0 o negativo
                  if (valor && valor > 0) {
                    onFiltrosChange({ precioMin: valor });
                  } else if (!e.target.value) {
                    onFiltrosChange({ precioMin: undefined });
                  }
                }}
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="price-divider">—</div>
            <div className="price-input-group">
              <label><span className="currency-label">$</span> Hasta</label>
              <input
                type="number"
                className={`price-input-field ${filtros.precioMin && filtros.precioMax && filtros.precioMax < filtros.precioMin ? 'price-error' : ''}`}
                placeholder="Sin límite"
                value={filtros.precioMax || ''}
                onChange={(e) => {
                  const valor = e.target.value ? parseFloat(e.target.value) : undefined;
                  // Validar que no sea 0 o negativo
                  if (valor && valor > 0) {
                    onFiltrosChange({ precioMax: valor });
                  } else if (!e.target.value) {
                    onFiltrosChange({ precioMax: undefined });
                  }
                }}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
          {filtros.precioMin && filtros.precioMax && filtros.precioMax < filtros.precioMin && (
            <div className="price-error-message">
              <i className="fas fa-exclamation-circle"></i>
              <span>El precio máximo debe ser mayor al mínimo</span>
            </div>
          )}
          {(filtros.precioMin || filtros.precioMax) && !(filtros.precioMin && filtros.precioMax && filtros.precioMax < filtros.precioMin) && (
            <div className="price-active-filter">
              <i className="fas fa-check-circle"></i>
              <span>
                {filtros.precioMin && filtros.precioMax 
                  ? `$${filtros.precioMin} - $${filtros.precioMax}`
                  : filtros.precioMin 
                  ? `Desde $${filtros.precioMin}`
                  : `Hasta $${filtros.precioMax}`
                }
              </span>
            </div>
          )}
        </div>

        {/* Aplicar filtros (Mobile) */}
        <div className="filters-apply-mobile">
          <button className="btn-aplicar" onClick={onClose}>
            Ver resultados
          </button>
        </div>
      </aside>
    </>
  );
};

export default CatalogFilters;

