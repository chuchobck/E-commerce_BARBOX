// src/utils/errorHandler.ts
// Sistema de manejo de errores - Heurística #9
// Mensajes amigables con sugerencias de solución

export interface ErrorInfo {
  message: string;
  suggestion: string;
  action?: {
    label: string;
    callback: () => void;
  };
  icon?: string;
  type?: 'error' | 'warning' | 'info';
}

// Mapeo de códigos de error a mensajes amigables
export const ERROR_MESSAGES: Record<string, ErrorInfo> = {
  // Errores de red
  'NETWORK_ERROR': {
    message: 'No pudimos conectar con el servidor',
    suggestion: 'Verifica tu conexión a internet y vuelve a intentarlo',
    icon: 'fa-wifi',
    type: 'error'
  },
  'TIMEOUT_ERROR': {
    message: 'La solicitud tardó demasiado tiempo',
    suggestion: 'El servidor está tardando en responder. Intenta de nuevo en unos momentos',
    icon: 'fa-clock',
    type: 'warning'
  },
  'SERVER_ERROR': {
    message: 'Algo salió mal en nuestro servidor',
    suggestion: 'Nuestro equipo ya fue notificado. Por favor, intenta más tarde',
    icon: 'fa-server',
    type: 'error'
  },

  // Errores de autenticación
  'UNAUTHORIZED': {
    message: 'Tu sesión ha expirado',
    suggestion: 'Por favor, inicia sesión nuevamente para continuar',
    icon: 'fa-lock',
    type: 'warning'
  },
  'INVALID_CREDENTIALS': {
    message: 'Usuario o contraseña incorrectos',
    suggestion: 'Revisa tus datos e intenta de nuevo. ¿Olvidaste tu contraseña?',
    icon: 'fa-user-times',
    type: 'error'
  },
  'TOKEN_EXPIRED': {
    message: 'Tu sesión expiró',
    suggestion: 'Inicia sesión nuevamente para continuar navegando',
    icon: 'fa-hourglass-end',
    type: 'info'
  },

  // Errores de productos
  'PRODUCT_NOT_FOUND': {
    message: 'Producto no encontrado',
    suggestion: 'Este producto ya no está disponible. Explora nuestro catálogo para ver alternativas',
    icon: 'fa-search',
    type: 'info'
  },
  'OUT_OF_STOCK': {
    message: 'Producto agotado',
    suggestion: 'Agrégalo a favoritos para recibir una notificación cuando vuelva a estar disponible',
    icon: 'fa-box-open',
    type: 'warning'
  },
  'INSUFFICIENT_STOCK': {
    message: 'Stock insuficiente',
    suggestion: 'Solo tenemos {available} unidades disponibles. Ajusta la cantidad en tu carrito',
    icon: 'fa-exclamation-triangle',
    type: 'warning'
  },

  // Errores de pago
  'PAYMENT_DECLINED': {
    message: 'El pago fue rechazado',
    suggestion: 'Contacta a tu banco o intenta con otra tarjeta. No se realizó ningún cargo',
    icon: 'fa-credit-card',
    type: 'error'
  },
  'INVALID_CARD': {
    message: 'Datos de tarjeta inválidos',
    suggestion: 'Revisa el número de tarjeta, fecha de vencimiento y código CVV',
    icon: 'fa-credit-card',
    type: 'error'
  },
  'INSUFFICIENT_FUNDS': {
    message: 'Fondos insuficientes',
    suggestion: 'Tu tarjeta no tiene saldo suficiente. Intenta con otro método de pago',
    icon: 'fa-wallet',
    type: 'error'
  },
  'PAYMENT_PROCESSING': {
    message: 'Procesando tu pago',
    suggestion: 'Por favor espera, esto puede tomar unos segundos. No recargues la página',
    icon: 'fa-spinner',
    type: 'info'
  },

  // Errores de carrito
  'CART_EMPTY': {
    message: 'Tu carrito está vacío',
    suggestion: 'Explora nuestro catálogo y agrega productos para comenzar tu compra',
    icon: 'fa-shopping-cart',
    type: 'info'
  },
  'CART_UPDATE_FAILED': {
    message: 'No se pudo actualizar el carrito',
    suggestion: 'Intenta refrescar la página o agregar el producto nuevamente',
    icon: 'fa-sync-alt',
    type: 'error'
  },

  // Errores de formularios
  'VALIDATION_ERROR': {
    message: 'Hay errores en el formulario',
    suggestion: 'Revisa los campos marcados en rojo y corrígelos antes de continuar',
    icon: 'fa-exclamation-circle',
    type: 'warning'
  },
  'INVALID_EMAIL': {
    message: 'Correo electrónico inválido',
    suggestion: 'Verifica que el correo tenga el formato correcto: ejemplo@dominio.com',
    icon: 'fa-envelope',
    type: 'error'
  },
  'INVALID_PHONE': {
    message: 'Número de teléfono inválido',
    suggestion: 'Ingresa un número válido de 10 dígitos sin espacios ni guiones',
    icon: 'fa-phone',
    type: 'error'
  },

  // Errores de dirección
  'INVALID_ADDRESS': {
    message: 'Dirección de envío inválida',
    suggestion: 'Completa todos los campos requeridos de la dirección',
    icon: 'fa-map-marker-alt',
    type: 'error'
  },
  'DELIVERY_UNAVAILABLE': {
    message: 'No enviamos a esta zona',
    suggestion: 'Por ahora solo hacemos entregas en la ciudad. Selecciona retiro en tienda',
    icon: 'fa-truck',
    type: 'warning'
  },

  // Error genérico
  'UNKNOWN_ERROR': {
    message: 'Algo salió mal',
    suggestion: 'Ocurrió un error inesperado. Por favor, intenta de nuevo o contacta a soporte',
    icon: 'fa-bug',
    type: 'error'
  }
};

