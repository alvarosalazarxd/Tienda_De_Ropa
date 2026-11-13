import type { KeyboardEvent } from 'react';

export const PREFIJO_TELEFONO_CL = '+569';
export const MAX_DIGITOS_MOVIL_CL = 8;
export const LONGITUD_TELEFONO_CL =
  PREFIJO_TELEFONO_CL.length + MAX_DIGITOS_MOVIL_CL;

const TELEFONOS_FALSOS = new Set([
  '12345678',
  '87654321',
  '01234567',
  '76543210',
  '23456789',
  '98765432'
]);

const DOMINIOS_BLOQUEADOS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'example.cl',
  'test.com',
  'test.cl',
  'prueba.com',
  'prueba.cl',
  'fake.com',
  'fake.cl',
  'falso.com',
  'falso.cl',
  'correo.com',
  'correo.cl',
  'modaestilo.cl',
  'tienda.cl',
  'dominio.com',
  'dominio.cl',
  'mailinator.com',
  'yopmail.com',
  'yopmail.fr',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'sharklasers.com',
  'localhost',
  'invalid'
]);

const SUGERENCIAS_DOMINIO: Record<string, string> = {
  'gmail.cl': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'yahoo.con': 'yahoo.com',
  'iclod.com': 'icloud.com'
};

const EMAIL_REGEX =
  /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;

const cacheDominioMx = new Map<string, boolean>();

export interface ResultadoValidacionTelefono {
  valido: boolean;
  digitos: number;
  mensaje?: string;
}

export interface ResultadoValidacionCorreo {
  valido: boolean;
  verificadoDns: boolean;
  estado: 'ok' | 'error' | 'offline';
  mensaje: string;
}

/**
 * Normaliza un número móvil chileno manteniendo siempre el prefijo +569
 * y limitando la entrada a un máximo estricto de 8 dígitos posteriores.
 */
export function normalizarTelefonoChileno(valor: string): string {
  if (valor.startsWith(PREFIJO_TELEFONO_CL)) {
    const cuerpo = valor
      .slice(PREFIJO_TELEFONO_CL.length)
      .replace(/\D/g, '')
      .slice(0, MAX_DIGITOS_MOVIL_CL);
    return `${PREFIJO_TELEFONO_CL}${cuerpo}`;
  }

  // Si intentaron borrar caracteres del prefijo +569, restaurar el prefijo
  if (
    valor.length < PREFIJO_TELEFONO_CL.length &&
    PREFIJO_TELEFONO_CL.startsWith(valor)
  ) {
    return PREFIJO_TELEFONO_CL;
  }

  const soloDigitos = valor.replace(/\D/g, '');
  let cuerpo = soloDigitos;

  if (soloDigitos.startsWith('569')) {
    cuerpo = soloDigitos.slice(3);
  } else if (soloDigitos.startsWith('9') && soloDigitos.length === 9) {
    cuerpo = soloDigitos.slice(1);
  } else if (valor.startsWith('+56') && soloDigitos === '56') {
    cuerpo = '';
  }

  return `${PREFIJO_TELEFONO_CL}${cuerpo.slice(0, MAX_DIGITOS_MOVIL_CL)}`;
}

/**
 * Impide borrar el prefijo +569 con Backspace/Suprimir, permitiendo borrar
 * únicamente los dígitos posteriores seleccionados.
 */
export function manejarTeclaTelefono(
  evento: KeyboardEvent<HTMLInputElement>,
  valorActual: string,
  onChangeValue: (nuevo: string) => void
): void {
  const minPos = PREFIJO_TELEFONO_CL.length;
  const inicio = evento.currentTarget.selectionStart ?? minPos;
  const fin = evento.currentTarget.selectionEnd ?? minPos;

  if (
    (evento.key === 'Backspace' && inicio <= minPos && fin <= minPos) ||
    (evento.key === 'Delete' && inicio < minPos && fin <= minPos)
  ) {
    evento.preventDefault();
    return;
  }

  if (
    (evento.key === 'Backspace' || evento.key === 'Delete') &&
    inicio < minPos &&
    fin > minPos
  ) {
    evento.preventDefault();
    const input = evento.currentTarget;
    const nuevo = `${PREFIJO_TELEFONO_CL}${valorActual.slice(fin)}`;
    onChangeValue(nuevo);
    window.requestAnimationFrame(() => {
      input.setSelectionRange(minPos, minPos);
    });
  }
}

export function contarDigitosMovil(telefono: string): number {
  const normalizado = normalizarTelefonoChileno(telefono);
  return normalizado.slice(PREFIJO_TELEFONO_CL.length).length;
}

/**
 * Valida que el teléfono tenga +569 seguido de exactamente 8 dígitos reales
 * (rechazando números repetitivos o secuenciales de prueba).
 */
