const { proveedorRepository } = require('../repositories/proveedor.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class ProveedorService {
  constructor(repo) {
    this.Repo = repo;
  }

  async crear({ nombre, telefono, email }) {
    if (!nombre || nombre.trim() === '') {
      throw new BadRequestError('El nombre del proveedor es requerido');
    }

    if (email && !this.validarEmail(email)) {
      throw new BadRequestError('El formato del email no es válido');
    }

    if (telefono && !/^\d{7,15}$/.test(telefono)) {
      throw new BadRequestError('El teléfono debe tener entre 7 y 15 dígitos');
    }

    const existente = await this.Repo.findByNombre(nombre.trim());
    if (existente) {
      throw new BadRequestError('Ya existe un proveedor con ese nombre');
    }

    return await this.Repo.create({
      nombre: nombre.trim(),
      telefono: telefono || null,
      email: email || null
    });
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPorId(idProveedor) {
    const proveedor = await this.Repo.findById(idProveedor);
    if (!proveedor) {
      throw new NotFoundError('Proveedor no encontrado');
    }
    return proveedor;
  }

  async actualizar(idProveedor, { nombre, telefono, email }) {
    const proveedor = await this.Repo.findById(idProveedor);
    if (!proveedor) {
      throw new NotFoundError('Proveedor no encontrado');
    }

    if (email && !this.validarEmail(email)) {
      throw new BadRequestError('El formato del email no es válido');
    }

    if (telefono && !/^\d{7,15}$/.test(telefono)) {
      throw new BadRequestError('El teléfono debe tener entre 7 y 15 dígitos');
    }

    const datos = {
      nombre: nombre ? nombre.trim() : proveedor.nombre,
      telefono: telefono !== undefined ? telefono : proveedor.telefono,
      email: email !== undefined ? email : proveedor.email
    };

    await this.Repo.update(idProveedor, datos);
    return { message: 'Proveedor actualizado correctamente' };
  }

  async eliminar(idProveedor) {
    const proveedor = await this.Repo.findById(idProveedor);
    if (!proveedor) {
      throw new NotFoundError('Proveedor no encontrado');
    }
    await this.Repo.delete(idProveedor);
    return { message: 'Proveedor eliminado correctamente' };
  }

  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

const proveedorService = new ProveedorService(proveedorRepository);
module.exports = { ProveedorService, proveedorService };