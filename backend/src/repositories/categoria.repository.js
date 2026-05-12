const { conectar } = require('../config/db');

class CategoriaRepository {
  async create(categoria) {
    const db = await conectar();
    const sql = `INSERT INTO Categoria (nombre) VALUES (?)`;
    const resultado = await db.run(sql, [categoria.nombre]);
    return { idCategoria: resultado.lastID, nombre: categoria.nombre };
  }

  async findAll() {
    const db = await conectar();
    const sql = `SELECT idCategoria, nombre FROM Categoria ORDER BY nombre ASC`;
    return await db.all(sql);
  }

  async findById(idCategoria) {
    const db = await conectar();
    const sql = `SELECT idCategoria, nombre FROM Categoria WHERE idCategoria = ?`;
    return await db.get(sql, [idCategoria]);
  }

  async findByNombre(nombre) {
    const db = await conectar();
    const sql = `SELECT idCategoria, nombre FROM Categoria WHERE nombre = ?`;
    return await db.get(sql, [nombre]);
  }

  async update(idCategoria, nombre) {
    const db = await conectar();
    const sql = `UPDATE Categoria SET nombre = ? WHERE idCategoria = ?`;
    const resultado = await db.run(sql, [nombre, idCategoria]);
    return resultado.changes > 0;
  }

  async delete(idCategoria) {
    const db = await conectar();
    const sql = `DELETE FROM Categoria WHERE idCategoria = ?`;
    const resultado = await db.run(sql, [idCategoria]);
    return resultado.changes > 0;
  }
}

const categoriaRepository = new CategoriaRepository();
module.exports = { CategoriaRepository, categoriaRepository };