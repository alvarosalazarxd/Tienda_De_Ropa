/**
 * URL base del API Gateway (puerto 8080), punto único de entrada
 * para los microservicios de usuarios, productos, carrito y pedidos.
 */
export const API_GATEWAY_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
