const categoriaService = require('../services/temporada.service');

async function getTemporada(req, res) {
  try {
    const data = await temporadaService.getAllTemporada();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function addTemporada(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }
    const nueva = await temporadaService.saveTemporada(nombre);
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getTemporada,
  addTemporada
};
