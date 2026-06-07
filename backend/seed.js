const { conectar } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    const db = await conectar();

    const rolesExistentes = await db.all(`SELECT * FROM Rol`);
    if (rolesExistentes.length === 0) {
      await db.run(`INSERT INTO Rol (tipo) VALUES ('admin')`);
      await db.run(`INSERT INTO Rol (tipo) VALUES ('empleado')`);
    }

    const rolAdmin = await db.get(`SELECT idRol FROM Rol WHERE tipo = 'admin'`);

    const adminExistente = await db.get(
      `SELECT idUsuario FROM Usuario WHERE nombreUsuario = 'admin'`
    );

    if (!adminExistente) {
      const hash = await bcrypt.hash('Admin123!', 10);

      await db.run(
        `INSERT INTO Usuario (nombre, apellido, nombreUsuario, contrasena, estado, fechaRegistro, idRol)
         VALUES (?, ?, ?, ?, 'activo', datetime('now'), ?)`,
        ['Maximino', 'Hernández Santiago', 'admin', hash, rolAdmin.idRol]
      );
    }

    const catExistente = await db.get(
      `SELECT idCategoria FROM Categoria LIMIT 1`
    );

    if (!catExistente) {
      await db.run(`INSERT INTO Categoria (nombre) VALUES ('Papelería')`);
      await db.run(`INSERT INTO Categoria (nombre) VALUES ('Útiles escolares')`);
      await db.run(`INSERT INTO Categoria (nombre) VALUES ('Servicios')`);
      await db.run(`INSERT INTO Categoria (nombre) VALUES ('Manualidades')`);
      await db.run(`INSERT INTO Categoria (nombre) VALUES ('Decoración')`);
    }

    const provExistente = await db.get(
      `SELECT idProveedor FROM Proveedor LIMIT 1`
    );

    if (!provExistente) {
      await db.run(
        `INSERT INTO Proveedor (nombre, telefono, email) VALUES (?, ?, ?)`,
        ['Papelera del Norte S.A.', '5512345678', 'contacto@papelera.com']
      );
    }

    const tempExistente = await db.get(
      `SELECT idTemporada FROM Temporada LIMIT 1`
    );

    if (!tempExistente) {
      const anioActual = new Date().getFullYear();

      const temporadas = [
        {
          nombre: 'Regreso a Clases',
          inicio: `${anioActual}-07-15`,
          fin: `${anioActual}-08-31`,
          estado: 'inactiva'
        },
        {
          nombre: 'Día del Niño',
          inicio: `${anioActual}-04-15`,
          fin: `${anioActual}-04-30`,
          estado: 'inactiva'
        },
        {
          nombre: 'Día de la Madre',
          inicio: `${anioActual}-05-01`,
          fin: `${anioActual}-05-10`,
          estado: 'inactiva'
        },
        {
          nombre: 'Día de Muertos',
          inicio: `${anioActual}-10-15`,
          fin: `${anioActual}-11-05`,
          estado: 'inactiva'
        },
        {
          nombre: 'Navidad',
          inicio: `${anioActual}-12-01`,
          fin: `${anioActual}-12-24`,
          estado: 'inactiva'
        }
      ];

      for (const t of temporadas) {
        await db.run(
          `INSERT INTO Temporada (nombre, fecha_inicio, fecha_fin, estado)
           VALUES (?, ?, ?, ?)`,
          [t.nombre, t.inicio, t.fin, t.estado]
        );
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

seed();