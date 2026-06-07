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
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }

  async cerrar(req, res) {
    try {
      const respuesta = await this.Service.cerrar(req.params.id, req.body);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }

  async consultarAbierta(req, res) {
    try {
      const respuesta = await this.Service.consultarAbierta();
      return res.json(respuesta);
    } catch (error) {
      
      if (error.statusCode === 404) {
        return res.json(null);
      }
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }

  async leer(req, res) {
    try {
      const respuesta = await this.Service.leer();
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }

  async leerPorId(req, res) {
    try {
      const respuesta = await this.Service.leerPorId(req.params.id);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }
}

const cajaController = new CajaController(cajaService);
module.exports = { CajaController, cajaController };