const { conectar } = require('../config/db');

class ProveedorRepository {
  async create(proveedor) {
    const db = await conectar();
    const sql = `
      INSERT INTO Proveedor (nombre, telefono, email)
      VALUES (?, ?, ?)
    `;
    const resultado = await db.run(sql, [
      proveedor.nombre,
      proveedor.telefono,
      proveedor.email
    ]);
    return { idProveedor: resultado.lastID, ...proveedor };
  }

  async findAll() {
    const db = await conectar();
    const sql = `
      SELECT idProveedor, nombre, telefono, email
      FROM Proveedor
      ORDER BY nombre ASC
    `;
    return await db.all(sql);
  }

  async findById(idProveedor) {
    const db = await conectar();
    const sql = `
      SELECT idProveedor, nombre, telefono, email
      FROM Proveedor WHERE idProveedor = ?
    `;
    return await db.get(sql, [idProveedor]);
  }

  async findByNombre(nombre) {
    const db = await conectar();
    const sql = `SELECT idProveedor FROM Proveedor WHERE nombre = ?`;
    return await db.get(sql, [nombre]);
  }

  async update(idProveedor, datos) {
    const db = await conectar();
    const sql = `
      UPDATE Proveedor
      SET nombre = ?, telefono = ?, email = ?
      WHERE idProveedor = ?
    `;
    const resultado = await db.run(sql, [
      datos.nombre,
      datos.telefono,
      datos.email,
      idProveedor
    ]);
    return resultado.changes > 0;
  }

  async delete(idProveedor) {
    const db = await conectar();
    const sql = `DELETE FROM Proveedor WHERE idProveedor = ?`;
    const resultado = await db.run(sql, [idProveedor]);
    return resultado.changes > 0;
  }
}

const proveedorRepository = new ProveedorRepository();
module.exports = { ProveedorRepository, proveedorRepository };