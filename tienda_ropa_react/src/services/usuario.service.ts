import axios from 'axios';

export type RolUsuario = 'CLIENTE' | 'ADMIN';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rol: RolUsuario;
  activo: boolean;
  favoritos?: number[];
}

export interface UsuarioPayload {
  nombre: string;
  email: string;
  password: string;
}

// Puerto 8081 corresponde al microservicio de usuarios
const API_BASE_URL =
  import.meta.env.VITE_API_USUARIOS_URL ?? 'http://localhost:8081/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const resource = '/usuarios';

export const UsuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Usuario[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`${resource}/${id}`);
    return data;
  },

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    try {
      const { data } = await apiClient.get<Usuario>(
        `${resource}/email/${encodeURIComponent(email)}`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async crear(usuario: UsuarioPayload): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>(resource, usuario);
    return data;
  },

  async actualizar(id: number, usuario: UsuarioPayload): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`${resource}/${id}`, usuario);
    return data;
  },

  async cambiarRol(id: number, rol: RolUsuario): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(
      `${resource}/${id}/rol`,
      null,
      { params: { rol } }
    );
    return data;
  },

  async deshabilitar(id: number): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(
      `${resource}/${id}/deshabilitar`
    );
    return data;
  },

  async habilitar(id: number): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(
      `${resource}/${id}/habilitar`
    );
    return data;
  },

  async obtenerFavoritos(id: number): Promise<number[]> {
    const { data } = await apiClient.get<number[]>(
      `${resource}/${id}/favoritos`
    );
    return Array.isArray(data) ? data : [];
  },

  async agregarFavorito(id: number, productoId: number): Promise<number[]> {
    const { data } = await apiClient.post<number[]>(
      `${resource}/${id}/favoritos/${productoId}`
    );
    return Array.isArray(data) ? data : [];
  },

  async eliminarFavorito(id: number, productoId: number): Promise<number[]> {
    const { data } = await apiClient.delete<number[]>(
      `${resource}/${id}/favoritos/${productoId}`
    );
    return Array.isArray(data) ? data : [];
  }
};

// Manejo simple de la sesion del usuario logueado en el navegador
const SESION_KEY = 'usuario_activo';

export function obtenerSesionUsuario(): Usuario | null {
  try {
    const data = localStorage.getItem(SESION_KEY);
    if (!data) return null;
    return JSON.parse(data) as Usuario;
  } catch {
    return null;
  }
}

export function guardarSesionUsuario(usuario: Usuario): void {
  const datosSeguros: Usuario = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
    favoritos: usuario.favoritos
  };
  localStorage.setItem(SESION_KEY, JSON.stringify(datosSeguros));
  window.dispatchEvent(new Event('sesionActualizada'));
  window.dispatchEvent(new Event('carritoActualizado'));
}

export function cerrarSesionUsuario(): void {
  localStorage.removeItem(SESION_KEY);
  window.dispatchEvent(new Event('sesionActualizada'));
  window.dispatchEvent(new Event('carritoActualizado'));
}

export default UsuarioService;
