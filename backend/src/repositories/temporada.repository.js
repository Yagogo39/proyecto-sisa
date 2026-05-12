const { conectar } = require('../config/db');

class TemporadaRepository {
  async create(temporada) {
    const db = await conectar();
    const sql = `
      INSERT INTO Temporada (nombre, fecha_inicio, fecha_fin, estado)
      VALUES (?, ?, ?, ?)
    `;
    const resultado = await db.run(sql, [
      temporada.nombre,
      temporada.fecha_inicio,
      temporada.fecha_fin,
      temporada.estado || 'inactiva'
    ]);
    return { idTemporada: resultado.lastID, ...temporada };
  }

  async findAll() {
    const db = await conectar();
    const sql = `
      SELECT idTemporada, nombre, fecha_inicio, fecha_fin, estado
      FROM Temporada
      ORDER BY fecha_inicio DESC
    `;
    return await db.all(sql);
  }

  async findById(idTemporada) {
    const db = await conectar();
    const sql = `
      SELECT idTemporada, nombre, fecha_inicio, fecha_fin, estado
      FROM Temporada WHERE idTemporada = ?
    `;
    return await db.get(sql, [idTemporada]);
  }

  async findActiva() {
    const db = await conectar();
    const sql = `
      SELECT idTemporada, nombre, fecha_inicio, fecha_fin, estado
      FROM Temporada WHERE estado = 'activa' LIMIT 1
    `;
    return await db.get(sql);
  }

  async update(idTemporada, datos) {
    const db = await conectar();
    const sql = `
      UPDATE Temporada
      SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?
      WHERE idTemporada = ?
    `;
    const resultado = await db.run(sql, [
      datos.nombre,
      datos.fecha_inicio,
      datos.fecha_fin,
      datos.estado,
      idTemporada
    ]);
    return resultado.changes > 0;
  }

  async desactivarTodas() {
    const db = await conectar();
    const sql = `UPDATE Temporada SET estado = 'inactiva' WHERE estado = 'activa'`;
    await db.run(sql);
  }

  async activar(idTemporada) {
    const db = await conectar();
    await this.desactivarTodas();
    const sql = `UPDATE Temporada SET estado = 'activa' WHERE idTemporada = ?`;
    const resultado = await db.run(sql, [idTemporada]);
    return resultado.changes > 0;
  }

  async delete(idTemporada) {
    const db = await conectar();
    const sql = `DELETE FROM Temporada WHERE idTemporada = ?`;
    const resultado = await db.run(sql, [idTemporada]);
    return resultado.changes > 0;
  }
}

const temporadaRepository = new TemporadaRepository();
module.exports = { TemporadaRepository, temporadaRepository };