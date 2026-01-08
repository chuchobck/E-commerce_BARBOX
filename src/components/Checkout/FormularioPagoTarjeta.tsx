import React, { useState } from 'react';
import './FormularioPagoTarjeta.css';

interface DatosTarjeta {
  numero: string;
  titular: string;
  fechaExpiracion: string;
  cvv: string;
}

interface Props {
  onPagar: (datosTarjeta: DatosTarjeta) => Promise<void>;
  monto: number;
  isLoading: boolean;
}

const FormularioPagoTarjeta: React.FC<Props> = ({ onPagar, monto, isLoading }) => {
  const [datosTarjeta, setDatosTarjeta] = useState<DatosTarjeta>({
    numero: '',
    titular: '',
    fechaExpiracion: '',
    cvv: ''
  });

  const [errores, setErrores] = useState<Partial<DatosTarjeta>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DatosTarjeta, boolean>>>({});

  // ✅ Algoritmo de Luhn para validar número de tarjeta
  const validarLuhn = (numero: string): boolean => {
    const digitos = numero.replace(/\D/g, '');
    if (digitos.length < 13 || digitos.length > 19) return false;
    
    let suma = 0;
    let esSegundo = false;
    
    for (let i = digitos.length - 1; i >= 0; i--) {
      let digito = parseInt(digitos[i], 10);
      
      if (esSegundo) {
        digito *= 2;
        if (digito > 9) {
          digito -= 9;
        }
      }
      
      suma += digito;
      esSegundo = !esSegundo;
    }
    
    return suma % 10 === 0;
  };

  // ✅ Detectar tipo de tarjeta
  const getTipoTarjeta = (numero: string) => {
    const limpio = numero.replace(/\D/g, '');
    
    if (/^4/.test(limpio)) {
      return { tipo: 'Visa', icono: '💳', color: '#1a1f71', cvvLength: 3 };
    }
    if (/^5[1-5]/.test(limpio) || /^2[2-7]/.test(limpio)) {
      return { tipo: 'Mastercard', icono: '💳', color: '#eb001b', cvvLength: 3 };
    }
    if (/^3[47]/.test(limpio)) {
      return { tipo: 'American Express', icono: '💳', color: '#006fcf', cvvLength: 4 };
    }
    if (/^6(?:011|5)/.test(limpio)) {
      return { tipo: 'Discover', icono: '💳', color: '#ff6000', cvvLength: 3 };
    }
    if (/^3(?:0[0-5]|[68])/.test(limpio)) {
      return { tipo: 'Diners Club', icono: '💳', color: '#004c97', cvvLength: 3 };
    }
    
    return { tipo: 'Tarjeta', icono: '💳', color: '#6b7280', cvvLength: 3 };
  };

  // Formatear número de tarjeta (espacios cada 4 dígitos)
  const formatearNumeroTarjeta = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '');
    const grupos = soloNumeros.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : soloNumeros;
  };

  // Formatear fecha de expiración (MM/AA)
  const formatearFecha = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '');
    if (soloNumeros.length >= 2) {
      return soloNumeros.slice(0, 2) + '/' + soloNumeros.slice(2, 4);
    }
    return soloNumeros;
  };

  const handleChange = (campo: keyof DatosTarjeta, valor: string) => {
    let valorFormateado = valor;

    if (campo === 'numero') {
      // Solo números, máximo 19 dígitos (16 + 3 espacios)
      valorFormateado = formatearNumeroTarjeta(valor);
      if (valorFormateado.replace(/\D/g, '').length > 16) {
        valorFormateado = formatearNumeroTarjeta(valor.slice(0, -1));
      }
    } else if (campo === 'fechaExpiracion') {
      valorFormateado = formatearFecha(valor);
    } else if (campo === 'cvv') {
      // Solo números, rechazar letras inmediatamente
      if (/[^0-9]/.test(valor)) {
        return; // No actualizar si contiene letras
      }
      const tipoTarjeta = getTipoTarjeta(datosTarjeta.numero);
      const maxLength = tipoTarjeta.cvvLength || 3;
      valorFormateado = valor.slice(0, maxLength === 4 ? 4 : 3);
    } else if (campo === 'titular') {
      // Solo letras, espacios y tildes - rechazar números
      if (/[0-9]/.test(valor)) {
        setErrores(prev => ({ ...prev, titular: 'El nombre no puede contener números' }));
        return;
      }
      valorFormateado = valor.toUpperCase();
    }

    setDatosTarjeta({ ...datosTarjeta, [campo]: valorFormateado });
    
    // Limpiar error del campo
    if (errores[campo]) {
      setErrores({ ...errores, [campo]: undefined });
    }
  };

  const handleBlur = (campo: keyof DatosTarjeta) => {
    setTouched(prev => ({ ...prev, [campo]: true }));
    validarCampo(campo);
  };

  const validarCampo = (campo: keyof DatosTarjeta): string | undefined => {
    let error: string | undefined;

    switch (campo) {
      case 'numero':
        const numeroLimpio = datosTarjeta.numero.replace(/\D/g, '');
        if (!numeroLimpio) {
          error = 'Ingrese el número de tarjeta';
        } else if (numeroLimpio.length < 13) {
          error = 'Número de tarjeta incompleto';
        } else if (!validarLuhn(numeroLimpio)) {
          error = 'Número de tarjeta inválido';
        }
        break;

      case 'titular':
        if (!datosTarjeta.titular.trim()) {
          error = 'Ingrese el nombre y apellido';
        } else if (datosTarjeta.titular.trim().length < 3) {
          error = 'Nombre demasiado corto';
        } else if (/[0-9]/.test(datosTarjeta.titular)) {
          error = 'El nombre no puede contener números';
        } else if (!/^[A-ZÁÉÍÓÚÑÜ\s]+$/.test(datosTarjeta.titular.trim())) {
          error = 'Solo se permiten letras y espacios';
        }
        break;

      case 'fechaExpiracion':
        if (!datosTarjeta.fechaExpiracion) {
          error = 'Ingrese la fecha de expiración';
        } else {
          const partes = datosTarjeta.fechaExpiracion.split('/');
          if (partes.length !== 2 || partes[0].length !== 2 || partes[1].length !== 2) {
            error = 'Formato inválido (MM/AA)';
          } else {
            const mes = parseInt(partes[0], 10);
            const año = parseInt('20' + partes[1], 10);
            const hoy = new Date();
            const mesActual = hoy.getMonth() + 1;
            const añoActual = hoy.getFullYear();

            if (mes < 1 || mes > 12) {
              error = 'Mes inválido (01-12)';
            } else if (año < añoActual || (año === añoActual && mes < mesActual)) {
              error = 'Tarjeta expirada';
            }
          }
        }
        break;

      case 'cvv':
        const tipoTarjeta = getTipoTarjeta(datosTarjeta.numero);
        const cvvLength = tipoTarjeta.cvvLength || 3;
        
        if (!datosTarjeta.cvv) {
          error = 'Ingrese el código CVV';
        } else if (datosTarjeta.cvv.length < cvvLength) {
          error = `CVV inválido (${cvvLength} dígitos)`;
        }
        break;
    }

    if (error) {
      setErrores(prev => ({ ...prev, [campo]: error }));
    }
    return error;
  };

  const validarFormulario = (): boolean => {
    const campos: (keyof DatosTarjeta)[] = ['numero', 'titular', 'fechaExpiracion', 'cvv'];
    let hayErrores = false;

    campos.forEach(campo => {
      const error = validarCampo(campo);
      if (error) hayErrores = true;
    });

    setTouched({ numero: true, titular: true, fechaExpiracion: true, cvv: true });
    return !hayErrores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    await onPagar(datosTarjeta);
  };

  const tipoTarjeta = getTipoTarjeta(datosTarjeta.numero);
  const cvvMaxLength = tipoTarjeta.cvvLength || 3;

  return (
    <div className="formulario-pago-tarjeta">
      <div className="pago-header">
        <h3>💳 Pago con Tarjeta de Crédito/Débito</h3>
        <p className="monto-total">Total a pagar: <strong>${monto.toFixed(2)}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className="tarjeta-form">
        {/* Número de tarjeta */}
        <div className={`form-group ${errores.numero && touched.numero ? 'has-error' : ''}`}>
          <label htmlFor="numero">
            <span className="tipo-tarjeta" style={{ color: tipoTarjeta.color }}>
              {tipoTarjeta.icono} {tipoTarjeta.tipo}
            </span>
            <span className="requerido">*</span>
          </label>
          <input
            type="text"
            id="numero"
            value={datosTarjeta.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            onBlur={() => handleBlur('numero')}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={errores.numero && touched.numero ? 'error' : ''}
            disabled={isLoading}
            autoComplete="cc-number"
          />
          {errores.numero && touched.numero && (
            <span className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errores.numero}
            </span>
          )}
        </div>

        {/* Titular - Cambiado label */}
        <div className={`form-group ${errores.titular && touched.titular ? 'has-error' : ''}`}>
          <label htmlFor="titular">
            Nombre y Apellido
            <span className="requerido">*</span>
          </label>
          <input
            type="text"
            id="titular"
            value={datosTarjeta.titular}
            onChange={(e) => handleChange('titular', e.target.value)}
            onBlur={() => handleBlur('titular')}
            placeholder="JUAN PÉREZ"
            className={errores.titular && touched.titular ? 'error' : ''}
            disabled={isLoading}
            autoComplete="cc-name"
          />
          {errores.titular && touched.titular && (
            <span className="error-message">
              <i className="fas fa-exclamation-circle"></i> {errores.titular}
            </span>
          )}
          <small className="help-text">Como aparece en la tarjeta</small>
        </div>

        {/* Fecha y CVV en línea */}
        <div className="form-row">
          <div className={`form-group ${errores.fechaExpiracion && touched.fechaExpiracion ? 'has-error' : ''}`}>
            <label htmlFor="fechaExpiracion">
              Fecha de Expiración
              <span className="requerido">*</span>
            </label>
            <input
              type="text"
              id="fechaExpiracion"
              value={datosTarjeta.fechaExpiracion}
              onChange={(e) => handleChange('fechaExpiracion', e.target.value)}
              onBlur={() => handleBlur('fechaExpiracion')}
              placeholder="MM/AA"
              maxLength={5}
              className={errores.fechaExpiracion && touched.fechaExpiracion ? 'error' : ''}
              disabled={isLoading}
              autoComplete="cc-exp"
            />
            {errores.fechaExpiracion && touched.fechaExpiracion && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errores.fechaExpiracion}
              </span>
            )}
          </div>

          <div className={`form-group ${errores.cvv && touched.cvv ? 'has-error' : ''}`}>
            <label htmlFor="cvv">
              CVV/CVC
              <span className="requerido">*</span>
            </label>
            <input
              type="text"
              id="cvv"
              value={datosTarjeta.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              onBlur={() => handleBlur('cvv')}
              placeholder={cvvMaxLength === 4 ? '1234' : '123'}
              maxLength={cvvMaxLength}
              className={errores.cvv && touched.cvv ? 'error' : ''}
              disabled={isLoading}
              autoComplete="cc-csc"
            />
            {errores.cvv && touched.cvv && (
              <span className="error-message">
                <i className="fas fa-exclamation-circle"></i> {errores.cvv}
              </span>
            )}
            <small className="help-text">{cvvMaxLength} dígitos al reverso</small>
          </div>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          className="btn-pagar"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Procesando...' : `💳 Pagar $${monto.toFixed(2)}`}
        </button>

        {/* Nota de seguridad */}
        <div className="nota-seguridad">
          <small>🔒 Tus datos están protegidos con encriptación SSL</small>
        </div>
      </form>
    </div>
  );
};

export default FormularioPagoTarjeta;
