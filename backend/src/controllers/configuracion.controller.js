const { configuracionService } = require('../services/configuracion.service');

class ConfiguracionController {
  constructor(service) {
    this.Service = service;
  }

  async obtenerTarifaCyber(req, res) {
    try {
      const respuesta = await this.Service.obtenerTarifaCyber();
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async actualizarTarifaCyber(req, res) {
    try {
      const respuesta = await this.Service.actualizarTarifaCyber(req.body.tarifa);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }
}

const configuracionController = new ConfiguracionController(configuracionService);
module.exports = { ConfiguracionController, configuracionController };