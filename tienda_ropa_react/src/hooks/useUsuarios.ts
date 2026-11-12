import { useCallback, useEffect, useState } from 'react';
import UsuarioService, { Usuario } from '../services/usuario.service';

interface UseUsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const useUsuarios = (): UseUsuariosState => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await UsuarioService.listar();
      setUsuarios(data);
    } catch (err) {
      const parsedError =
        err instanceof Error
          ? err
          : new Error('Error desconocido al cargar usuarios');
      setError(parsedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    error,
    recargar: cargarUsuarios
  };
};

export default useUsuarios;
