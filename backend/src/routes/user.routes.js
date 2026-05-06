const express = require('express');
const { userController } = require('../controllers/user.controller');

const userRouter = express.Router();

userRouter.post('/registrarse', (req, res) => userController.register(req, res));
userRouter.post('/ingresar', (req, res) => userController.login(req, res));
userRouter.patch('/cambiar-contrasena', (req, res) => userController.cambiarContrasena(req, res));
userRouter.get('/', (req, res) => userController.leer(req, res));

module.exports = userRouter;
