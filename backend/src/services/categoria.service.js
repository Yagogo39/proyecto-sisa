const { categoriaRepository } = require('../repositories/categoria.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class CategoriaService {
  constructor(repo) {
    this.Repo = repo;
  }

  async crear({ nombre }) {
    if (!nombre || nombre.trim() === '') {
      throw new BadRequestError('El nombre de la categoría es requerido');
    }

    const existente = await this.Repo.findByNombre(nombre.trim());
    if (existente) {
      throw new BadRequestError('Ya existe una categoría con ese nombre');
    }

    return await this.Repo.create({ nombre: nombre.trim() });
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPorId(idCategoria) {
    const categoria = await this.Repo.findById(idCategoria);
    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }
    return categoria;
  }

  async actualizar(idCategoria, { nombre }) {
    if (!nombre || nombre.trim() === '') {
      throw new BadRequestError('El nombre de la categoría es requerido');
    }

    const categoria = await this.Repo.findById(idCategoria);
    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    const duplicada = await this.Repo.findByNombre(nombre.trim());
    if (duplicada && duplicada.idCategoria !== Number(idCategoria)) {
      throw new BadRequestError('Ya existe otra categoría con ese nombre');
    }

    await this.Repo.update(idCategoria, nombre.trim());
    return { message: 'Categoría actualizada correctamente' };
  }

  async eliminar(idCategoria) {
    const categoria = await this.Repo.findById(idCategoria);
    if (!categoria) {
      throw new NotFoundError('Categoría no encontrada');
    }

    await this.Repo.delete(idCategoria);
    return { message: 'Categoría eliminada correctamente' };
  }
}

const categoriaService = new CategoriaService(categoriaRepository);
module.exports = { CategoriaService, categoriaService };