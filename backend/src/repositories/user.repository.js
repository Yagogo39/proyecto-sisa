const { conectar } = require('../config/db');

class UserRepository {
  async create(user) {
    const db = await conectar();
    const sql = `
      INSERT INTO Usuario
        (nombre, apellido, nombreUsuario, contrasena, estado, fechaRegistro, idRol)
      VALUES (?, ?, ?, ?, 'activo', datetime('now'), ?)
    `;
    const resultado = await db.run(sql, [
      user.nombre,
      user.apellido,
      user.nombreUsuario,
      user.contrasena,
      user.idRol
    ]);
    return { idUsuario: resultado.lastID, ...user };
  }

  async findByNombreUsuario(nombreUsuario) {
    const db = await conectar();
    const sql = `
      SELECT u.idUsuario, u.nombre, u.apellido, u.nombreUsuario,
             u.contrasena, u.estado, u.idRol, r.tipo AS rol
      FROM Usuario u
      INNER JOIN Rol r ON u.idRol = r.idRol
      WHERE u.nombreUsuario = ?
    `;
    return await db.get(sql, [nombreUsuario]);
  }

  async findById(idUsuario) {
    const db = await conectar();
    const sql = `
      SELECT u.idUsuario, u.nombre, u.apellido, u.nombreUsuario,
             u.estado, u.idRol, r.tipo AS rol
      FROM Usuario u
      INNER JOIN Rol r ON u.idRol = r.idRol
      WHERE u.idUsuario = ?
    `;
    return await db.get(sql, [idUsuario]);
  }

  async find() {
    const db = await conectar();
    const sql = `
      SELECT u.idUsuario, u.nombre, u.apellido, u.nombreUsuario,
             u.estado, u.idRol, r.tipo AS rol
      FROM Usuario u
      INNER JOIN Rol r ON u.idRol = r.idRol
    `;
    return await db.all(sql);
  }

  async updateContrasena(idUsuario, nuevoHash) {
    const db = await conectar();
    const sql = `UPDATE Usuario SET contrasena = ? WHERE idUsuario = ?`;
    const resultado = await db.run(sql, [nuevoHash, idUsuario]);
    return resultado.changes > 0;
  }
}

const userRepository = new UserRepository();
module.exports = { UserRepository, userRepository };