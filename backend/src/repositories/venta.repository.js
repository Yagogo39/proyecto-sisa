const { conectar } = require('../config/db');

class VentaRepository {
  async create(venta) {
    const db = await conectar();
    const sql = `
      INSERT INTO Venta (fecha, hora, total, tipo_venta, idUsuario)
      VALUES (date('now'), time('now'), ?, ?, ?)
    `;
    const resultado = await db.run(sql, [venta.total, venta.tipoVenta, venta.idUsuario]);
    return { idVenta: resultado.lastID, ...venta };
  }

  async agregarDetalle(idVenta, detalle) {
    const db = await conectar();
    const sql = `
      INSERT INTO Venta_Producto (idVenta, idProducto, cantidad, precioUnitario, subTotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.run(sql, [
      idVenta,
      detalle.idProducto,
      detalle.cantidad,
      detalle.precioUnitario,
      detalle.subTotal
    ]);
  }

  async findAll({ fechaInicio, fechaFin, tipoVenta, idUsuario } = {}) {
    const db = await conectar();
    let condiciones = [];
    let params = [];

    if (fechaInicio) { condiciones.push("v.fecha >= ?"); params.push(fechaInicio); }
    if (fechaFin)    { condiciones.push("v.fecha <= ?"); params.push(fechaFin); }
    if (tipoVenta)   { condiciones.push("v.tipo_venta = ?"); params.push(tipoVenta); }
    if (idUsuario)   { condiciones.push("v.idUsuario = ?"); params.push(idUsuario); }

    const where = condiciones.length ? 'WHERE ' + condiciones.join(' AND ') : '';

    const sql = `
      SELECT v.idVenta, v.fecha, v.hora, v.total, v.tipo_venta AS tipoVenta,
             u.nombre AS empleado, u.idUsuario
      FROM Venta v
      INNER JOIN Usuario u ON v.idUsuario = u.idUsuario
      ${where}
      ORDER BY v.fecha DESC, v.hora DESC
    `;
    return await db.all(sql, params);
  }

  async findById(idVenta) {
    const db = await conectar();
    const sqlVenta = `
      SELECT v.idVenta, v.fecha, v.hora, v.total, v.tipo_venta AS tipoVenta,
             u.nombre AS empleado
      FROM Venta v
      INNER JOIN Usuario u ON v.idUsuario = u.idUsuario
      WHERE v.idVenta = ?
    `;
    const venta = await db.get(sqlVenta, [idVenta]);
    if (!venta) return null;

    const sqlDetalle = `
      SELECT vp.idProducto, p.nombre, vp.cantidad,
             vp.precioUnitario, vp.subTotal
      FROM Venta_Producto vp
      INNER JOIN Producto p ON vp.idProducto = p.idProducto
      WHERE vp.idVenta = ?
    `;
    const detalle = await db.all(sqlDetalle, [idVenta]);
    return { ...venta, detalle };
  }

  async totalDelDia(fecha) {
    const db = await conectar();
    const sql = `
      SELECT COALESCE(SUM(total), 0) AS total
      FROM Venta WHERE fecha = ?
    `;
    const resultado = await db.get(sql, [fecha]);
    return resultado.total;
  }
}

const ventaRepository = new VentaRepository();
module.exports = { VentaRepository, ventaRepository };