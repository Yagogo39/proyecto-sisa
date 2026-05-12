const { ventaService } = require('../services/venta.service');

class VentaController {
  constructor(service) {
    this.Service = service;
  }

  async registrar(req, res) {
    try {
      const respuesta = await this.Service.registrar(req.body);
      return res.status(201).json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }

  async leer(req, res) {
    try {
      const { fechaInicio, fechaFin, tipoVenta, idUsuario } = req.query;
      const lista = await this.Service.leer({ fechaInicio, fechaFin, tipoVenta, idUsuario });
      return res.json(lista);
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

  async totalDelDia(req, res) { 
    try {
      const respuesta = await this.Service.totalDelDia();
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      return res.status(codigo).json({ message: error.message || 'Error interno' });
    }
  }
}

const ventaController = new VentaController(ventaService);
module.exports = { VentaController, ventaController };