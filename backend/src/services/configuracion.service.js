const { configuracionRepository } = require('../repositories/configuracion.repository');
const { BadRequestError } = require('../utils/errors/BadRequestError');

class ConfiguracionService {
  constructor(repo) {
    this.Repo = repo;
  }

  async obtenerTarifaCyber() {
    const config = await this.Repo.findByClave('tarifa_cyber_hora');
    if (!config) {
      return { clave: 'tarifa_cyber_hora', valor: 15.00 };
    }
    return { ...config, valor: parseFloat(config.valor) };
  }

  async actualizarTarifaCyber(nuevaTarifa) {
    const tarifa = parseFloat(nuevaTarifa);
    if (isNaN(tarifa) || tarifa <= 0) {
      throw new BadRequestError('La tarifa debe ser un número mayor a 0');
    }
    if (tarifa > 1000) {
      throw new BadRequestError('La tarifa no puede ser mayor a $1000/hora');
    }
    await this.Repo.upsert(
      'tarifa_cyber_hora',
      tarifa.toFixed(2),
      'Tarifa por hora del servicio de cyber en MXN'
    );
    return {
      message: 'Tarifa actualizada correctamente',
      tarifa: tarifa
    };
  }

  async leerTodas() {
    return await this.Repo.findAll();
  }
}

const configuracionService = new ConfiguracionService(configuracionRepository);
module.exports = { ConfiguracionService, configuracionService };