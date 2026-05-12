    const { equipoRepository } = require('../repositories/equipo.repository');
const { ventaRepository } = require('../repositories/venta.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

const TARIFA_POR_HORA = 15.00; // $15 por hora, ajusta si es diferente

class EquipoService {
  constructor(repo, ventaRepo) {
    this.Repo = repo;
    this.VentaRepo = ventaRepo;
  }

  async agregar({ numero }) {
    if (!numero) throw new BadRequestError('El número de equipo es requerido');

    const existente = await this.Repo.findByNumero(numero);
    if (existente) throw new BadRequestError(`Ya existe un equipo con el número ${numero}`);

    return await this.Repo.create({ numero });
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async iniciarSesion(idEquipo, { idUsuario }) {
    if (!idUsuario) throw new BadRequestError('El usuario es requerido');

    const equipo = await this.Repo.findById(idEquipo);
    if (!equipo) throw new NotFoundError('Equipo no encontrado');
    if (equipo.estado === 'en_uso') throw new BadRequestError('El equipo ya está en uso');
    if (equipo.estado === 'fuera_de_servicio') throw new BadRequestError('El equipo está fuera de servicio');

    const tiempoInicio = Date.now(); // timestamp en ms
    await this.Repo.iniciarSesion(idEquipo, idUsuario, tiempoInicio);

    return { message: 'Sesión iniciada', idEquipo, tiempoInicio };
  }

  async finalizarSesion(idEquipo, { idUsuario, efectivo }) {
    const equipo = await this.Repo.findById(idEquipo);
    if (!equipo) throw new NotFoundError('Equipo no encontrado');
    if (equipo.estado !== 'en_uso') throw new BadRequestError('El equipo no está en uso');

    const tiempoFin = Date.now();
    const tiempoInicio = equipo.tiempo_transcurrido;
    const minutos = Math.ceil((tiempoFin - tiempoInicio) / 60000);
    const costo = parseFloat(((minutos / 60) * TARIFA_POR_HORA).toFixed(2));

    if (efectivo !== undefined && efectivo < costo) {
      throw new BadRequestError('El efectivo recibido es menor al costo');
    }

    // Registrar como venta tipo cyber
    const venta = await this.VentaRepo.create({
      total: costo,
      tipoVenta: 'cyber',
      idUsuario: idUsuario || equipo.idUsuario
    });

    await this.Repo.finalizarSesion(idEquipo);

    const cambio = efectivo !== undefined ? parseFloat((efectivo - costo).toFixed(2)) : null;

    return {
      message: 'Sesión finalizada',
      idVenta: venta.idVenta,
      minutos,
      costo,
      efectivo: efectivo || null,
      cambio
    };
  }

  async cambiarEstado(idEquipo, { estado }) {
    const estadosValidos = ['disponible', 'en_uso', 'fuera_de_servicio'];
    if (!estadosValidos.includes(estado)) {
      throw new BadRequestError('Estado inválido. Use: disponible, en_uso o fuera_de_servicio');
    }

    const equipo = await this.Repo.findById(idEquipo);
    if (!equipo) throw new NotFoundError('Equipo no encontrado');

    await this.Repo.cambiarEstado(idEquipo, estado);
    return { message: 'Estado actualizado correctamente' };
  }

  async eliminar(idEquipo) {
    const equipo = await this.Repo.findById(idEquipo);
    if (!equipo) throw new NotFoundError('Equipo no encontrado');
    if (equipo.estado === 'en_uso') throw new BadRequestError('No se puede eliminar un equipo en uso');

    await this.Repo.delete(idEquipo);
    return { message: 'Equipo eliminado correctamente' };
  }
}

const equipoService = new EquipoService(equipoRepository, ventaRepository);
module.exports = { EquipoService, equipoService };