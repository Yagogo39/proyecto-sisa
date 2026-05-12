const { conectar } = require('../config/db');

class CajaRepository {
  async create(caja) {
    const db = await conectar();
    const sql = `
      INSERT INTO Caja
        (fecha, horaApertura, montoInicial, estado, idUsuario)
      VALUES (date('now'), time('now'), ?, 'abierta', ?)
    `;
    const resultado = await db.run(sql, [caja.montoInicial, caja.idUsuario]);
    return { idCaja: resultado.lastID, ...caja, estado: 'abierta' };
  }

  async findAbierta() {
    const db = await conectar();
    const sql = `
      SELECT c.idCaja, c.fecha, c.horaApertura, c.montoInicial, c.estado,
             c.idUsuario, u.nombre AS nombreUsuario
      FROM Caja c
      INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
      WHERE c.estado = 'abierta'
      LIMIT 1
    `;
    return await db.get(sql);
  }

  async findById(idCaja) {
    const db = await conectar();
    const sql = `
      SELECT c.idCaja, c.fecha, c.horaApertura, c.horaCierre, c.montoInicial,
             c.montoFinal, c.total_ventas_calculado, c.diferencia, c.estado,
             c.idUsuario, u.nombre AS nombreUsuario
      FROM Caja c
      INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
      WHERE c.idCaja = ?
    `;
    return await db.get(sql, [idCaja]);
  }

  async findAll() {
    const db = await conectar();
    const sql = `
      SELECT c.idCaja, c.fecha, c.horaApertura, c.horaCierre, c.montoInicial,
             c.montoFinal, c.total_ventas_calculado, c.diferencia, c.estado,
             u.nombre AS nombreUsuario
      FROM Caja c
      INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
      ORDER BY c.fecha DESC, c.horaApertura DESC
    `;
    return await db.all(sql);
  }

  async calcularTotalVentas(idCaja) {
    const db = await conectar();
    const caja = await this.findById(idCaja);
    if (!caja) return 0;

    const sql = `
      SELECT COALESCE(SUM(total), 0) AS totalVentas
      FROM Venta
      WHERE date(fecha) = ? AND time(hora) >= ?
        AND (? IS NULL OR time(hora) <= ?)
    `;
    const resultado = await db.get(sql, [
      caja.fecha,
      caja.horaApertura,
      caja.horaCierre,
      caja.horaCierre
    ]);
    return resultado.totalVentas || 0;
  }

  async cerrar(idCaja, montoFinal, totalVentasCalculado, diferencia) {
    const db = await conectar();
    const sql = `
      UPDATE Caja
      SET horaCierre = time('now'),
          montoFinal = ?,
          total_ventas_calculado = ?,
          diferencia = ?,
          estado = 'cerrada'
      WHERE idCaja = ?
    `;
    const resultado = await db.run(sql, [montoFinal, totalVentasCalculado, diferencia, idCaja]);
    return resultado.changes > 0;
  }
}

const cajaRepository = new CajaRepository();
module.exports = { CajaRepository, cajaRepository };