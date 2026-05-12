const { productoRepository } = require('../repositories/producto.repository');
const { categoriaRepository } = require('../repositories/categoria.repository');
const { temporadaRepository } = require('../repositories/temporada.repository');
const { proveedorRepository } = require('../repositories/proveedor.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class ProductoService {
  constructor(repo, categoriaRepo, temporadaRepo, proveedorRepo) {
    this.Repo = repo;
    this.CategoriaRepo = categoriaRepo;
    this.TemporadaRepo = temporadaRepo;
    this.ProveedorRepo = proveedorRepo;
  }

  async crear(datos) {
    const {
      nombre, precioVenta, precioCompra, stockActual, stockMinimo,
      idCategoria, idTemporada, idProveedor
    } = datos;

    if (!nombre || precioVenta === undefined || stockActual === undefined ||
        stockMinimo === undefined || !idCategoria) {
      throw new BadRequestError('Faltan datos requeridos (nombre, precioVenta, stockActual, stockMinimo, idCategoria)');
    }

    if (precioVenta < 0 || stockActual < 0 || stockMinimo < 0) {
      throw new BadRequestError('Los valores numéricos no pueden ser negativos');
    }

    const categoria = await this.CategoriaRepo.findById(idCategoria);
    if (!categoria) {
      throw new BadRequestError('La categoría indicada no existe');
    }

    if (idTemporada) {
      const temporada = await this.TemporadaRepo.findById(idTemporada);
      if (!temporada) {
        throw new BadRequestError('La temporada indicada no existe');
      }
    }

    const duplicado = await this.Repo.findByNombre(nombre.trim());
    if (duplicado) {
      throw new BadRequestError('Ya existe un producto activo con ese nombre');
    }

    const nuevoProducto = await this.Repo.create({
      nombre: nombre.trim(),
      precioVenta,
      stockActual,
      stockMinimo,
      idCategoria,
      idTemporada: idTemporada || null
    });

    if (idProveedor && precioCompra !== undefined) {
      const proveedor = await this.ProveedorRepo.findById(idProveedor);
      if (!proveedor) {
        throw new BadRequestError('El proveedor indicado no existe');
      }
      await this.Repo.vincularProveedor(nuevoProducto.idProducto, idProveedor, precioCompra);
    }

    return nuevoProducto;
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPorId(idProducto) {
    const producto = await this.Repo.findById(idProducto);
    if (!producto) {
      throw new NotFoundError('Producto no encontrado');
    }
    const proveedores = await this.Repo.findProveedores(idProducto);
    return { ...producto, proveedores };
  }

  async alertasStockBajo() {
    return await this.Repo.findStockBajo();
  }

  async actualizar(idProducto, datos) {
    const producto = await this.Repo.findById(idProducto);
    if (!producto) {
      throw new NotFoundError('Producto no encontrado');
    }

    if (datos.idCategoria) {
      const categoria = await this.CategoriaRepo.findById(datos.idCategoria);
      if (!categoria) {
        throw new BadRequestError('La categoría indicada no existe');
      }
    }

    if (datos.idTemporada) {
      const temporada = await this.TemporadaRepo.findById(datos.idTemporada);
      if (!temporada) {
        throw new BadRequestError('La temporada indicada no existe');
      }
    }

    const datosActualizados = {
      nombre: datos.nombre || producto.nombre,
      precioVenta: datos.precioVenta !== undefined ? datos.precioVenta : producto.precioVenta,
      stockActual: datos.stockActual !== undefined ? datos.stockActual : producto.stockActual,
      stockMinimo: datos.stockMinimo !== undefined ? datos.stockMinimo : producto.stockMinimo,
      idCategoria: datos.idCategoria || producto.idCategoria,
      idTemporada: datos.idTemporada !== undefined ? datos.idTemporada : producto.idTemporada
    };

    await this.Repo.update(idProducto, datosActualizados);
    return { message: 'Producto actualizado correctamente' };
  }

  async ajustarStock(idProducto, cantidad) {
    if (cantidad === undefined || cantidad === null) {
      throw new BadRequestError('La cantidad es requerida');
    }

    const producto = await this.Repo.findById(idProducto);
    if (!producto) {
      throw new NotFoundError('Producto no encontrado');
    }

    if (producto.stockActual + cantidad < 0) {
      throw new BadRequestError('No hay suficiente stock para este ajuste');
    }

    await this.Repo.actualizarStock(idProducto, cantidad);
    return { message: 'Stock ajustado correctamente' };
  }

  async eliminar(idProducto) {
    const producto = await this.Repo.findById(idProducto);
    if (!producto) {
      throw new NotFoundError('Producto no encontrado');
    }
    await this.Repo.desactivar(idProducto);
    return { message: 'Producto eliminado correctamente' };
  }
}

const productoService = new ProductoService(
  productoRepository,
  categoriaRepository,
  temporadaRepository,
  proveedorRepository
);

module.exports = { ProductoService, productoService };