const { conectar } = require('../config/db');

class IncidenciaRepository {
  async create(incidencia) {
    const db = await conectar();
    const sql = `
      INSERT INTO Incidencia (fecha, hora, descripcion, estado, idUsuario)
      VALUES (date('now'), time('now'), ?, 'pendiente', ?)
    `;
    const resultado = await db.run(sql, [incidencia.descripcion, incidencia.idUsuario]);
    return { idIncidencia: resultado.lastID, ...incidencia, estado: 'pendiente' };
  }

  async findAll() {
    const db = await conectar();
    return await db.all(`
      SELECT i.idIncidencia, i.fecha, i.hora, i.descripcion, i.estado,
             u.nombre AS empleado, i.idUsuario
      FROM Incidencia i
      INNER JOIN Usuario u ON i.idUsuario = u.idUsuario
      ORDER BY i.fecha DESC, i.hora DESC
    `);
  }

  async findById(idIncidencia) {
    const db = await conectar();
    return await db.get(`
      SELECT i.idIncidencia, i.fecha, i.hora, i.descripcion, i.estado,
             u.nombre AS empleado, i.idUsuario
      FROM Incidencia i
      INNER JOIN Usuario u ON i.idUsuario = u.idUsuario
      WHERE i.idIncidencia = ?
    `, [idIncidencia]);
  }

  async findPendientes() {
    const db = await conectar();
    return await db.all(`
      SELECT i.idIncidencia, i.fecha, i.hora, i.descripcion, i.estado,
             u.nombre AS empleado
      FROM Incidencia i
      INNER JOIN Usuario u ON i.idUsuario = u.idUsuario
      WHERE i.estado = 'pendiente'
      ORDER BY i.fecha DESC, i.hora DESC
    `);
  }

  async resolver(idIncidencia) {
    const db = await conectar();
    const resultado = await db.run(
      `UPDATE Incidencia SET estado = 'resuelto' WHERE idIncidencia = ?`,
      [idIncidencia]
    );
    return resultado.changes > 0;
  }
}

const incidenciaRepository = new IncidenciaRepository();
module.exports = { IncidenciaRepository, incidenciaRepository };