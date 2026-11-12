import axios from 'axios';

export type CategoriaProducto =
  | 'URBANO'
  | 'CASUAL'
  | 'FORMAL'
  | 'DEPORTIVO'
  | 'ACCESORIOS';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaProducto;
  stock: number;
  stockMinimo: number;
}

export type ProductoPayload = Omit<Producto, 'id'>;
// Payload se usa para enviar los datos al crear o editar sin pasar el id (es autoincremental en MySQL)

export interface StockRespuesta {
  productoId: number;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
}

const API_BASE_URL =
  import.meta.env.VITE_API_PRODUCTOS_URL ?? 'http://localhost:8085/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const resource = '/productos';

let cacheProductos: Producto[] = [];
let promesaListar: Promise<Producto[]> | null = null;

export function obtenerCacheProductos(): Producto[] {
  return cacheProductos;
}

export const ProductoService = {
  async listar(): Promise<Producto[]> {
    if (promesaListar) {
      return promesaListar;
    }
    promesaListar = apiClient
      .get<Producto[]>(resource)
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : [];
        cacheProductos = lista;
        return lista;
      })
      .finally(() => {
        promesaListar = null;
      });
    return promesaListar;
  },

  async obtener(id: number): Promise<Producto> {
    const { data } = await apiClient.get<Producto>(`${resource}/${id}`);
    return data;
  },

  async listarPorCategoria(categoria: string): Promise<Producto[]> {
    const { data } = await apiClient.get<Producto[]>(
      `${resource}/categoria/${encodeURIComponent(categoria)}`
    );
    return Array.isArray(data) ? data : [];
  },

  async crear(producto: ProductoPayload): Promise<Producto> {
    const { data } = await apiClient.post<Producto>(resource, producto);
    cacheProductos = [...cacheProductos, data];
    return data;
  },

  async actualizar(id: number, producto: ProductoPayload): Promise<Producto> {
    const { data } = await apiClient.put<Producto>(
      `${resource}/${id}`,
      producto
    );
    cacheProductos = cacheProductos.map((p) => (p.id === id ? data : p));
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
    cacheProductos = cacheProductos.filter((p) => p.id !== id);
  },

  async consultarStock(id: number): Promise<StockRespuesta> {
    const { data } = await apiClient.get<StockRespuesta>(
      `${resource}/${id}/stock`
    );
    return data;
  },

  async descontarStock(id: number, cantidad: number): Promise<StockRespuesta> {
    const { data } = await apiClient.post<StockRespuesta>(
      `${resource}/${id}/stock/descontar`,
      { cantidad }
    );
    cacheProductos = cacheProductos.map((p) =>
      p.id === id ? { ...p, stock: data.stock } : p
    );
    return data;
  },

  async aumentarStock(id: number, cantidad: number): Promise<StockRespuesta> {
    const { data } = await apiClient.post<StockRespuesta>(
      `${resource}/${id}/stock/aumentar`,
      { cantidad }
    );
    cacheProductos = cacheProductos.map((p) =>
      p.id === id ? { ...p, stock: data.stock } : p
    );
    return data;
  }
};

// Funciones de apoyo para mostrar imagenes, tallas y formato de precio chileno en la tienda
interface ProductoExtrasUI {
  imagen?: string;
  tallas?: string[];
}

const EXTRAS_KEY = 'productos_extras_moda_estilo';

function leerMapaExtras(): Record<string, ProductoExtrasUI> {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProductoExtrasUI>) : {};
  } catch {
    return {};
  }
}

export function normalizarRutaImagen(ruta?: string): string {
  if (!ruta || !ruta.trim()) return '';
  const limpia = ruta.trim();
  if (
    limpia.startsWith('http://') ||
    limpia.startsWith('https://') ||
    limpia.startsWith('/')
  ) {
    return limpia;
  }
  return `/${limpia}`;
}

export function guardarExtrasProducto(
  productoId: number,
  extras: ProductoExtrasUI
): void {
  const mapa = leerMapaExtras();
  mapa[String(productoId)] = {
    imagen: extras.imagen ? normalizarRutaImagen(extras.imagen) : undefined,
    tallas: extras.tallas
  };
  localStorage.setItem(EXTRAS_KEY, JSON.stringify(mapa));
}

export function obtenerImagenPorCategoria(
  categoria?: CategoriaProducto | string
): string {
  switch (categoria) {
    case 'URBANO':
      return '/img/urbana.jpg';
    case 'CASUAL':
      return '/img/casual.jpg';
    case 'FORMAL':
      return '/img/formal.jpg';
    case 'ACCESORIOS':
      return '/img/accesorios.jpg';
    case 'DEPORTIVO':
      return '/img/urbana.jpg';
    default:
      return '/img/urbana.jpg';
  }
}

export function obtenerImagenProducto(producto: Producto): string {
  const extras = leerMapaExtras()[String(producto.id)];
  if (extras?.imagen) {
    return normalizarRutaImagen(extras.imagen);
  }
  return obtenerImagenPorCategoria(producto.categoria);
}

export function obtenerTallasProducto(producto: Producto): string[] {
  const extras = leerMapaExtras()[String(producto.id)];
  if (extras?.tallas && extras.tallas.length > 0) {
    return extras.tallas;
  }
  switch (producto.categoria) {
    case 'CASUAL':
      return ['38 - S', '40 - M', '42 - L', '44 - XL'];
    case 'FORMAL':
      return ['S - Small', 'M - Medium', 'L - Large'];
    case 'ACCESORIOS':
      return ['Talla Única'];
    default:
      return ['S - Small', 'M - Medium', 'L - Large', 'XL - Extra Large'];
  }
}

export function obtenerNombreCategoria(
  categoria: CategoriaProducto | string
): string {
  switch (categoria) {
    case 'URBANO':
      return 'Estilo Urbano';
    case 'CASUAL':
      return 'Colección Casual';
    case 'FORMAL':
      return 'Línea Formal';
    case 'DEPORTIVO':
      return 'Línea Deportiva';
    case 'ACCESORIOS':
      return 'Accesorios';
    default:
      return String(categoria);
  }
}

export function formatearPrecioCLP(valor: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(valor || 0);
}

export default ProductoService;
