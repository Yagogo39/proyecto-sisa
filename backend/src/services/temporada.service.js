const { temporadaRepository } = require('../repositories/temporada.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class TemporadaService {
  constructor(repo) {
    this.Repo = repo;
  }

  async crear({ nombre, fecha_inicio, fecha_fin, estado }) {
    if (!nombre || !fecha_inicio || !fecha_fin) {
      throw new BadRequestError('Nombre, fecha de inicio y fecha de fin son requeridos');
    }

    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      throw new BadRequestError('La fecha de inicio no puede ser mayor a la de fin');
    }

    if (estado && estado !== 'activa' && estado !== 'inactiva') {
      throw new BadRequestError('El estado debe ser "activa" o "inactiva"');
    }

    if (estado === 'activa') {
      await this.Repo.desactivarTodas();
    }

    return await this.Repo.create({ nombre: nombre.trim(), fecha_inicio, fecha_fin, estado });
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPorId(idTemporada) {
    const temporada = await this.Repo.findById(idTemporada);
    if (!temporada) {
      throw new NotFoundError('Temporada no encontrada');
    }
    return temporada;
  }

  async leerActiva() {
    const temporada = await this.Repo.findActiva();
    if (!temporada) {
      throw new NotFoundError('No hay temporada activa en este momento');
    }
    return temporada;
  }

  async actualizar(idTemporada, { nombre, fecha_inicio, fecha_fin, estado }) {
    const temporada = await this.Repo.findById(idTemporada);
    if (!temporada) {
      throw new NotFoundError('Temporada no encontrada');
    }

    const datos = {
      nombre: nombre || temporada.nombre,
      fecha_inicio: fecha_inicio || temporada.fecha_inicio,
      fecha_fin: fecha_fin || temporada.fecha_fin,
      estado: estado || temporada.estado
    };

    if (new Date(datos.fecha_inicio) > new Date(datos.fecha_fin)) {
      throw new BadRequestError('La fecha de inicio no puede ser mayor a la de fin');
    }

    await this.Repo.update(idTemporada, datos);
    return { message: 'Temporada actualizada correctamente' };
  }

  async activar(idTemporada) {
    const temporada = await this.Repo.findById(idTemporada);
    if (!temporada) {
      throw new NotFoundError('Temporada no encontrada');
    }
    await this.Repo.activar(idTemporada);
    return { message: 'Temporada activada correctamente' };
  }

  async eliminar(idTemporada) {
    const temporada = await this.Repo.findById(idTemporada);
    if (!temporada) {
      throw new NotFoundError('Temporada no encontrada');
    }
    await this.Repo.delete(idTemporada);
    return { message: 'Temporada eliminada correctamente' };
  }
}

const temporadaService = new TemporadaService(temporadaRepository);
module.exports = { TemporadaService, temporadaService };