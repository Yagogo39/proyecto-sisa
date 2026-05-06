const jwt = require('jsonwebtoken');
const { userRepository } = require('../repositories/user.repository');
const { hashearContrasena, verificarContrasena } = require('../utils/hashPassword');
const { BadRequestError } = require('../utils/errors/BadRequestError');
const { UnauthorizedError } = require('../utils/errors/UnauthorizedError');
const { ForbiddenError } = require('../utils/errors/ForbiddenError');
const { NotFoundError } = require('../utils/errors/NotFoundError');

const JWT_SECRET = 'sis-a-papeleria-don-max-2026';
const JWT_EXPIRES_IN = '8h';

class UserService {
  constructor(userRepo) {
    this.Repo = userRepo;
  }

  async iniciarSesion({ nombreUsuario, contrasena, rol }) {
    if (!nombreUsuario || !contrasena || !rol) {
      throw new BadRequestError('Datos incompletos');
    }

    const usuario = await this.Repo.findByNombreUsuario(nombreUsuario);
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (usuario.estado !== 'activo') {
      throw new ForbiddenError('La cuenta está inactiva');
    }

    const passwordCorrecto = await verificarContrasena(contrasena, usuario.contrasena);
    if (!passwordCorrecto) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (usuario.rol.toLowerCase() !== rol.toLowerCase()) {
      throw new ForbiddenError('El rol seleccionado no corresponde al usuario');
    }

    // Se genera el token con datos del usuario; expira en 8h (un turno laboral)
    const token = jwt.sign(
      { idUsuario: usuario.idUsuario, nombreUsuario: usuario.nombreUsuario, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      usuario: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol
      }
    };
  }

  async registrarse({ nombre, apellido, nombreUsuario, contrasena, idRol }) {
    if (!nombre || !apellido || !nombreUsuario || !contrasena || !idRol) {
      throw new BadRequestError('Datos incompletos');
    }

    // Regla de seguridad de la contraseña
    // Debe tener mínimo 8 caracteres con al menos: una minúscula, una mayúscula, un número y un carácter especial

    const reglaSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!reglaSegura.test(contrasena)) {
      throw new BadRequestError(
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales'
      );
    }

    const existente = await this.Repo.findByNombreUsuario(nombreUsuario);
    if (existente) {
      throw new BadRequestError('El nombre de usuario ya está registrado');
    }

    const hash = await hashearContrasena(contrasena);
    const nuevoUsuario = await this.Repo.create({
      nombre, apellido, nombreUsuario, contrasena: hash, idRol
    });

    return {
      idUsuario: nuevoUsuario.idUsuario,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      nombreUsuario: nuevoUsuario.nombreUsuario,
      idRol: nuevoUsuario.idRol
    };
  }

  async cambiarContrasena({ nombreUsuario, nuevaContrasena, confirmarContrasena }) {
    if (!nombreUsuario || !nuevaContrasena || !confirmarContrasena) {
      throw new BadRequestError('Datos incompletos');
    }

    if (nuevaContrasena !== confirmarContrasena) {
      throw new BadRequestError('Las contraseñas no coinciden');
    }

    const reglaSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!reglaSegura.test(nuevaContrasena)) {
      throw new BadRequestError(
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales'
      );
    }

    const usuario = await this.Repo.findByNombreUsuario(nombreUsuario);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const nuevoHash = await hashearContrasena(nuevaContrasena);
    await this.Repo.updateContrasena(usuario.idUsuario, nuevoHash);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async leer() {
    return await this.Repo.find();
  }
}

const userService = new UserService(userRepository);
module.exports = { UserService, userService };