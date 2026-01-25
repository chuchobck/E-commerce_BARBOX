/**
 * Utilidades de validación para formularios
 */

/**
 * Valida una cédula ecuatoriana usando el algoritmo oficial
 * @param cedula - Número de cédula de 10 dígitos
 * @returns true si es válida, false si no lo es
 */
export const validarCedulaEcuatoriana = (cedula: string): boolean => {
  // Eliminar espacios y guiones
  cedula = cedula.replace(/[\s-]/g, '');

  // Verificar que tenga exactamente 10 dígitos
  if (!/^\d{10}$/.test(cedula)) {
    return false;
  }

  // Extraer los dígitos
  const digitos = cedula.split('').map(Number);
  
  // Verificar que los dos primeros dígitos correspondan a una provincia válida (01-24)
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) {
    return false;
  }

  // El tercer dígito debe ser menor a 6 (cédulas de personas naturales)
  if (digitos[2] >= 6) {
    return false;
  }

  // Algoritmo de validación (módulo 10)
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = digitos[i] * coeficientes[i];
    // Si el resultado es mayor a 9, se resta 9
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  // Calcular el dígito verificador
  const residuo = suma % 10;
  const digitoVerificador = residuo === 0 ? 0 : 10 - residuo;

  // Comparar con el último dígito de la cédula
  return digitoVerificador === digitos[9];
};

/**
 * Valida un RUC ecuatoriano (puede ser persona natural o empresa)
 * @param ruc - Número de RUC de 13 dígitos
 * @returns true si es válido, false si no lo es
 */
export const validarRUCEcuatoriano = (ruc: string): boolean => {
  // Eliminar espacios y guiones
  ruc = ruc.replace(/[\s-]/g, '');

  // Verificar que tenga exactamente 13 dígitos
  if (!/^\d{13}$/.test(ruc)) {
    return false;
  }

  // Para RUC de persona natural (los primeros 10 dígitos son la cédula)
  const tercerDigito = parseInt(ruc[2], 10);
  
  if (tercerDigito < 6) {
    // Es RUC de persona natural - validar como cédula los primeros 10 dígitos
    const cedula = ruc.substring(0, 10);
    return validarCedulaEcuatoriana(cedula) && ruc.substring(10) === '001';
  } else if (tercerDigito === 6) {
    // Es RUC de entidad pública
    return validarRUCPublico(ruc);
  } else if (tercerDigito === 9) {
    // Es RUC de empresa privada
    return validarRUCPrivado(ruc);
  }

  return false;
};

/**
 * Valida RUC de entidad pública (tercer dígito = 6)
 */
const validarRUCPublico = (ruc: string): boolean => {
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
  const digitos = ruc.split('').map(Number);
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += digitos[i] * coeficientes[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;

  return digitoVerificador === digitos[8];
};

/**
 * Valida RUC de empresa privada (tercer dígito = 9)
 */
const validarRUCPrivado = (ruc: string): boolean => {
  const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digitos = ruc.split('').map(Number);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    suma += digitos[i] * coeficientes[i];
  }

  const residuo = suma % 11;
  const digitoVerificador = residuo === 0 ? 0 : 11 - residuo;

  return digitoVerificador === digitos[9];
};

/**
 * Valida una cédula o RUC ecuatoriano
 * @param valor - Cédula (10 dígitos) o RUC (13 dígitos)
 * @returns true si es válido, false si no lo es
 */
export const validarCedulaORUC = (valor: string): boolean => {
  const limpio = valor.replace(/[\s-]/g, '');
  
  if (limpio.length === 10) {
    return validarCedulaEcuatoriana(limpio);
  } else if (limpio.length === 13) {
    return validarRUCEcuatoriano(limpio);
  }
  
  return false;
};

/**
 * Valida formato de email
 */
export const validarEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Valida formato de teléfono ecuatoriano
 * Formatos aceptados: 022123456, 0991234567
 */
export const validarTelefono = (telefono: string): boolean => {
  const limpio = telefono.replace(/[\s\-+]/g, '');
  // Teléfonos convencionales: 9 dígitos empezando con 0
  // Celulares: 10 dígitos empezando con 09
  return /^0[2-7]\d{7}$/.test(limpio) || /^09\d{8}$/.test(limpio);
};

/**
 * Calcula la fortaleza de una contraseña
 * @returns número entre 0 y 5
 */
export const calcularFortalezaPassword = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

/**
 * Obtiene el mensaje de fortaleza de contraseña
 */
export const getPasswordStrengthLabel = (strength: number): { label: string; color: string } => {
  if (strength <= 1) return { label: 'Muy débil', color: '#dc2626' };
  if (strength === 2) return { label: 'Débil', color: '#f59e0b' };
  if (strength === 3) return { label: 'Aceptable', color: '#eab308' };
  if (strength === 4) return { label: 'Fuerte', color: '#10b981' };
  return { label: 'Muy fuerte', color: '#059669' };
};
