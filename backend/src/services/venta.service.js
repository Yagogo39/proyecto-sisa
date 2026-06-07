const { ventaRepository } = require('../repositories/venta.repository');
const { productoRepository } = require('../repositories/producto.repository');
const { cajaRepository } = require('../repositories/caja.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class VentaService {
  constructor(repo, productoRepo, cajaRepo) {
    this.Repo = repo;
    this.ProductoRepo = productoRepo;
    this.CajaRepo = cajaRepo;
  }

  async _validarCajaAbierta() {
    const caja = await this.CajaRepo.findAbierta();
    if (!caja) {
      throw new BadRequestError('No hay caja abierta. Abre la caja para registrar transacciones.');
    }
    return caja;
  }

  async registrar({ productos, idUsuario, efectivo }) {
    await this._validarCajaAbierta();

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      throw new BadRequestError('Debe incluir al menos un producto');
    }
    if (!idUsuario) throw new BadRequestError('El usuario es requerido');

    let total = 0;
    const detalles = [];
    for (const item of productos) {
      const cantidad = parseFloat(item.cantidad);
      if (!item.idProducto || isNaN(cantidad) || cantidad <= 0) {
        throw new BadRequestError('Cada producto debe tener idProducto y cantidad válida');
      }
      const producto = await this.ProductoRepo.findById(item.idProducto);
      if (!producto) throw new BadRequestError(`Producto con id ${item.idProducto} no encontrado`);
      if (producto.estado === 'inactivo') throw new BadRequestError(`El producto "${producto.nombre}" no está disponible`);

      if (['pieza', 'paquete'].includes(producto.unidadMedida) && !Number.isInteger(cantidad)) {
        throw new BadRequestError(`"${producto.nombre}" se vende por ${producto.unidadMedida}, la cantidad debe ser un número entero`);
      }

      if (producto.stockActual < cantidad) {
        throw new BadRequestError(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stockActual} ${producto.unidadMedida}(s)`);
      }
      const precioUnitario = producto.precioVenta;
      const subTotal = parseFloat((precioUnitario * cantidad).toFixed(2));
      total += subTotal;
      detalles.push({ idProducto: item.idProducto, cantidad, precioUnitario, subTotal });
    }

    total = parseFloat(total.toFixed(2));

    if (efectivo !== undefined && efectivo < total) {
      throw new BadRequestError('El efectivo recibido es menor al total de la venta');
    }

    const nuevaVenta = await this.Repo.create({ total, tipoVenta: 'producto', idUsuario });
    for (const detalle of detalles) {
      await this.Repo.agregarDetalle(nuevaVenta.idVenta, detalle);
      await this.ProductoRepo.actualizarStock(detalle.idProducto, -detalle.cantidad);
    }

    const cambio = efectivo !== undefined ? parseFloat((efectivo - total).toFixed(2)) : null;
    return {
      idVenta: nuevaVenta.idVenta,
      total,
      efectivo: efectivo || null,
      cambio,
      detalle: detalles
    };
  }

  async registrarImpresion({ descripcion, cantidad, precioPorHoja, idUsuario, efectivo }) {
    await this._validarCajaAbierta();

    if (!idUsuario) throw new BadRequestError('El usuario es requerido');

    const cant = parseInt(cantidad);
    const precio = parseFloat(precioPorHoja);

    if (isNaN(cant) || cant <= 0) {
      throw new BadRequestError('La cantidad de hojas debe ser mayor a 0');
    }
    if (isNaN(precio) || precio <= 0) {
      throw new BadRequestError('El precio por hoja debe ser mayor a 0');
    }

    const total = parseFloat((cant * precio).toFixed(2));

    if (efectivo !== undefined && efectivo < total) {
      throw new BadRequestError('El efectivo recibido es menor al total');
    }

    const descripcionFinal = descripcion?.trim()
      || `Impresión: ${cant} hoja${cant !== 1 ? 's' : ''} a $${precio.toFixed(2)} c/u`;

    const nuevaVenta = await this.Repo.create({
      total,
      tipoVenta: 'impresion',
      descripcion: descripcionFinal,
      idUsuario
    });

    const cambio = efectivo !== undefined ? parseFloat((efectivo - total).toFixed(2)) : null;
    return {
      idVenta: nuevaVenta.idVenta,
      total,
      descripcion: descripcionFinal,
      cantidad: cant,
      precioPorHoja: precio,
      efectivo: efectivo || null,
      cambio
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

  async productosMasRentables({ fechaInicio, fechaFin, limite }) {
    const lim = limite ? parseInt(limite) : 5;
    if (lim <= 0 || lim > 50) {
      throw new BadRequestError('El límite debe estar entre 1 y 50');
    }
    const resultados = await this.Repo.productosMasRentables({
      fechaInicio,
      fechaFin,
      limite: lim
    });
    return resultados.map(p => {
      const precioPromedio = parseFloat(p.precioPromedio) || 0;
      const costoPromedio = parseFloat(p.costoPromedio) || 0;
      let margenPorcentaje = 0;
      if (precioPromedio > 0) {
        margenPorcentaje = ((precioPromedio - costoPromedio) / precioPromedio) * 100;
      }
      return {
        idProducto: p.idProducto,
        nombre: p.nombre,
        unidadesVendidas: parseFloat(p.unidadesVendidas) || 0,
        ingresos: parseFloat(p.ingresos) || 0,
        precioPromedio: parseFloat(precioPromedio.toFixed(2)),
        costoPromedio: parseFloat(costoPromedio.toFixed(2)),
        margenPorcentaje: parseFloat(margenPorcentaje.toFixed(1))
      };
    });
  }
}

const ventaService = new VentaService(ventaRepository, productoRepository, cajaRepository);
module.exports = { VentaService, ventaService };