const { temporadaService } = require('../services/temporada.service');

class TemporadaController {
  constructor(service) {
    this.Service = service;
  }

  async crear(req, res) {
    try {
      const respuesta = await this.Service.crear(req.body);
      return res.status(201).json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async leer(req, res) {
    try {
      const lista = await this.Service.leer();
      return res.json(lista);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async leerActiva(req, res) {
    try {
      const respuesta = await this.Service.leerActiva();
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async leerPorId(req, res) {
    try {
      const respuesta = await this.Service.leerPorId(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async actualizar(req, res) {
    try {
      const respuesta = await this.Service.actualizar(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async activar(req, res) {
    try {
      const respuesta = await this.Service.activar(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async eliminar(req, res) {
    try {
      const respuesta = await this.Service.eliminar(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }
}

const temporadaController = new TemporadaController(temporadaService);
module.exports = { TemporadaController, temporadaController };