/**
 * Obtiene información de error amigable basada en código o mensaje
 */
export const getErrorInfo = (error: any): ErrorInfo => {
  // Si es un código de error conocido
  if (typeof error === 'string' && ERROR_MESSAGES[error]) {
    return ERROR_MESSAGES[error];
  }

  // Si es un objeto de error con código
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Si es un error HTTP
  if (error?.response?.status) {
    const status = error.response.status;
    
    if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
    if (status === 404) return ERROR_MESSAGES.PRODUCT_NOT_FOUND;
    if (status >= 500) return ERROR_MESSAGES.SERVER_ERROR;
  }

  // Si es un error de red
  if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Si es timeout
  if (error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Error genérico con mensaje personalizado
  return {
    message: error?.message || 'Algo salió mal',
    suggestion: 'Por favor, intenta de nuevo o contacta a soporte si el problema persiste',
    icon: 'fa-exclamation-circle',
    type: 'error'
  };
};

/**
 * Formatea un mensaje de error con variables dinámicas
 */
export const formatErrorMessage = (template: string, variables: Record<string, any>): string => {
  return template.replace(/\{(\w+)\}/g, (_, key) => variables[key] || '');
};

/**
 * Determina si un error es recuperable automáticamente
 */
export const isRecoverableError = (error: any): boolean => {
  const recoverableCodes = ['TIMEOUT_ERROR', 'NETWORK_ERROR', 'SERVER_ERROR'];
  
  if (typeof error === 'string') {
    return recoverableCodes.includes(error);
  }
  
  if (error?.code) {
    return recoverableCodes.includes(error.code);
  }
  
  return false;
};

/**
 * Hook de retry automático para errores recuperables
 */
export const createRetryHandler = (maxRetries: number = 3, delayMs: number = 1000) => {
  let retryCount = 0;

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      const result = await fn();
      retryCount = 0; // Reset en éxito
      return result;
    } catch (error) {
      if (isRecoverableError(error) && retryCount < maxRetries) {
        retryCount++;
        console.log(`⚠️ Reintentando... (${retryCount}/${maxRetries})`);
        
        // Delay exponencial
        await new Promise(resolve => setTimeout(resolve, delayMs * retryCount));
        
        return createRetryHandler(maxRetries, delayMs)(fn);
      }
      
      throw error;
    }
  };
};

const errorHandler = {
  getErrorInfo,
  formatErrorMessage,
  isRecoverableError,
  createRetryHandler,
  ERROR_MESSAGES
};

export default errorHandler;
