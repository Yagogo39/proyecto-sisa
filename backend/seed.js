const { conectar } = require('./src/config/db');
const { hashearContrasena } = require('./src/utils/hashPassword');

(async () => {
  const db = await conectar();

  await db.run(`INSERT OR IGNORE INTO Rol (idRol, tipo) VALUES (1, 'admin')`);
  await db.run(`INSERT OR IGNORE INTO Rol (idRol, tipo) VALUES (2, 'empleado')`);

  const existeAdmin = await db.get(
    `SELECT idUsuario FROM Usuario WHERE nombreUsuario = 'admin'`
  );

  if (!existeAdmin) {
    const hash = await hashearContrasena('Admin123!');
    await db.run(
      `INSERT INTO Usuario
         (nombre, apellido, nombreUsuario, contrasena, estado, fechaRegistro, idRol)
       VALUES (?, ?, ?, ?, 'activo', datetime('now'), 1)`,
      ['Maximino', 'Hernández Santiago', 'admin', hash]
    );
    console.log('Usuario admin creado: admin / Admin123!');
  } else {
    console.log('El usuario admin ya existe.');
  }

  process.exit(0);
})();