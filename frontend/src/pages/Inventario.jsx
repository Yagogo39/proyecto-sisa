import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Inventario() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarProductos = () => {
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {});
  };

  useEffect(() => { cargarProductos(); }, []);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setMensaje('Producto eliminado');
      cargarProductos();
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div>
      <h2>Inventario</h2>
      {mensaje && <p style={styles.exito}>{mensaje}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.toolbar}>
        <input
          style={styles.input}
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      <div style={styles.tabla}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Categoría</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Mín</th>
              {usuario?.rol === 'admin' && <th style={styles.th}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.idProducto} style={{
                backgroundColor: p.stockActual <= p.stockMinimo ? '#fff3cd' : '#fff'
              }}>
                <td style={styles.td}>{p.idProducto}</td>
                <td style={styles.td}>{p.nombre}</td>
                <td style={styles.td}>{p.categoria || '—'}</td>
                <td style={styles.td}>${p.precioVenta}</td>
                <td style={{ ...styles.td, color: p.stockActual <= p.stockMinimo ? '#e74c3c' : '#000', fontWeight: 'bold' }}>
                  {p.stockActual}
                </td>
                <td style={styles.td}>{p.stockMinimo}</td>
                {usuario?.rol === 'admin' && (
                  <td style={styles.td}>
                    <button style={styles.btnEliminar} onClick={() => eliminar(p.idProducto)}>
                      🗑 Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {productosFiltrados.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>Sin productos</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  toolbar: { display: 'flex', gap: '12px', marginBottom: '16px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', width: '300px' },
  tabla: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  thead: { backgroundColor: '#1a1a2e', color: '#fff' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px' },
  td: { padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #eee' },
  btnEliminar: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '13px' },
  exito: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', marginBottom: '12px' }
};