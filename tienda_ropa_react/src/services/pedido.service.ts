import axios from 'axios';
import { API_GATEWAY_URL } from './api.config';
import type { Producto } from './producto.service';

export type EstadoPedido =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'PREPARANDO'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'REEMBOLSADO';

export interface ItemPedido {
  id?: number;
  productoId: number;
  nombreProducto?: string | null;
  talla?: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  reembolsado?: boolean;
  motivoReembolso?: string | null;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  fecha: string;
  estado: EstadoPedido;
  total: number;
  metodoPago?: string | null;
  clienteNombre?: string | null;
  clienteEmail?: string | null;
  clienteTelefono?: string | null;
  direccion?: string | null;
  comunaRegion?: string | null;
  motivoEstado?: string | null;
  montoReembolsado?: number;
  items: ItemPedido[];
}

export interface PedidoPayload {
  usuarioId: number;
  metodoPago?: string;
  clienteNombre?: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  direccion?: string;
  comunaRegion?: string;
  items: {
    productoId: number;
    nombreProducto?: string;
    talla?: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

// Todas las peticiones pasan por el API Gateway (8080 -> pedido 8083)
const API_BASE_URL =
  import.meta.env.VITE_API_PEDIDOS_URL ?? API_GATEWAY_URL;

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

  async cambiarEstado(
    id: number,
    estado: EstadoPedido,
    motivo?: string
  ): Promise<Pedido> {
    const params: Record<string, string> = { estado };
    if (motivo && motivo.trim()) {
      params.motivo = motivo.trim();
    }
    const { data } = await apiClient.put<Pedido>(
      `${resource}/${id}/estado`,
      null,
      { params }
    );
    return data;
  },

  async cancelar(id: number, motivo?: string): Promise<Pedido> {
    const params: Record<string, string> = {};
    if (motivo && motivo.trim()) {
      params.motivo = motivo.trim();
    }
    const { data } = await apiClient.patch<Pedido>(
      `${resource}/${id}/cancelar`,
      null,
      { params }
    );
    return data;
  },

  async reembolsar(id: number, motivo?: string): Promise<Pedido> {
    const params: Record<string, string> = {};
    if (motivo && motivo.trim()) {
      params.motivo = motivo.trim();
    }
    const { data } = await apiClient.post<Pedido>(
      `${resource}/${id}/reembolsar`,
      null,
      { params }
    );
    return data;
  },

  async reembolsarItem(
    pedidoId: number,
    itemId: number,
    motivo?: string
  ): Promise<Pedido> {
    const params: Record<string, string> = {};
    if (motivo && motivo.trim()) {
      params.motivo = motivo.trim();
    }
    const { data } = await apiClient.post<Pedido>(
      `${resource}/${pedidoId}/items/${itemId}/reembolsar`,
      null,
      { params }
    );
    return data;
  }
};

export function obtenerEtiquetaEstadoPedido(estado: EstadoPedido): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente de pago';
    case 'PAGADO':
      return 'Pagado';
    case 'PREPARANDO':
      return 'En preparación';
    case 'ENVIADO':
      return 'Enviado';
    case 'ENTREGADO':
      return 'Entregado';
    case 'CANCELADO':
      return 'Cancelado';
    case 'REEMBOLSADO':
      return 'Reembolsado';
    default:
      return estado;
  }
}

export function obtenerClaseBadgeEstadoPedido(estado: EstadoPedido): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-warning text-dark';
    case 'PAGADO':
      return 'bg-success';
    case 'PREPARANDO':
      return 'bg-info text-dark';
    case 'ENVIADO':
      return 'bg-primary';
    case 'ENTREGADO':
      return 'bg-success';
    case 'CANCELADO':
      return 'bg-danger';
    case 'REEMBOLSADO':
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
}

export function obtenerTransicionesEstadoPedido(
  estado: EstadoPedido
): EstadoPedido[] {
  switch (estado) {
    case 'PENDIENTE':
      return ['PAGADO', 'CANCELADO'];
    case 'PAGADO':
      return ['PREPARANDO', 'ENVIADO', 'ENTREGADO', 'REEMBOLSADO'];
    case 'PREPARANDO':
      return ['ENVIADO', 'ENTREGADO', 'REEMBOLSADO'];
    case 'ENVIADO':
      return ['ENTREGADO', 'REEMBOLSADO'];
    case 'ENTREGADO':
      return ['REEMBOLSADO'];
    case 'CANCELADO':
    case 'REEMBOLSADO':
    default:
      return [];
  }
}

export function esEstadoPedidoPagado(estado: EstadoPedido): boolean {
  return (
    estado === 'PAGADO' ||
    estado === 'PREPARANDO' ||
    estado === 'ENVIADO' ||
    estado === 'ENTREGADO'
  );
}

export function esEstadoPedidoActivo(estado: EstadoPedido): boolean {
  return (
    estado === 'PENDIENTE' ||
    estado === 'PAGADO' ||
    estado === 'PREPARANDO'
  );
}

export function obtenerNombreItemPedido(
  item: ItemPedido,
  mapaProductos?: Map<number, Producto>,
  despacho?: DatosDespachoPedido | null
): string {
  if (item.nombreProducto && item.nombreProducto.trim()) {
    return item.nombreProducto.trim();
  }
  const prod = mapaProductos?.get(item.productoId);
  if (prod?.nombre) {
    return prod.nombre;
  }
  const nombreLocal = despacho?.nombresPorProducto?.[String(item.productoId)];
  if (nombreLocal) {
    return nombreLocal;
  }
  return `Producto #${item.productoId}`;
}

// Datos extra del formulario de despacho para mostrarlos en el detalle del pedido
export interface DatosDespachoPedido {
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  direccion: string;
  comunaRegion: string;
  metodoPago: string;
  tallasPorProducto?: Record<string, string>;
  nombresPorProducto?: Record<string, string>;
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
