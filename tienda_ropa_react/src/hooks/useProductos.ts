import { useCallback, useEffect, useState } from 'react';
import ProductoService, {
  obtenerCacheProductos,
  Producto
} from '../services/producto.service';

interface UseProductosState {
  productos: Producto[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const useProductos = (): UseProductosState => {
  const [productos, setProductos] = useState<Producto[]>(() =>
    obtenerCacheProductos()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductoService.listar();
      setProductos(data);
    } catch (err) {
      const parsedError =
        err instanceof Error
          ? err
          : new Error('Error desconocido al cargar productos');
      setError(parsedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarProductos();
  }, [cargarProductos]);

  return {
    productos,
    loading,
    error,
    recargar: cargarProductos
  };
};

export default useProductos;
