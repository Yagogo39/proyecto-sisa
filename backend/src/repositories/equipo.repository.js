const { conectar } = require('../config/db');

class EquipoRepository {
  async create(equipo) {
    const db = await conectar();
    const sql = `INSERT INTO EquipoCyber (numero, estado) VALUES (?, 'disponible')`;
    const resultado = await db.run(sql, [equipo.numero]);
    return { idEquipo: resultado.lastID, numero: equipo.numero, estado: 'disponible' };
  }

  async findAll() {
    const db = await conectar();
    return await db.all(`
      SELECT e.idEquipo, e.numero, e.estado, e.tiempo_transcurrido, e.idUsuario,
             u.nombre AS nombreUsuario
      FROM EquipoCyber e
      LEFT JOIN Usuario u ON e.idUsuario = u.idUsuario
      ORDER BY e.numero ASC
    `);
  }

  async findById(idEquipo) {
    const db = await conectar();
    return await db.get(`SELECT * FROM EquipoCyber WHERE idEquipo = ?`, [idEquipo]);
  }

  async findByNumero(numero) {
    const db = await conectar();
    return await db.get(`SELECT * FROM EquipoCyber WHERE numero = ?`, [numero]);
  }

  async iniciarSesion(idEquipo, idUsuario, tiempoInicio) {
    const db = await conectar();
    const sql = `
      UPDATE EquipoCyber
      SET estado = 'en_uso', tiempo_transcurrido = ?, idUsuario = ?
      WHERE idEquipo = ?
    `;
    const resultado = await db.run(sql, [tiempoInicio, idUsuario, idEquipo]);
    return resultado.changes > 0;
  }

  async finalizarSesion(idEquipo) {
    const db = await conectar();
    const sql = `
      UPDATE EquipoCyber
      SET estado = 'disponible', tiempo_transcurrido = NULL, idUsuario = NULL
      WHERE idEquipo = ?
    `;
    const resultado = await db.run(sql, [idEquipo]);
    return resultado.changes > 0;
  }
  
  async cambiarEstado(idEquipo, estado) {
    const db = await conectar();
    const sql = `UPDATE EquipoCyber SET estado = ? WHERE idEquipo = ?`;
    const resultado = await db.run(sql, [estado, idEquipo]);
    return resultado.changes > 0;
  }

  async delete(idEquipo) {
    const db = await conectar();
    const resultado = await db.run(`DELETE FROM EquipoCyber WHERE idEquipo = ?`, [idEquipo]);
    return resultado.changes > 0;
  }
}

const equipoRepository = new EquipoRepository();
module.exports = { EquipoRepository, equipoRepository };