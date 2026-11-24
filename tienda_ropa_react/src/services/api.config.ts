import axios from 'axios';

/**
 * URL base del API Gateway (puerto 8080), punto único de entrada
 * para los microservicios de usuarios, productos, carrito y pedidos.
 */
export const API_GATEWAY_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

/**
 * Extrae el mensaje legible enviado por Spring Boot (mensaje / message / detail)
 * o retorna un mensaje por defecto amigable.
 */
export function extraerMensajeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { mensaje?: string; message?: string; detail?: string }
      | string
      | undefined;
    if (typeof data === 'string' && data.trim()) {
      return data.trim();
    }
    if (data && typeof data === 'object') {
      if (data.mensaje && data.mensaje.trim()) return data.mensaje.trim();
      if (data.message && data.message.trim()) return data.message.trim();
      if (data.detail && data.detail.trim()) return data.detail.trim();
    }
    if (!err.response) {
      return 'No se pudo conectar con los microservicios a través del Gateway (puerto 8080).';
    }
  }
  return fallback;
}
