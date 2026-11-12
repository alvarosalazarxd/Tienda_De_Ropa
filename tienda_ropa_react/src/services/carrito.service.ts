import axios from 'axios';
import { obtenerSesionUsuario } from './usuario.service';

export interface ItemCarrito {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Carrito {
  id: number;
  usuarioId: number;
  items: ItemCarrito[];
  total: number;
}

export type ItemCarritoPayload = Omit<ItemCarrito, 'id' | 'subtotal'>;
// Payload para enviar un item al carrito sin id ni subtotal (el backend lo calcula)

// Puerto 8084 corresponde al microservicio de carrito
const API_BASE_URL =
  import.meta.env.VITE_API_CARRITO_URL ?? 'http://localhost:8084/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const resource = '/carrito';

// Evitamos disparar dos peticiones GET iguales al mismo tiempo cuando cargan el Navbar y el Catalogo
const peticionesEnCurso = new Map<number, Promise<Carrito>>();

export const CarritoService = {
  async obtener(usuarioId: number): Promise<Carrito> {
    const enCurso = peticionesEnCurso.get(usuarioId);
    if (enCurso) {
      return enCurso;
    }
    const promesa = apiClient
      .get<Carrito>(`${resource}/${usuarioId}`)
      .then(({ data }) => data)
      .finally(() => {
        peticionesEnCurso.delete(usuarioId);
      });
    peticionesEnCurso.set(usuarioId, promesa);
    return promesa;
  },

  async agregarItem(
    usuarioId: number,
    item: ItemCarritoPayload
  ): Promise<Carrito> {
    const { data } = await apiClient.post<Carrito>(
      `${resource}/${usuarioId}/items`,
      item
    );
    return data;
  },

  async actualizarCantidad(
    usuarioId: number,
    itemId: number,
    cantidad: number
  ): Promise<Carrito> {
    const { data } = await apiClient.put<Carrito>(
      `${resource}/${usuarioId}/items/${itemId}`,
      null,
      { params: { cantidad } }
    );
    return data;
  },

  async eliminarItem(usuarioId: number, itemId: number): Promise<Carrito> {
    const { data } = await apiClient.delete<Carrito>(
      `${resource}/${usuarioId}/items/${itemId}`
    );
    return data;
  },

  async vaciar(usuarioId: number): Promise<Carrito> {
    const { data } = await apiClient.delete<Carrito>(
      `${resource}/${usuarioId}`
    );
    return data;
  }
};

// Si el cliente inicio sesion usamos su id real; si no, le damos un id temporal de invitado
const INVITADO_KEY = 'carrito_invitado_id';
const TALLAS_CARRITO_KEY = 'tallas_carrito_moda_estilo';

export function obtenerUsuarioIdCarrito(): number {
  const sesion = obtenerSesionUsuario();
  if (sesion && sesion.id) {
    return sesion.id;
  }
  const guardado = localStorage.getItem(INVITADO_KEY);
  if (guardado && !Number.isNaN(Number(guardado))) {
    return Number(guardado);
  }
  const nuevoInvitado = Math.floor(900000 + Math.random() * 99999);
  localStorage.setItem(INVITADO_KEY, String(nuevoInvitado));
  return nuevoInvitado;
}

export function guardarTallaItemCarrito(
  usuarioId: number,
  productoId: number,
  talla: string
): void {
  try {
    const raw = localStorage.getItem(TALLAS_CARRITO_KEY);
    const mapa = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    mapa[`${usuarioId}_${productoId}`] = talla || 'Única';
    localStorage.setItem(TALLAS_CARRITO_KEY, JSON.stringify(mapa));
  } catch {
    // ignoramos si falla localStorage
  }
}

export function obtenerTallaItemCarrito(
  usuarioId: number,
  productoId: number
): string {
  try {
    const raw = localStorage.getItem(TALLAS_CARRITO_KEY);
    if (!raw) return 'Única';
    const mapa = JSON.parse(raw) as Record<string, string>;
    return mapa[`${usuarioId}_${productoId}`] ?? 'Única';
  } catch {
    return 'Única';
  }
}

export default CarritoService;
