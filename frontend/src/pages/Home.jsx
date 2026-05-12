import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const { usuario } = useAuth();
  const [totalDia, setTotalDia] = useState(0);
  const [stockBajo, setStockBajo] = useState([]);

  useEffect(() => {
    api.get('/ventas/total-dia').then(r => setTotalDia(r.data.total)).catch(() => {});
    api.get('/productos/alertas-stock').then(r => setStockBajo(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h2>Panel de Control</h2>
      <p style={{ color: '#888' }}>Bienvenido, {usuario?.nombre} — {usuario?.rol}</p>

      <div style={styles.tarjetas}>
        <div style={styles.tarjeta}>
          <p style={styles.labelTarjeta}>Ventas del día</p>
          <h3 style={styles.valorTarjeta}>${Number(totalDia).toFixed(2)}</h3>
        </div>
        <div style={styles.tarjeta}>
          <p style={styles.labelTarjeta}>Alertas de stock bajo</p>
          <h3 style={{ ...styles.valorTarjeta, color: stockBajo.length > 0 ? '#e74c3c' : '#27ae60' }}>
            {stockBajo.length} productos
          </h3>
        </div>
      </div>

      {stockBajo.length > 0 && (
        <div style={styles.alertas}>
          <h4>⚠ Productos con stock bajo</h4>
          {stockBajo.map(p => (
            <div key={p.idProducto} style={styles.alertaItem}>
              <span>{p.nombre}</span>
              <span style={{ color: '#e74c3c' }}>Stock: {p.stockActual} / Mín: {p.stockMinimo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  tarjetas: { display: 'flex', gap: '16px', marginTop: '20px' },
  tarjeta: {
    backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minWidth: '180px'
  },
  labelTarjeta: { color: '#888', fontSize: '13px', margin: 0 },
  valorTarjeta: { margin: '8px 0 0', fontSize: '24px', color: '#1a1a2e' },
  alertas: {
    marginTop: '24px', backgroundColor: '#fff', padding: '16px',
    borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  alertaItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '14px'
  }
};