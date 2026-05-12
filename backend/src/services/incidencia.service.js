const { incidenciaRepository } = require('../repositories/incidencia.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class IncidenciaService {
  constructor(repo) {
    this.Repo = repo;
  }

  async reportar({ descripcion, idUsuario }) {
    if (!descripcion || descripcion.trim() === '') {
      throw new BadRequestError('La descripción es requerida');
    }
    if (!idUsuario) {
      throw new BadRequestError('El usuario es requerido');
    }
    return await this.Repo.create({ descripcion: descripcion.trim(), idUsuario });
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPendientes() {
    return await this.Repo.findPendientes();
  }

  async leerPorId(idIncidencia) {
    const incidencia = await this.Repo.findById(idIncidencia);
    if (!incidencia) throw new NotFoundError('Incidencia no encontrada');
    return incidencia;
  }

  async resolver(idIncidencia) {
    const incidencia = await this.Repo.findById(idIncidencia);
    if (!incidencia) throw new NotFoundError('Incidencia no encontrada');
    if (incidencia.estado === 'resuelto') {
      throw new BadRequestError('Esta incidencia ya fue resuelta');
    }
    await this.Repo.resolver(idIncidencia);
    return { message: 'Incidencia marcada como resuelta' };
  }
}

const incidenciaService = new IncidenciaService(incidenciaRepository);
module.exports = { IncidenciaService, incidenciaService };