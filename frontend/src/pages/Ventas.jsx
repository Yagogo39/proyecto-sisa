import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Ventas() {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [efectivo, setEfectivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/productos').then(r => setProductos(r.data)).catch(() => {});
  }, []);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(i => i.idProducto === producto.idProducto);
    if (existe) {
      if (existe.cantidad >= producto.stockActual) {
        setError(`Stock máximo disponible: ${producto.stockActual}`);
        return;
      }
      setCarrito(carrito.map(i =>
        i.idProducto === producto.idProducto
          ? { ...i, cantidad: i.cantidad + 1, subTotal: (i.cantidad + 1) * i.precioUnitario }
          : i
      ));
    } else {
      setCarrito([...carrito, {
        idProducto: producto.idProducto,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precioVenta,
        subTotal: producto.precioVenta
      }]);
    }
    setError('');
  };

  const quitarDelCarrito = (idProducto) => {
    setCarrito(carrito.filter(i => i.idProducto !== idProducto));
  };

  const cambiarCantidad = (idProducto, cantidad) => {
    if (cantidad < 1) return;
    setCarrito(carrito.map(i =>
      i.idProducto === idProducto
        ? { ...i, cantidad, subTotal: cantidad * i.precioUnitario }
        : i
    ));
  };

  const total = carrito.reduce((acc, i) => acc + i.subTotal, 0);
  const cambio = efectivo ? parseFloat(efectivo) - total : 0;

  const confirmarVenta = async () => {
    if (carrito.length === 0) { setError('Agrega al menos un producto'); return; }
    if (!efectivo || parseFloat(efectivo) < total) { setError('Efectivo insuficiente'); return; }
    try {
      await api.post('/ventas', {
        idUsuario: usuario.idUsuario,
        efectivo: parseFloat(efectivo),
        productos: carrito.map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad }))
      });
      setMensaje('Venta registrada correctamente');
      setCarrito([]);
      setEfectivo('');
      setError('');
      api.get('/productos').then(r => setProductos(r.data));
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar venta');
    }
  };

  return (
    <div>
      <h2>Ventas</h2>
      {mensaje && <p style={styles.exito}>{mensaje}</p>}
      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.contenedor}>
        {/* Buscador y lista de productos */}
        <div style={styles.izquierda}>
          <input
            style={styles.input}
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <div style={styles.listaProductos}>
            {productosFiltrados.map(p => (
              <div key={p.idProducto} style={styles.productoItem}>
                <div>
                  <p style={styles.nombreProducto}>{p.nombre}</p>
                  <p style={styles.precioProducto}>${p.precioVenta} — Stock: {p.stockActual}</p>
                </div>
                <button style={styles.btnAgregar} onClick={() => agregarAlCarrito(p)}>
                  + Agregar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div style={styles.derecha}>
          <h3>Venta actual</h3>
          {carrito.length === 0
            ? <p style={{ color: '#aaa' }}>Sin productos</p>
            : carrito.map(item => (
              <div key={item.idProducto} style={styles.carritoItem}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '13px' }}>{item.nombre}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>${item.precioUnitario} c/u</p>
                </div>
                <div style={styles.cantidadControl}>
                  <button style={styles.btnCantidad} onClick={() => cambiarCantidad(item.idProducto, item.cantidad - 1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button style={styles.btnCantidad} onClick={() => cambiarCantidad(item.idProducto, item.cantidad + 1)}>+</button>
                </div>
                <p style={{ margin: 0, minWidth: '60px', textAlign: 'right' }}>${item.subTotal.toFixed(2)}</p>
                <button style={styles.btnEliminar} onClick={() => quitarDelCarrito(item.idProducto)}>🗑</button>
              </div>
            ))
          }

          <div style={styles.totalSection}>
            <div style={styles.totalRow}>
              <span>Importe:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div style={styles.totalRow}>
              <span>Efectivo:</span>
              <input
                style={{ ...styles.input, width: '100px' }}
                type="number"
                value={efectivo}
                onChange={e => setEfectivo(e.target.value)}
                placeholder="$0.00"
              />
            </div>
            <div style={styles.totalRow}>
              <span>Cambio:</span>
              <strong style={{ color: cambio >= 0 ? '#27ae60' : '#e74c3c' }}>
                ${cambio.toFixed(2)}
              </strong>
            </div>
            <button style={styles.btnConfirmar} onClick={confirmarVenta}>
              Confirmar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  contenedor: { display: 'flex', gap: '20px', marginTop: '16px' },
  izquierda: { flex: 1, backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  derecha: { width: '340px', backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' },
  listaProductos: { maxHeight: '400px', overflowY: 'auto' },
  productoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' },
  nombreProducto: { margin: 0, fontWeight: 'bold', fontSize: '14px' },
  precioProducto: { margin: 0, fontSize: '12px', color: '#888' },
  btnAgregar: { backgroundColor: '#1a1a2e', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
  carritoItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '1px solid #eee' },
  cantidadControl: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' },
  btnCantidad: { background: '#eee', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnEliminar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  totalSection: { marginTop: '16px', borderTop: '2px solid #eee', paddingTop: '12px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  btnConfirmar: { width: '100%', padding: '12px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  exito: { backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '6px' },
  error: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px' }
};