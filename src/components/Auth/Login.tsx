import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la página de origen desde el state de location
  const from = (location.state as any)?.from || '/';

  // Validaciones en tiempo real
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'El email es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Formato de email inválido';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'La contraseña es requerida';
    }
    if (value.length < 6) {
      return 'Mínimo 6 caracteres';
    }
    return undefined;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(''); // Limpiar error general
    
    // Validar después de que el usuario escriba
    if (touched.email) {
      const error = validateEmail(value);
      setFieldErrors(prev => ({ ...prev, email: error }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError(''); // Limpiar error general
    
    // Validar después de que el usuario escriba
    if (touched.password) {
      const error = validatePassword(value);
      setFieldErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      const error = validateEmail(email);
      setFieldErrors(prev => ({ ...prev, email: error }));
    } else {
      const error = validatePassword(password);
      setFieldErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar todos los campos
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError,
        password: passwordError
      });
      setError('Por favor, corrige los errores antes de continuar');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Redirigir a la página de origen o al inicio
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form modern-auth-form">
      <div className="auth-form-icon">
        <i className="fas fa-lock"></i>
      </div>
      
      {error && (
        <div className="alert-error modern-alert" role="alert" aria-live="assertive">
          <i className="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Error de autenticación</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="modern-form">
        <div className={`form-group-modern ${fieldErrors.email && touched.email ? 'has-error' : ''} ${email && !fieldErrors.email ? 'has-success' : ''}`}>
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Correo Electrónico
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              placeholder="ejemplo@correo.com"
              disabled={loading}
              autoComplete="email"
              tabIndex={1}
              aria-describedby={fieldErrors.email && touched.email ? "email-error" : undefined}
              aria-invalid={fieldErrors.email && touched.email ? "true" : "false"}
            />
            {email && !fieldErrors.email && (
              <span className="input-success-icon">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
          {fieldErrors.email && touched.email && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i>
              {fieldErrors.email}
            </span>
          )}
        </div>

        <div className={`form-group-modern ${fieldErrors.password && touched.password ? 'has-error' : ''} ${password && !fieldErrors.password ? 'has-success' : ''}`}>
          <label htmlFor="password">
            <i className="fas fa-key"></i>
            Contraseña
          </label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              autoComplete="current-password"              tabIndex={2}
              aria-describedby={fieldErrors.password && touched.password ? "password-error" : undefined}
              aria-invalid={fieldErrors.password && touched.password ? "true" : "false"}            />
            <button
              type="button"
              className="toggle-password-modern"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              tabIndex={-1}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
            </button>
          </div>
          {fieldErrors.password && touched.password && (
            <span className="field-error-message animated">
              <i className="fas fa-exclamation-circle"></i>
              {fieldErrors.password}
            </span>
          )}
        </div>

        <button type="submit" className="btn-modern btn-modern--primary" disabled={loading || !!fieldErrors.email || !!fieldErrors.password}>
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Verificando credenciales...</span>
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>

        <div className="auth-footer-modern">
          <p>
            ¿No tienes cuenta?{' '}
            <button type="button" className="link-modern" onClick={() => navigate('/register')}>
              Regístrate aquí
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
