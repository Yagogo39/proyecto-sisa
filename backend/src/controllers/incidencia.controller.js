const { incidenciaService } = require('../services/incidencia.service');

class IncidenciaController {
  constructor(service) {
    this.Service = service;
  }

  async reportar(req, res) {
    try {
      const respuesta = await this.Service.reportar(req.body);
      return res.status(201).json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async leer(req, res) {
    try {
      return res.json(await this.Service.leer());
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async leerPendientes(req, res) {
    try {
      return res.json(await this.Service.leerPendientes());
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async leerPorId(req, res) {
    try {
      return res.json(await this.Service.leerPorId(req.params.id));
    } catch (error) { 
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async resolver(req, res) {
    try {
      const respuesta = await this.Service.resolver(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

const incidenciaController = new IncidenciaController(incidenciaService);
module.exports = { IncidenciaController, incidenciaController };