const temporadaRepository = require('../repositories/temporada.repository');

async function getAllTemporada() {
  const temporadas = await temporadaRepository.findAll();
  return temporadas;
}

async function saveTemporada(nombre) {
  const nuevaTemporada = await temporadaRepository.create(nombre);
  return nuevaTemporada;
}

module.exports = {
  getAllTemporada,
  saveTemporada
};
