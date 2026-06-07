const { conectar } = require('../config/db');

class ConfiguracionRepository {
  async findByClave(clave) {
    const db = await conectar();
    const sql = `SELECT clave, valor, descripcion FROM Configuracion WHERE clave = ?`;
    return await db.get(sql, [clave]);
  }

  async findAll() {
    const db = await conectar();
    const sql = `SELECT clave, valor, descripcion FROM Configuracion`;
    return await db.all(sql);
  }

  async update(clave, valor) {
    const db = await conectar();
    const sql = `UPDATE Configuracion SET valor = ? WHERE clave = ?`;
    const resultado = await db.run(sql, [String(valor), clave]);
    return resultado.changes > 0;
  }

  async upsert(clave, valor, descripcion = null) {
    const db = await conectar();
    const existe = await this.findByClave(clave);
    if (existe) {
      return await this.update(clave, valor);
    }
    const sql = `INSERT INTO Configuracion (clave, valor, descripcion) VALUES (?, ?, ?)`;
    await db.run(sql, [clave, String(valor), descripcion]);
    return true;
  }
}

const configuracionRepository = new ConfiguracionRepository();
module.exports = { ConfiguracionRepository, configuracionRepository };