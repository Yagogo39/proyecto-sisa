const express = require('express');
const cors = require('cors');
const { connectDB, conectar } = require('./src/config/db');
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
const configuracionRouter = require('./src/routes/configuracion.routes');

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
app.use('/configuracion', configuracionRouter);

async function seedInicialSiHaceFalta() {
  try {
    const bcrypt = require('bcrypt');
    const db = await conectar();

    const roles = await db.all('SELECT * FROM Rol');
    if (roles.length > 0) return;

    console.log('BD vacia, creando datos iniciales...');

    await db.run(`INSERT INTO Rol (tipo) VALUES ('admin')`);
    await db.run(`INSERT INTO Rol (tipo) VALUES ('empleado')`);

    const rolAdmin = await db.get(`SELECT idRol FROM Rol WHERE tipo = 'admin'`);
    const hash = await bcrypt.hash('Admin123!', 10);
    await db.run(
      `INSERT INTO Usuario (nombre, apellido, nombreUsuario, contrasena, estado, fechaRegistro, idRol)
       VALUES (?, ?, ?, ?, 'activo', datetime('now'), ?)`,
      ['Administrador', 'Principal', 'admin', hash, rolAdmin.idRol]
    );

    await db.run(`INSERT INTO Categoria (nombre) VALUES ('Papeleria')`);
    await db.run(`INSERT INTO Categoria (nombre) VALUES ('Utiles escolares')`);
    await db.run(`INSERT INTO Categoria (nombre) VALUES ('Servicios')`);
    await db.run(`INSERT INTO Categoria (nombre) VALUES ('Manualidades')`);
    await db.run(`INSERT INTO Categoria (nombre) VALUES ('Decoracion')`);

    await db.run(
      `INSERT INTO Proveedor (nombre, telefono, email) VALUES (?, ?, ?)`,
      ['Papelera del Norte S.A.', '5512345678', 'contacto@papelera.com']
    );

    const anio = new Date().getFullYear();
    const temporadas = [
      ['Regreso a Clases', `${anio}-07-15`, `${anio}-08-31`],
      ['Dia del Nino',     `${anio}-04-15`, `${anio}-04-30`],
      ['Dia de la Madre',  `${anio}-05-01`, `${anio}-05-10`],
      ['Dia de Muertos',   `${anio}-10-15`, `${anio}-11-05`],
      ['Navidad',          `${anio}-12-01`, `${anio}-12-24`]
    ];
    for (const [nombre, inicio, fin] of temporadas) {
      await db.run(
        `INSERT INTO Temporada (nombre, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, 'inactiva')`,
        [nombre, inicio, fin]
      );
    }

    console.log('Datos iniciales creados. Usuario: admin / Contrasena: Admin123!');
  } catch (e) {
    console.error('Error al crear datos iniciales:', e.message);
  }
}

function initServer() {
  seedInicialSiHaceFalta();
  app.listen(3000, () =>
    console.log('Servidor corriendo en http://localhost:3000/')
  );
}

connectDB(initServer);