const { conectar } = require('../config/db');

class ProductoRepository {
  async create(producto) {
    const db = await conectar();
    const sql = `
      INSERT INTO Producto
        (nombre, precioVenta, stockActual, stockMinimo, fechaRegistro, estado, idCategoria, idTemporada)
      VALUES (?, ?, ?, ?, datetime('now'), 'activo', ?, ?)
    `;
    const resultado = await db.run(sql, [
      producto.nombre,
      producto.precioVenta,
      producto.stockActual,
      producto.stockMinimo,
      producto.idCategoria,
      producto.idTemporada || null
    ]);
    return { idProducto: resultado.lastID, ...producto };
  }

  async vincularProveedor(idProducto, idProveedor, precioCompra) {
    const db = await conectar();
    const sql = `
      INSERT INTO Proveedor_Producto (idProveedor, idProducto, precioCompra)
      VALUES (?, ?, ?)
    `;
    await db.run(sql, [idProveedor, idProducto, precioCompra]);
  }

  async findAll() {
    const db = await conectar();
    const sql = `
      SELECT p.idProducto, p.nombre, p.precioVenta, p.stockActual, p.stockMinimo,
             p.fechaRegistro, p.estado, p.idCategoria, c.nombre AS categoria,
             p.idTemporada, t.nombre AS temporada
      FROM Producto p
      LEFT JOIN Categoria c ON p.idCategoria = c.idCategoria
      LEFT JOIN Temporada t ON p.idTemporada = t.idTemporada
      WHERE p.estado = 'activo'
      ORDER BY p.nombre ASC
    `;
    return await db.all(sql);
  }

  async findById(idProducto) {
    const db = await conectar();
    const sql = `
      SELECT p.idProducto, p.nombre, p.precioVenta, p.stockActual, p.stockMinimo,
             p.fechaRegistro, p.estado, p.idCategoria, c.nombre AS categoria,
             p.idTemporada, t.nombre AS temporada
      FROM Producto p
      LEFT JOIN Categoria c ON p.idCategoria = c.idCategoria
      LEFT JOIN Temporada t ON p.idTemporada = t.idTemporada
      WHERE p.idProducto = ?
    `;
    return await db.get(sql, [idProducto]);
  }

  async findByNombre(nombre) {
    const db = await conectar();
    const sql = `SELECT idProducto FROM Producto WHERE nombre = ? AND estado = 'activo'`;
    return await db.get(sql, [nombre]);
  }

  async findStockBajo() {
    const db = await conectar();
    const sql = `
      SELECT p.idProducto, p.nombre, p.stockActual, p.stockMinimo, c.nombre AS categoria
      FROM Producto p
      LEFT JOIN Categoria c ON p.idCategoria = c.idCategoria
      WHERE p.stockActual <= p.stockMinimo AND p.estado = 'activo'
      ORDER BY p.stockActual ASC
    `;
    return await db.all(sql);
  }

  async findProveedores(idProducto) {
    const db = await conectar();
    const sql = `
      SELECT pp.idProveedor, pr.nombre, pp.precioCompra
      FROM Proveedor_Producto pp
      INNER JOIN Proveedor pr ON pp.idProveedor = pr.idProveedor
      WHERE pp.idProducto = ?
    `;
    return await db.all(sql, [idProducto]);
  }

  async update(idProducto, datos) {
    const db = await conectar();
    const sql = `
      UPDATE Producto
      SET nombre = ?, precioVenta = ?, stockActual = ?, stockMinimo = ?,
          idCategoria = ?, idTemporada = ?
      WHERE idProducto = ?
    `;
    const resultado = await db.run(sql, [
      datos.nombre,
      datos.precioVenta,
      datos.stockActual,
      datos.stockMinimo,
      datos.idCategoria,
      datos.idTemporada,
      idProducto
    ]);
    return resultado.changes > 0;
  }

  async actualizarStock(idProducto, cantidad) {
    const db = await conectar();
    const sql = `UPDATE Producto SET stockActual = stockActual + ? WHERE idProducto = ?`;
    const resultado = await db.run(sql, [cantidad, idProducto]);
    return resultado.changes > 0;
  }

  async desactivar(idProducto) {
    const db = await conectar();
    const sql = `UPDATE Producto SET estado = 'inactivo' WHERE idProducto = ?`;
    const resultado = await db.run(sql, [idProducto]);
    return resultado.changes > 0;
  }
}

const productoRepository = new ProductoRepository();
module.exports = { ProductoRepository, productoRepository };