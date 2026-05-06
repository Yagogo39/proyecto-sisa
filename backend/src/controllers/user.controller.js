const { userService } = require('../services/user.service');

class UserController {
  constructor(userService) {
    this.Service = userService;
  }

  async login(req, res) {
    try {
      const respuesta = await this.Service.iniciarSesion(req.body);
      return res.json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async register(req, res) {
    try {
      const respuesta = await this.Service.registrarse(req.body);
      return res.status(201).json(respuesta);
    } catch (error) {
      const codigo = error.statusCode || 500;
      const message = error.message || 'Error interno, consulta los logs del servidor';
      return res.status(codigo).json({ message });
    }
  }

  async cambiarContrasena(req, res) {
    try {
      const respuesta = await this.Service.cambiarContrasena(req.body);
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
}

const userController = new UserController(userService);
module.exports = { UserController, userController };    