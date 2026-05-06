const categoriaRepository = require('../repositories/categoria.repository');

async function getAllCategorias() {
  const categorias = await categoriaRepository.findAll();
  return categorias;
}

async function saveCategoria(nombre) {
  // Aquí puedes meter validaciones antes de guardar
  const nuevaCategoria = await categoriaRepository.create(nombre);
  return nuevaCategoria;
}

module.exports = {
  getAllCategorias,
  saveCategoria
};
