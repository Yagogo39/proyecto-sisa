import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuAdmin = [
    { label: '⊞ Inicio', ruta: '/home' },
    { label: '🛒 Compras', ruta: '/compras' },
    { label: '🛍 Ventas', ruta: '/ventas' },
    { label: '📦 Inventario', ruta: '/inventario' },
    { label: '📊 Estadísticas', ruta: '/estadisticas' },
    { label: '🖥 Control de Equipos', ruta: '/equipos' },
  ];

  const menuEmpleado = [
    { label: '⊞ Inicio', ruta: '/home' },
    { label: '🛍 Ventas', ruta: '/ventas' },
    { label: '📦 Inventario', ruta: '/inventario' },
    { label: '🖥 Control de Equipos', ruta: '/equipos' },
  ];

  const menu = usuario?.rol === 'admin' ? menuAdmin : menuEmpleado;

  return (
    <div style={styles.contenedor}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>Papelería "Don Max"</div>
        <nav style={styles.nav}>
          {menu.map((item) => (
            <button
              key={item.ruta}
              style={styles.menuItem}
              onClick={() => navigate(item.ruta)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button style={styles.cerrarSesion} onClick={handleLogout}>
          → Cerrar Sesión
        </button>
      </div>
      <div style={styles.contenido}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  contenedor: { display: 'flex', height: '100vh', fontFamily: 'sans-serif' },
  sidebar: {
    width: '220px', backgroundColor: '#1a1a2e', color: '#fff',
    display: 'flex', flexDirection: 'column', padding: '20px 0'
  },
  logo: {
    padding: '0 20px 20px', fontSize: '14px', fontWeight: 'bold',
    borderBottom: '1px solid #333', marginBottom: '12px'
  },
  nav: { display: 'flex', flexDirection: 'column', flex: 1 },
  menuItem: {
    background: 'none', border: 'none', color: '#ccc',
    textAlign: 'left', padding: '12px 20px', cursor: 'pointer',
    fontSize: '14px', transition: 'background 0.2s'
  },
  cerrarSesion: {
    background: 'none', border: 'none', color: '#e74c3c',
    textAlign: 'left', padding: '12px 20px', cursor: 'pointer', fontSize: '14px'
  },
  contenido: { flex: 1, backgroundColor: '#f5f5f5', overflowY: 'auto', padding: '24px' }
};