import React, { createContext, useContext, useState, useEffect } from 'react';
import { ciudadesService, Ciudad } from '../services/ciudades.service';

interface CiudadesContextType {
  ciudades: Ciudad[];
  loading: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

const CiudadesContext = createContext<CiudadesContextType | undefined>(undefined);

export const CiudadesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarCiudades = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ciudadesService.listarCiudades();
      setCiudades(data);
    } catch (err: any) {
      const mensajeError = err.response?.data?.message || 'Error al cargar ciudades';
      setError(mensajeError);
      console.error('Error cargando ciudades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCiudades();
  }, []);

  const value: CiudadesContextType = {
    ciudades,
    loading,
    error,
    recargar: cargarCiudades,
  };

  return (
    <CiudadesContext.Provider value={value}>
      {children}
    </CiudadesContext.Provider>
  );
};

export const useCiudades = (): CiudadesContextType => {
  const context = useContext(CiudadesContext);
  if (!context) {
    throw new Error('useCiudades debe ser usado dentro de CiudadesProvider');
  }
  return context;
};
