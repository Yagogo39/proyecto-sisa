const categoriaService = require('../services/categoria.service');

async function getCategorias(req, res) {
  try {
    const data = await categoriaService.getAllCategorias();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addCategoria(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }
    const nueva = await categoriaService.saveCategoria(nombre);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getCategorias,
  addCategoria
};
