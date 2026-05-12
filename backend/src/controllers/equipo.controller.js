const { equipoService } = require('../services/equipo.service');

class EquipoController {
  constructor(service) {
    this.Service = service;
  }

  async agregar(req, res) {
    try {
      const respuesta = await this.Service.agregar(req.body);
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

  async iniciarSesion(req, res) {
    try {
      const respuesta = await this.Service.iniciarSesion(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async finalizarSesion(req, res) {
    try {
      const respuesta = await this.Service.finalizarSesion(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const respuesta = await this.Service.cambiarEstado(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }

  async eliminar(req, res) {
    try {
      const respuesta = await this.Service.eliminar(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ message: error.message });
    }
  }
}

const equipoController = new EquipoController(equipoService);
module.exports = { EquipoController, equipoController };