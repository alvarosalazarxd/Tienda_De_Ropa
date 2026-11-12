import { useCallback, useEffect, useState } from 'react';
import PedidoService, { Pedido } from '../services/pedido.service';

interface UsePedidosState {
  pedidos: Pedido[];
  loading: boolean;
  error: Error | null;
  recargar: () => Promise<void>;
}

export const usePedidos = (usuarioId?: number | null): UsePedidosState => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarPedidos = useCallback(async () => {
    if (usuarioId === null) {
      setPedidos([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data =
        usuarioId !== undefined
          ? await PedidoService.listarPorUsuario(usuarioId)
          : await PedidoService.listar();
      // Ordenamos del mas reciente al mas antiguo
      const ordenados = [...data].sort((a, b) => b.id - a.id);
      setPedidos(ordenados);
    } catch (err) {
      const parsedError =
        err instanceof Error
          ? err
          : new Error('Error desconocido al cargar pedidos');
      setError(parsedError);
    } finally {
      setLoading(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    void cargarPedidos();
  }, [cargarPedidos]);

  return {
    pedidos,
    loading,
    error,
    recargar: cargarPedidos
  };
};

export default usePedidos;
