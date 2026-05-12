const express = require('express');
const { equipoController } = require('../controllers/equipo.controller');

const equipoRouter = express.Router();

equipoRouter.post('/', (req, res) => equipoController.agregar(req, res));
equipoRouter.get('/', (req, res) => equipoController.leer(req, res));
equipoRouter.post('/:id/iniciar', (req, res) => equipoController.iniciarSesion(req, res));
equipoRouter.post('/:id/finalizar', (req, res) => equipoController.finalizarSesion(req, res));
equipoRouter.patch('/:id/estado', (req, res) => equipoController.cambiarEstado(req, res));
equipoRouter.delete('/:id', (req, res) => equipoController.eliminar(req, res));

module.exports = equipoRouter;