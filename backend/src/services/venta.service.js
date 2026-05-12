const { ventaRepository } = require('../repositories/venta.repository');
const { productoRepository } = require('../repositories/producto.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class VentaService {
  constructor(repo, productoRepo) {
    this.Repo = repo;
    this.ProductoRepo = productoRepo;
  }

  async registrar({ productos, idUsuario, efectivo }) {
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new BadRequestError('Debe incluir al menos un producto');
    }
    if (!idUsuario) throw new BadRequestError('El usuario es requerido');

    // Validar productos y calcular total
    let total = 0;
    const detalles = [];

    for (const item of productos) {
      if (!item.idProducto || !item.cantidad || item.cantidad <= 0) {
        throw new BadRequestError('Cada producto debe tener idProducto y cantidad válida');
      }

      const producto = await this.ProductoRepo.findById(item.idProducto);
      if (!producto) throw new BadRequestError(`Producto con id ${item.idProducto} no encontrado`);
      if (producto.estado === 'inactivo') throw new BadRequestError(`El producto "${producto.nombre}" no está disponible`);
      if (producto.stockActual < item.cantidad) {
        throw new BadRequestError(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stockActual}`);
      }

      const precioUnitario = producto.precioVenta;
      const subTotal = precioUnitario * item.cantidad;
      total += subTotal;

      detalles.push({ idProducto: item.idProducto, cantidad: item.cantidad, precioUnitario, subTotal });
    }

    if (efectivo !== undefined && efectivo < total) {
      throw new BadRequestError('El efectivo recibido es menor al total de la venta');
    }

    // Crear la venta
    const nuevaVenta = await this.Repo.create({ total, tipoVenta: 'producto', idUsuario });

    // Guardar detalle y descontar stock
    for (const detalle of detalles) {
      await this.Repo.agregarDetalle(nuevaVenta.idVenta, detalle);
      await this.ProductoRepo.actualizarStock(detalle.idProducto, -detalle.cantidad);
    }

    const cambio = efectivo !== undefined ? efectivo - total : null;

    return {
      idVenta: nuevaVenta.idVenta,
      total,
      efectivo: efectivo || null,
      cambio,
      detalle: detalles
    };
  }

  async leer(filtros = {}) {
    return await this.Repo.findAll(filtros);
  }

  async leerPorId(idVenta) {
    const venta = await this.Repo.findById(idVenta);
    if (!venta) throw new NotFoundError('Venta no encontrada');
    return venta;
  }

  async totalDelDia() {
    const hoy = new Date().toISOString().split('T')[0];
    return { fecha: hoy, total: await this.Repo.totalDelDia(hoy) };
  }
}

const ventaService = new VentaService(ventaRepository, productoRepository);
module.exports = { VentaService, ventaService };