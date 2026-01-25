import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  validarCedulaORUC, 
  validarEmail, 
  validarTelefono,
  calcularFortalezaPassword,
  getPasswordStrengthLabel
} from '../../utils/validations';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    confirmPassword: '',
    nombre1: '',
    nombre2: '',
    apellido1: '',
    apellido2: '',
    ruc_cedula: '',
    telefono: '',
    celular: '',
    direccion: '',
    email: '',  // Email ahora es opcional
    id_ciudad: 'GYE', // Default ciudad (código de 3 caracteres)
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mayorEdad, setMayorEdad] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la página de origen desde el state de location
  const from = (location.state as any)?.from || '/';

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'nombre1':
      case 'apellido1':
        if (!value.trim()) return `Este campo es requerido`;
        if (value.trim().length < 2) return `Mínimo 2 caracteres`;
        if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s-]+$/.test(value)) return `Solo letras permitidas`;
        break;
      case 'nombre2':
      case 'apellido2':
        if (value && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s-]+$/.test(value)) return `Solo letras permitidas`;
        break;
      case 'ruc_cedula':
        if (!value) return 'RUC/Cédula es requerido';
        const limpio = value.replace(/[\s-]/g, '');
        if (!/^\d{10,13}$/.test(limpio)) return 'Debe tener 10 o 13 dígitos';
        if (!validarCedulaORUC(value)) return 'Cédula/RUC inválido (verificar dígitos)';
        break;
      case 'usuario':
        if (!value) return 'El usuario es requerido';
        if (value.length < 3) return 'Mínimo 3 caracteres';
        if (value.length > 30) return 'Máximo 30 caracteres';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Solo letras, números y guion bajo';
        break;
      case 'email':
        if (value && !validarEmail(value)) return 'Formato de email inválido';
        break;
      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        break;
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        break;
      case 'telefono':
        if (value && !validarTelefono(value)) return 'Formato de teléfono inválido';
        break;
      case 'celular':
        if (!value) return 'El celular es requerido';
        if (!validarTelefono(value)) return 'Formato de celular inválido';
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Prevenir números y caracteres especiales en campos de nombre
    if (['nombre1', 'nombre2', 'apellido1', 'apellido2'].includes(name)) {
      // Solo permitir letras, espacios, guiones y tildes
      const soloLetras = value.replace(/[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s-]/g, '');
      if (value !== soloLetras) {
        return; // No actualizar el estado si contiene caracteres no permitidos
      }
      setFormData({
        ...formData,
        [name]: soloLetras,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    setError(''); // Limpiar error general
    
    // Validar en tiempo real para usuario y email siempre, otros campos solo si están touched
    if (['usuario', 'email'].includes(name) || touched[name]) {
      const error = validateField(name, ['nombre1', 'nombre2', 'apellido1', 'apellido2'].includes(name) ? value.replace(/[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s-]/g, '') : value);
      setFieldErrors(prev => ({ ...prev, [name]: error || '' }));
      
      // Si se modifica la contraseña, revalidar confirmación
      if (name === 'password' && formData.confirmPassword && touched.confirmPassword) {
        const confirmError = value !== formData.confirmPassword ? 'Las contraseñas no coinciden' : undefined;
        setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError || '' }));
      }
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field as keyof typeof formData] as string;
    const error = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const passwordStrength = calcularFortalezaPassword(formData.password);
  const passwordStrengthInfo = getPasswordStrengthLabel(passwordStrength);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.usuario || !formData.password || !formData.nombre1 || !formData.apellido1 || !formData.ruc_cedula || !formData.celular) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!mayorEdad) {
      setError('Debes confirmar que eres mayor de 18 años');
      return;
    }

    if (!terminos) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    try {
      console.log('📝 Iniciando registro con datos:', {
        usuario: formData.usuario,
        nombre1: formData.nombre1,
        apellido1: formData.apellido1,
        email: formData.email || 'no proporcionado',
        ruc_cedula: formData.ruc_cedula
      });
      
      await register({
        usuario: formData.usuario,
        password: formData.password,
        nombre1: formData.nombre1,
        nombre2: formData.nombre2 || undefined,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2 || undefined,
        ruc_cedula: formData.ruc_cedula,
        telefono: formData.telefono || undefined,
        celular: formData.celular || undefined,
        email: formData.email || undefined,
        direccion: formData.direccion || undefined,
        id_ciudad: formData.id_ciudad,
      });

      console.log('✅ Registro exitoso, redirigiendo...');
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('❌ Error en registro:', err);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      setError(err.response?.data?.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-form modern-auth-form register-form-modern">
      <div className="auth-form-icon">
        <i className="fas fa-user-plus"></i>
      </div>
      <h2 className="auth-form-title">Crea tu cuenta</h2>
      <p className="auth-form-subtitle">Únete a nuestra comunidad</p>

      {error && (
        <div className="alert-error modern-alert">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Error en el registro</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="modern-form">
        {/* Nombres */}
        <div className="form-row-modern">
          <div className={`form-group-modern ${fieldErrors.nombre1 && touched.nombre1 ? 'has-error' : ''} ${formData.nombre1 && !fieldErrors.nombre1 ? 'has-success' : ''}`}>
            <label htmlFor="nombre1">
              <i className="fas fa-user"></i>
              Primer Nombre *
            </label>
            <input
              type="text"
              id="nombre1"
              name="nombre1"
              value={formData.nombre1}
              onChange={handleChange}
              onBlur={() => handleBlur('nombre1')}
              disabled={loading}
              placeholder="Primer nombre"
              maxLength={50}
            />
            {fieldErrors.nombre1 && touched.nombre1 && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.nombre1}
              </span>
            )}
          </div>

          <div className={`form-group-modern ${fieldErrors.nombre2 && touched.nombre2 ? 'has-error' : ''}`}>
            <label htmlFor="nombre2">
              <i className="fas fa-user"></i>
              Segundo Nombre
            </label>
            <input
              type="text"
              id="nombre2"
              name="nombre2"
              value={formData.nombre2}
              onChange={handleChange}
              onBlur={() => handleBlur('nombre2')}
              disabled={loading}
              placeholder="Segundo nombre (opcional)"
              maxLength={50}
            />
            {fieldErrors.nombre2 && touched.nombre2 && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.nombre2}
              </span>
            )}
          </div>
        </div>

        {/* Apellidos */}
        <div className="form-row-modern">
          <div className={`form-group-modern ${fieldErrors.apellido1 && touched.apellido1 ? 'has-error' : ''} ${formData.apellido1 && !fieldErrors.apellido1 ? 'has-success' : ''}`}>
            <label htmlFor="apellido1">
              <i className="fas fa-user-tag"></i>
              Primer Apellido *
            </label>
            <input
              type="text"
              id="apellido1"
              name="apellido1"
              value={formData.apellido1}
              onChange={handleChange}
              onBlur={() => handleBlur('apellido1')}
              disabled={loading}
              placeholder="Primer apellido"
              maxLength={50}
            />
            {fieldErrors.apellido1 && touched.apellido1 && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.apellido1}
              </span>
            )}
          </div>

          <div className={`form-group-modern ${fieldErrors.apellido2 && touched.apellido2 ? 'has-error' : ''}`}>
            <label htmlFor="apellido2">
              <i className="fas fa-user-tag"></i>
              Segundo Apellido
            </label>
            <input
              type="text"
              id="apellido2"
              name="apellido2"
              value={formData.apellido2}
              onChange={handleChange}
              onBlur={() => handleBlur('apellido2')}
              disabled={loading}
              placeholder="Segundo apellido (opcional)"
              maxLength={50}
            />
            {fieldErrors.apellido2 && touched.apellido2 && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.apellido2}
              </span>
            )}
          </div>
        </div>
        {/* Cédula/RUC */}
        <div className={`form-group-modern ${fieldErrors.ruc_cedula && touched.ruc_cedula ? 'has-error' : ''} ${formData.ruc_cedula && !fieldErrors.ruc_cedula && touched.ruc_cedula ? 'has-success' : ''}`}>
          <label htmlFor="ruc_cedula">
            <i className="fas fa-id-card"></i>
            Cédula o RUC *
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="ruc_cedula"
              name="ruc_cedula"
              value={formData.ruc_cedula}
              onChange={handleChange}
              onBlur={() => handleBlur('ruc_cedula')}
              disabled={loading}
              placeholder="1234567890"
              maxLength={13}
            />
            {formData.ruc_cedula && !fieldErrors.ruc_cedula && touched.ruc_cedula && (
              <span className="input-success-icon">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
          <small className="field-hint">
            <i className="fas fa-info-circle"></i> Cédula (10 dígitos) o RUC (13 dígitos)
          </small>
          {fieldErrors.ruc_cedula && touched.ruc_cedula && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i> {fieldErrors.ruc_cedula}
            </span>
          )}
        </div>

        {/* Usuario */}
        <div className={`form-group-modern ${fieldErrors.usuario && touched.usuario ? 'has-error' : ''} ${formData.usuario && !fieldErrors.usuario && touched.usuario ? 'has-success' : ''}`}>
          <label htmlFor="usuario">
            <i className="fas fa-user"></i>
            Usuario *
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              onBlur={() => handleBlur('usuario')}
              disabled={loading}
              placeholder="usuario123"
              autoComplete="username"
              maxLength={30}
            />
            {formData.usuario && !fieldErrors.usuario && touched.usuario && (
              <span className="input-success-icon">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
          <small className="field-hint">
            <i className="fas fa-info-circle"></i> Solo letras, números y guion bajo (min. 3 caracteres)
          </small>
          {fieldErrors.usuario && touched.usuario && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i> {fieldErrors.usuario}
            </span>
          )}
        </div>

        {/* Email */}
        <div className={`form-group-modern ${fieldErrors.email && touched.email ? 'has-error' : ''} ${formData.email && !fieldErrors.email && touched.email ? 'has-success' : ''}`}>
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Correo Electrónico (opcional)
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              disabled={loading}
              placeholder="ejemplo@correo.com"
              autoComplete="email"
            />
            {formData.email && !fieldErrors.email && touched.email && (
              <span className="input-success-icon">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
          {fieldErrors.email && touched.email && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i> {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Teléfonos */}
        <div className="form-row-modern">
          <div className={`form-group-modern ${fieldErrors.telefono && touched.telefono ? 'has-error' : ''}`}>
            <label htmlFor="telefono">
              <i className="fas fa-phone"></i>
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={() => handleBlur('telefono')}
              disabled={loading}
              placeholder="022123456"
              maxLength={10}
            />
            {fieldErrors.telefono && touched.telefono && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.telefono}
              </span>
            )}
          </div>

          <div className={`form-group-modern ${fieldErrors.celular && touched.celular ? 'has-error' : ''}`}>
            <label htmlFor="celular">
              <i className="fas fa-mobile-alt"></i>
              Celular *
            </label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              onBlur={() => handleBlur('celular')}
              disabled={loading}
              placeholder="0991234567"
              maxLength={10}
            />
            {fieldErrors.celular && touched.celular && (
              <span className="field-error-message animated">
                <i className="fas fa-exclamation-circle"></i> {fieldErrors.celular}
              </span>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="form-group-modern">
          <label htmlFor="direccion">
            <i className="fas fa-map-marker-alt"></i>
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            disabled={loading}
            placeholder="Calle, número, sector"
          />
        </div>

        {/* Contraseña */}
        <div className={`form-group-modern ${fieldErrors.password && touched.password ? 'has-error' : ''}`}>
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Contraseña *
          </label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              disabled={loading}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password-modern"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
          {formData.password && (
            <div className="password-strength-container">
              <div className="password-strength-bar">
                <div 
                  className="password-strength-fill" 
                  style={{ 
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: passwordStrengthInfo.color
                  }}
                ></div>
              </div>
              <span className="password-strength-label" style={{ color: passwordStrengthInfo.color }}>
                {passwordStrengthInfo.label}
              </span>
            </div>
          )}
          {fieldErrors.password && touched.password && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i> {fieldErrors.password}
            </span>
          )}
          <div className="password-requirements-list">
            <p className="password-requirements-title">La contraseña debe tener:</p>
            <ul className="password-checklist">
              <li className={formData.password.length >= 8 ? 'valid' : ''}>
                <i className={`fas fa-${formData.password.length >= 8 ? 'check-circle' : 'circle'}`}></i>
                Mínimo 8 caracteres
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                <i className={`fas fa-${/[A-Z]/.test(formData.password) ? 'check-circle' : 'circle'}`}></i>
                Una letra mayúscula
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>
                <i className={`fas fa-${/[a-z]/.test(formData.password) ? 'check-circle' : 'circle'}`}></i>
                Una letra minúscula
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                <i className={`fas fa-${/[0-9]/.test(formData.password) ? 'check-circle' : 'circle'}`}></i>
                Un número
              </li>
              <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
                <i className={`fas fa-${/[^A-Za-z0-9]/.test(formData.password) ? 'check-circle' : 'circle'}`}></i>
                Un símbolo (@, #, !, etc.)
              </li>
            </ul>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div className={`form-group-modern ${fieldErrors.confirmPassword && touched.confirmPassword ? 'has-error' : ''} ${formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword ? 'has-success' : ''}`}>
          <label htmlFor="confirmPassword">
            <i className="fas fa-lock"></i>
            Confirmar Contraseña *
          </label>
          <div className="input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              disabled={loading}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="toggle-password-modern"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <i className={`fas fa-eye${showConfirmPassword ? '-slash' : ''}`}></i>
            </button>
            {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword && (
              <span className="input-success-icon">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
          {fieldErrors.confirmPassword && touched.confirmPassword && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i> {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        {/* Checkboxes */}
        <div className="form-checkboxes-modern">
          <label className="checkbox-modern">
            <input
              type="checkbox"
              checked={mayorEdad}
              onChange={(e) => setMayorEdad(e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">
              <i className="fas fa-wine-glass-alt"></i>
              Confirmo que soy mayor de 18 años *
            </span>
          </label>

          <label className="checkbox-modern">
            <input
              type="checkbox"
              checked={terminos}
              onChange={(e) => setTerminos(e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">
              <i className="fas fa-file-contract"></i>
              Acepto los términos y condiciones *
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          className="btn-modern btn-modern--primary btn-modern--large" 
          disabled={
            loading || 
            !formData.nombre1 || 
            !formData.apellido1 || 
            !formData.ruc_cedula || 
            !formData.email || 
            !formData.password || 
            !formData.confirmPassword || 
            !formData.celular ||
            !mayorEdad || 
            !terminos ||
            !!fieldErrors.nombre1 ||
            !!fieldErrors.apellido1 ||
            !!fieldErrors.apellido2 ||
            !!fieldErrors.ruc_cedula ||
            !!fieldErrors.email ||
            !!fieldErrors.password ||
            !!fieldErrors.confirmPassword ||
            !!fieldErrors.celular
          }
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Creando tu cuenta...</span>
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              <span>Crear Cuenta</span>
            </>
          )}
        </button>

        <div className="auth-footer-modern">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="link-modern" onClick={() => navigate('/login')}>
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
