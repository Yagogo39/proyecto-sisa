const { cajaService } = require('../services/caja.service');

class CajaController {
  constructor(service) {
    this.Service = service;
  }

  async abrir(req, res) {
    try {
      const respuesta = await this.Service.abrir(req.body);
      return res.status(201).json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async cerrar(req, res) {
    try {
      const respuesta = await this.Service.cerrar(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async consultarAbierta(req, res) {
    try {
      const respuesta = await this.Service.consultarAbierta();
      return res.json(respuesta);
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
}

const cajaController = new CajaController(cajaService);
module.exports = { CajaController, cajaController };