export function validarTelefonoChileno(
  telefono: string
): ResultadoValidacionTelefono {
  const normalizado = normalizarTelefonoChileno(telefono);
  const cuerpo = normalizado.slice(PREFIJO_TELEFONO_CL.length);

  if (!/^\+569\d{8}$/.test(normalizado)) {
    return {
      valido: false,
      digitos: cuerpo.length,
      mensaje: `Debes ingresar exactamente 8 dígitos después de +569 (actualmente ${cuerpo.length}/8).`
    };
  }

  if (/^(\d)\1{7}$/.test(cuerpo) || TELEFONOS_FALSOS.has(cuerpo)) {
    return {
      valido: false,
      digitos: cuerpo.length,
      mensaje:
        'Ingresa un número telefónico móvil real (no uses números repetidos ni de prueba como 12345678).'
    };
  }

  return { valido: true, digitos: cuerpo.length };
}

/**
 * Valida formato y descarta dominios falsos, de prueba, temporales o mal escritos.
 */
export function validarFormatoCorreoReal(correoRaw: string): {
  valido: boolean;
  correo: string;
  dominio?: string;
  mensaje?: string;
} {
  const correo = correoRaw.trim().toLowerCase();

  if (!EMAIL_REGEX.test(correo) || correo.includes('..')) {
    return {
      valido: false,
      correo,
      mensaje: 'Ingresa un correo electrónico con formato válido (ej: nombre@gmail.com).'
    };
  }

  const dominio = correo.split('@')[1];
  const sugerencia = SUGERENCIAS_DOMINIO[dominio];
  if (sugerencia) {
    return {
      valido: false,
      correo,
      dominio,
      mensaje: `El dominio "${dominio}" no es válido para correo. ¿Quisiste decir "@${sugerencia}"?`
    };
  }

  if (DOMINIOS_BLOQUEADOS.has(dominio)) {
    return {
      valido: false,
      correo,
      dominio,
      mensaje: `El dominio "${dominio}" no corresponde a un correo real activo. Usa tu correo personal (ej: Gmail, Outlook, Hotmail).`
    };
  }

  return { valido: true, correo, dominio };
}

interface DnsGoogleResponse {
  Status?: number;
  Answer?: Array<{ type?: number; data?: string }>;
}

/**
 * Consulta en DNS público (Google DNS) si el dominio del correo tiene
 * registros MX activos capaces de recibir mensajes.
 */
export async function verificarDominioCorreoActivo(
  dominio: string
): Promise<'activo' | 'inactivo' | 'indeterminado'> {
  if (cacheDominioMx.has(dominio)) {
    return cacheDominioMx.get(dominio) ? 'activo' : 'inactivo';
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 3500);

  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=MX`,
      { signal: controller.signal }
    );
    if (!resp.ok) {
      return 'indeterminado';
    }
    const data = (await resp.json()) as DnsGoogleResponse;

    if (data.Status === 3) {
      cacheDominioMx.set(dominio, false);
      return 'inactivo';
    }

    const tieneMxActivo = (data.Answer ?? []).some((ans) => {
      if (ans.type !== 15 || !ans.data) return false;
      const intercambio = ans.data.trim().split(/\s+/).pop() ?? '';
      return intercambio !== '' && intercambio !== '.';
    });

    if (data.Status === 0) {
      cacheDominioMx.set(dominio, tieneMxActivo);
      return tieneMxActivo ? 'activo' : 'inactivo';
    }

    return 'indeterminado';
  } catch {
    return 'indeterminado';
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Valida que el correo sea real (formato estricto + bloqueo de temporales/ficticios +
 * verificación DNS de servidor de correo MX activo).
 */
export async function validarCorreoRealActivo(
  correoRaw: string
): Promise<ResultadoValidacionCorreo> {
  const sintaxis = validarFormatoCorreoReal(correoRaw);
  if (!sintaxis.valido || !sintaxis.dominio) {
    return {
      valido: false,
      verificadoDns: false,
      estado: 'error',
      mensaje: sintaxis.mensaje ?? 'Correo electrónico inválido.'
    };
  }

  const estadoMx = await verificarDominioCorreoActivo(sintaxis.dominio);
  if (estadoMx === 'inactivo') {
    return {
      valido: false,
      verificadoDns: true,
      estado: 'error',
      mensaje: `El dominio "${sintaxis.dominio}" no existe o no tiene un servidor de correo activo. Ingresa un correo real y activo.`
    };
  }

  if (estadoMx === 'activo') {
    return {
      valido: true,
      verificadoDns: true,
      estado: 'ok',
      mensaje: `Correo válido con servidor activo (${sintaxis.dominio}).`
    };
  }

  return {
    valido: true,
    verificadoDns: false,
    estado: 'offline',
    mensaje: `Formato válido (${sintaxis.dominio}). No se pudo consultar DNS sin conexión.`
  };
}
