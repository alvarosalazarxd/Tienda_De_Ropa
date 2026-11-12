import { useCallback, useEffect, useState } from 'react';
import CarritoService, {
  Carrito,
  guardarTallaItemCarrito,
  obtenerUsuarioIdCarrito
} from '../services/carrito.service';

interface UseCarritoState {
  carrito: Carrito | null;
  loading: boolean;
  error: Error | null;
  totalUnidades: number;
  recargar: () => Promise<void>;
  agregarAlCarrito: (
    productoId: number,
    precioUnitario: number,
    cantidad: number,
    talla?: string
  ) => Promise<void>;
  cambiarCantidad: (itemId: number, nuevaCantidad: number) => Promise<void>;
  quitarItem: (itemId: number) => Promise<void>;
  vaciar: () => Promise<void>;
}

export const useCarrito = (): UseCarritoState => {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cargarCarrito = useCallback(async () => {
    const usuarioId = obtenerUsuarioIdCarrito();
    setLoading(true);
    setError(null);
    try {
      const data = await CarritoService.obtener(usuarioId);
      setCarrito(data);
    } catch (err) {
      const parsedError =
        err instanceof Error
          ? err
          : new Error('No se pudo conectar con el microservicio de carrito');
      setError(parsedError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarCarrito();

    const escucharCambios = () => {
      void cargarCarrito();
    };

    window.addEventListener('carritoActualizado', escucharCambios);
    window.addEventListener('sesionActualizada', escucharCambios);
    return () => {
      window.removeEventListener('carritoActualizado', escucharCambios);
      window.removeEventListener('sesionActualizada', escucharCambios);
    };
  }, [cargarCarrito]);

  const notificarActualizacion = (nuevoCarrito: Carrito) => {
    setCarrito(nuevoCarrito);
    window.dispatchEvent(new Event('carritoActualizado'));
  };

  const agregarAlCarrito = async (
    productoId: number,
    precioUnitario: number,
    cantidad: number,
    talla = 'Única'
  ) => {
    const usuarioId = obtenerUsuarioIdCarrito();
    setLoading(true);
    setError(null);
    try {
      const actual = await CarritoService.obtener(usuarioId);
      const itemExistente = actual.items.find(
        (item) => item.productoId === productoId
      );

      guardarTallaItemCarrito(usuarioId, productoId, talla);

      // Si el producto ya esta en el carrito, actualizamos su cantidad para no duplicar filas
      let respuesta: Carrito;
      if (itemExistente) {
        respuesta = await CarritoService.actualizarCantidad(
          usuarioId,
          itemExistente.id,
          itemExistente.cantidad + cantidad
        );
      } else {
        respuesta = await CarritoService.agregarItem(usuarioId, {
          productoId,
          cantidad,
          precioUnitario
        });
      }
      notificarActualizacion(respuesta);
    } finally {
      setLoading(false);
    }
  };

  const cambiarCantidad = async (itemId: number, nuevaCantidad: number) => {
    const usuarioId = obtenerUsuarioIdCarrito();
    setLoading(true);
    try {
      const respuesta = await CarritoService.actualizarCantidad(
        usuarioId,
        itemId,
        nuevaCantidad
      );
      notificarActualizacion(respuesta);
    } finally {
      setLoading(false);
    }
  };

  const quitarItem = async (itemId: number) => {
    const usuarioId = obtenerUsuarioIdCarrito();
    setLoading(true);
    try {
      const respuesta = await CarritoService.eliminarItem(usuarioId, itemId);
      notificarActualizacion(respuesta);
    } finally {
      setLoading(false);
    }
  };

  const vaciar = async () => {
    const usuarioId = obtenerUsuarioIdCarrito();
    setLoading(true);
    try {
      const respuesta = await CarritoService.vaciar(usuarioId);
      notificarActualizacion(respuesta);
    } finally {
      setLoading(false);
    }
  };

  const totalUnidades =
    carrito?.items?.reduce((acc, item) => acc + (item.cantidad || 0), 0) ?? 0;

  return {
    carrito,
    loading,
    error,
    totalUnidades,
    recargar: cargarCarrito,
    agregarAlCarrito,
    cambiarCantidad,
    quitarItem,
    vaciar
  };
};

export default useCarrito;
