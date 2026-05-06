const categoriaRepository = require('../repositories/categoria.repository');

async function getAllCategorias() {
  const categorias = await categoriaRepository.findAll();
  return categorias;
}

async function saveCategoria(nombre) {
  const nuevaCategoria = await categoriaRepository.create(nombre);
  return nuevaCategoria;
}

module.exports = {
  getAllCategorias,
  saveCategoria
};
