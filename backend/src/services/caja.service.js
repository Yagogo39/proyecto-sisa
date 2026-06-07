const { cajaRepository } = require('../repositories/caja.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

class CajaService {
  constructor(repo) {
    this.Repo = repo;
  }

  async abrir({ montoInicial, idUsuario }) {
    if (montoInicial === undefined || montoInicial === null) {
      throw new BadRequestError('El monto inicial es requerido');
    }
    if (montoInicial < 0) {
      throw new BadRequestError('El monto inicial no puede ser negativo');
    }
    if (!idUsuario) {
      throw new BadRequestError('El usuario responsable es requerido');
    }
    const cajaAbierta = await this.Repo.findAbierta();
    if (cajaAbierta) {
      throw new BadRequestError('Ya existe una caja abierta. Debe cerrarla antes de abrir otra');
    }
    return await this.Repo.create({ montoInicial, idUsuario });
  }

  async cerrar(idCaja, { montoFinal, observaciones, idUsuarioCierre }) {
    if (montoFinal === undefined || montoFinal === null) {
      throw new BadRequestError('El monto final contado es requerido');
    }
    if (montoFinal < 0) {
      throw new BadRequestError('El monto final no puede ser negativo');
    }
    if (!idUsuarioCierre) {
      throw new BadRequestError('El usuario que cierra es requerido');
    }

    const caja = await this.Repo.findById(idCaja);
    if (!caja) throw new NotFoundError('Caja no encontrada');
    if (caja.estado === 'cerrada') throw new BadRequestError('Esta caja ya fue cerrada');

    const totalVentas = await this.Repo.calcularTotalVentas(idCaja);
    const esperado = Number(caja.montoInicial) + Number(totalVentas);
    const diferencia = parseFloat((Number(montoFinal) - esperado).toFixed(2));

    await this.Repo.cerrar(idCaja, {
      montoFinal,
      totalVentasCalculado: totalVentas,
      diferencia,
      observaciones,
      idUsuarioCierre
    });

    let estatusDiferencia = 'cuadre exacto';
    if (diferencia > 0) estatusDiferencia = 'sobrante';
    else if (diferencia < 0) estatusDiferencia = 'faltante';

    return {
      message: 'Caja cerrada correctamente',
      resumen: {
        montoInicial: Number(caja.montoInicial),
        totalVentas: Number(totalVentas),
        esperadoEnCaja: esperado,
        montoFinalContado: Number(montoFinal),
        diferencia,
        estatus: estatusDiferencia
      }
    };
  }

  async consultarAbierta() {
    const caja = await this.Repo.findAbierta();
    if (!caja) {
      throw new NotFoundError('No hay caja abierta en este momento');
    }
    const totalVentas = await this.Repo.calcularTotalVentas(caja.idCaja);
    const desglose = await this.Repo.desgloseVentas(caja.idCaja);
    return {
      ...caja,
      totalVentasHastaAhora: Number(totalVentas),
      efectivoEsperado: Number(caja.montoInicial) + Number(totalVentas),
      desglose
    };
  }

  async leer() {
    return await this.Repo.findAll();
  }

  async leerPorId(idCaja) {
    const caja = await this.Repo.findById(idCaja);
    if (!caja) throw new NotFoundError('Caja no encontrada');
    const desglose = await this.Repo.desgloseVentas(idCaja);
    const empleados = await this.Repo.empleadosDeCaja(idCaja);
    const ventas = await this.Repo.ventasDeCaja(idCaja);
    return { ...caja, desglose, empleados, ventas };
  }
}

const cajaService = new CajaService(cajaRepository);
module.exports = { CajaService, cajaService };