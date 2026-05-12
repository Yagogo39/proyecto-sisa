const express = require('express');
const cors = require('cors');
const { connectDB } = require('./src/config/db');
const { authMiddleware } = require('./src/middlewares/auth.middleware');

const userRouter = require('./src/routes/user.routes');
const categoriaRoutes = require('./src/routes/categoria.routes');
const temporadaRoutes = require('./src/routes/temporada.routes');
const proveedorRoutes = require('./src/routes/proveedor.routes');
const productoRoutes = require('./src/routes/producto.routes');
const cajaRoutes = require('./src/routes/caja.routes');
const ventaRoutes = require('./src/routes/venta.routes');
const equipoRoutes = require('./src/routes/equipo.routes');
const incidenciaRoutes = require('./src/routes/incidencia.routes');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user', userRouter);

app.use('/categorias', authMiddleware, categoriaRoutes);
app.use('/temporadas', authMiddleware, temporadaRoutes);
app.use('/proveedores', authMiddleware, proveedorRoutes);
app.use('/productos', authMiddleware, productoRoutes);
app.use('/caja', authMiddleware, cajaRoutes);
app.use('/ventas', authMiddleware, ventaRoutes);
app.use('/equipos', authMiddleware, equipoRoutes);
app.use('/incidencias', authMiddleware, incidenciaRoutes);

function initServer() {
  app.listen(3000, () =>
    console.log('Servidor corriendo en http://localhost:3000/')
  );
}

connectDB(initServer);