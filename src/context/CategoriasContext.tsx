import React, { createContext, useContext, useState, useEffect } from 'react';
import { categoriasService, Categoria } from '../services/categorias.service';

interface CategoriasContextType {
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export const CategoriasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriasService.listarCategorias();
      setCategorias(data);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al cargar categorías';
      setError(mensajeError);
      console.error('Error cargando categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const value: CategoriasContextType = {
    categorias,
    loading,
    error,
    recargar: cargarCategorias,
  };

  return (
    <CategoriasContext.Provider value={value}>
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = (): CategoriasContextType => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias debe ser usado dentro de CategoriasProvider');
  }
  return context;
};
