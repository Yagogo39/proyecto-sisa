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
             c.idUsuario, u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario
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
             c.montoFinal, c.total_ventas_calculado, c.diferencia, c.observaciones,
             c.estado, c.idUsuario,
             u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario,
             c.idUsuarioCierre,
             uc.nombre AS nombreUsuarioCierre, uc.apellido AS apellidoUsuarioCierre
      FROM Caja c
      INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
      LEFT JOIN Usuario uc ON c.idUsuarioCierre = uc.idUsuario
      WHERE c.idCaja = ?
    `;
    return await db.get(sql, [idCaja]);
  }

  async findAll() {
    const db = await conectar();
    const sql = `
      SELECT c.idCaja, c.fecha, c.horaApertura, c.horaCierre, c.montoInicial,
             c.montoFinal, c.total_ventas_calculado, c.diferencia, c.observaciones, c.estado,
             u.nombre AS nombreUsuario, u.apellido AS apellidoUsuario,
             uc.nombre AS nombreUsuarioCierre, uc.apellido AS apellidoUsuarioCierre
      FROM Caja c
      INNER JOIN Usuario u ON c.idUsuario = u.idUsuario
      LEFT JOIN Usuario uc ON c.idUsuarioCierre = uc.idUsuario
      ORDER BY c.fecha DESC, c.horaApertura DESC
    `;
    return await db.all(sql);
  }

  async calcularTotalVentas(idCaja) {
    const db = await conectar();
    const sql = `
      SELECT COALESCE(SUM(total), 0) AS totalVentas
      FROM Venta
      WHERE idCaja = ?
    `;
    const resultado = await db.get(sql, [idCaja]);
    return resultado.totalVentas || 0;
  }

  async desgloseVentas(idCaja) {
    const db = await conectar();
    const sql = `
      SELECT tipo_venta AS tipo, COUNT(*) AS cantidad, COALESCE(SUM(total), 0) AS total
      FROM Venta
      WHERE idCaja = ?
      GROUP BY tipo_venta
    `;
    return await db.all(sql, [idCaja]);
  }

  async ventasDeCaja(idCaja) {
    const db = await conectar();
    const sql = `
      SELECT v.idVenta, v.fecha, v.hora, v.total, v.tipo_venta AS tipoVenta,
             v.descripcion, u.nombre AS empleado, u.apellido AS apellidoEmpleado
      FROM Venta v
      INNER JOIN Usuario u ON v.idUsuario = u.idUsuario
      WHERE v.idCaja = ?
      ORDER BY v.hora ASC
    `;
    return await db.all(sql, [idCaja]);
  }

  async empleadosDeCaja(idCaja) {
    const db = await conectar();
    const sql = `
      SELECT DISTINCT u.idUsuario, u.nombre, u.apellido,
             COUNT(v.idVenta) AS cantidadVentas,
             COALESCE(SUM(v.total), 0) AS totalVendido
      FROM Venta v
      INNER JOIN Usuario u ON v.idUsuario = u.idUsuario
      WHERE v.idCaja = ?
      GROUP BY u.idUsuario, u.nombre, u.apellido
      ORDER BY totalVendido DESC
    `;
    return await db.all(sql, [idCaja]);
  }

  async cerrar(idCaja, { montoFinal, totalVentasCalculado, diferencia, observaciones, idUsuarioCierre }) {
    const db = await conectar();
    const sql = `
      UPDATE Caja
      SET horaCierre = time('now'),
          montoFinal = ?,
          total_ventas_calculado = ?,
          diferencia = ?,
          observaciones = ?,
          idUsuarioCierre = ?,
          estado = 'cerrada'
      WHERE idCaja = ?
    `;
    const resultado = await db.run(sql, [
      montoFinal,
      totalVentasCalculado,
      diferencia,
      observaciones || null,
      idUsuarioCierre,
      idCaja
    ]);
    return resultado.changes > 0;
  }
}

const cajaRepository = new CajaRepository();
module.exports = { CajaRepository, cajaRepository };