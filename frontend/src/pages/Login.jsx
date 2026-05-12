import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ nombreUsuario: '', contrasena: '', rol: 'admin' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [formRecuperar, setFormRecuperar] = useState({ nombreUsuario: '', nuevaContrasena: '', confirmarContrasena: '' });
  const [mensajeRecuperar, setMensajeRecuperar] = useState('');
  const [errorRecuperar, setErrorRecuperar] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangeRecuperar = (e) => {
    setFormRecuperar({ ...formRecuperar, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api.post('/user/ingresar', form);
      login(res.data.usuario, res.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const handleRecuperar = async (e) => {
    e.preventDefault();
    setErrorRecuperar('');
    setMensajeRecuperar('');
    try {
      await api.patch('/user/cambiar-contrasena', formRecuperar);
      setMensajeRecuperar('Contraseña actualizada correctamente');
      setFormRecuperar({ nombreUsuario: '', nuevaContrasena: '', confirmarContrasena: '' });
      setTimeout(() => {
        setMostrarRecuperar(false);
        setMensajeRecuperar('');
      }, 2000);
    } catch (err) {
      setErrorRecuperar(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  if (mostrarRecuperar) {
    return (
      <div style={styles.fondo}>
        <div style={styles.caja}>
          <h2 style={styles.titulo}>Recuperar Contraseña</h2>
          <h3 style={styles.subtitulo}>Nueva Contraseña</h3>

          {mensajeRecuperar && <p style={styles.exito}>{mensajeRecuperar}</p>}
          {errorRecuperar && <p style={styles.error}>{errorRecuperar}</p>}

          <form onSubmit={handleRecuperar}>
            <div style={styles.campo}>
              <label>Nombre de usuario</label>
              <input
                style={styles.input}
                type="text"
                name="nombreUsuario"
                value={formRecuperar.nombreUsuario}
                onChange={handleChangeRecuperar}
                placeholder="Tu usuario"
                required
              />
            </div>
            <div style={styles.campo}>
              <label>Nueva contraseña</label>
              <input
                style={styles.input}
                type="password"
                name="nuevaContrasena"
                value={formRecuperar.nuevaContrasena}
                onChange={handleChangeRecuperar}
                placeholder="Mín. 8 caracteres"
                required
              />
            </div>
            <div style={styles.campo}>
              <label>Confirmar contraseña</label>
              <input
                style={styles.input}
                type="password"
                name="confirmarContrasena"
                value={formRecuperar.confirmarContrasena}
                onChange={handleChangeRecuperar}
                placeholder="Repite la contraseña"
                required
              />
            </div>
            <button style={styles.boton} type="submit">Cambiar contraseña</button>
          </form>

          <p style={styles.link} onClick={() => setMostrarRecuperar(false)}>
            ← Volver al inicio
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.fondo}>
      <div style={styles.caja}>
        <h2 style={styles.titulo}>Papelería "Don Max"</h2>
        <h3 style={styles.subtitulo}>Inicio de Sesión</h3>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={styles.campo}>
            <label>Nombre de usuario</label>
            <input
              style={styles.input}
              type="text"
              name="nombreUsuario"
              value={form.nombreUsuario}
              onChange={handleChange}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>

          <div style={styles.campo}>
            <label>Rol de usuario</label>
            <select style={styles.input} name="rol" value={form.rol} onChange={handleChange}>
              <option value="admin">Administrador</option>
              <option value="empleado">Empleado</option>
            </select>
          </div>

          <div style={styles.campo}>
            <label>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              name="contrasena"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <p style={styles.link} onClick={() => setMostrarRecuperar(true)}>
            ¿Olvidaste tu contraseña?
          </p>

          <button style={styles.boton} type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Acceder'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  fondo: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', backgroundColor: '#1a1a2e'
  },
  caja: {
    backgroundColor: '#fff', padding: '40px', borderRadius: '12px',
    width: '360px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
  },
  titulo: { textAlign: 'center', color: '#1a1a2e', marginBottom: '4px' },
  subtitulo: { textAlign: 'center', color: '#555', marginBottom: '24px', fontWeight: 'normal' },
  campo: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  input: {
    padding: '10px', borderRadius: '6px', border: '1px solid #ccc',
    fontSize: '14px', outline: 'none'
  },
  boton: {
    width: '100%', padding: '12px', backgroundColor: '#1a1a2e',
    color: '#fff', border: 'none', borderRadius: '6px',
    fontSize: '16px', cursor: 'pointer', marginTop: '8px'
  },
  error: { color: 'red', textAlign: 'center', marginBottom: '12px', fontSize: '14px' },
  exito: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  link: { color: '#1a1a2e', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', marginBottom: '8px' }
};