import axios from 'axios';

export type EstadoPedido = 'PENDIENTE' | 'PAGADO' | 'CANCELADO';

export interface ItemPedido {
  id?: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  items: ItemPedido[];
}

export interface PedidoPayload {
  usuarioId: number;
  items: Omit<ItemPedido, 'id' | 'subtotal'>[];
}

// Puerto 8083 corresponde al microservicio de pedidos
const API_BASE_URL =
  import.meta.env.VITE_API_PEDIDOS_URL ?? 'http://localhost:8083/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const resource = '/pedidos';

export const PedidoService = {
  async listar(): Promise<Pedido[]> {
    const { data } = await apiClient.get<Pedido[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Pedido> {
    const { data } = await apiClient.get<Pedido>(`${resource}/${id}`);
    return data;
  },

  async listarPorUsuario(usuarioId: number): Promise<Pedido[]> {
    const { data } = await apiClient.get<Pedido[]>(
      `${resource}/usuario/${usuarioId}`
    );
    return Array.isArray(data) ? data : [];
  },

  async crear(pedido: PedidoPayload): Promise<Pedido> {
    const { data } = await apiClient.post<Pedido>(resource, pedido);
    return data;
  },

  async cambiarEstado(id: number, estado: EstadoPedido): Promise<Pedido> {
    const { data } = await apiClient.put<Pedido>(
      `${resource}/${id}/estado`,
      null,
      { params: { estado } }
    );
    return data;
  },

  async cancelar(id: number): Promise<Pedido> {
    const { data } = await apiClient.patch<Pedido>(`${resource}/${id}/cancelar`);
    return data;
  }
};

// Datos extra del formulario de despacho para mostrarlos en el detalle del pedido
export interface DatosDespachoPedido {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  direccion: string;
  comunaRegion: string;
  metodoPago: string;
  tallasPorProducto?: Record<string, string>;
}

const DESPACHO_KEY = 'despacho_pedidos_moda_estilo';

export function guardarDespachoPedido(
  pedidoId: number,
  datos: DatosDespachoPedido
): void {
  try {
    const raw = localStorage.getItem(DESPACHO_KEY);
    const mapa = raw
      ? (JSON.parse(raw) as Record<string, DatosDespachoPedido>)
      : {};
    mapa[String(pedidoId)] = datos;
    localStorage.setItem(DESPACHO_KEY, JSON.stringify(mapa));
  } catch {
    // ignoramos errores de almacenamiento local
  }
}

export function obtenerDespachoPedido(
  pedidoId: number
): DatosDespachoPedido | null {
  try {
    const raw = localStorage.getItem(DESPACHO_KEY);
    if (!raw) return null;
    const mapa = JSON.parse(raw) as Record<string, DatosDespachoPedido>;
    return mapa[String(pedidoId)] ?? null;
  } catch {
    return null;
  }
}

export function formatearFechaPedido(fechaISO?: string): string {
  if (!fechaISO) return '-';
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return fechaISO;
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default PedidoService;
