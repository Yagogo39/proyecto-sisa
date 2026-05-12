const express = require('express');
const { temporadaController } = require('../controllers/temporada.controller');

const temporadaRouter = express.Router();

temporadaRouter.post('/', (req, res) => temporadaController.crear(req, res));
temporadaRouter.get('/', (req, res) => temporadaController.leer(req, res));
temporadaRouter.get('/activa', (req, res) => temporadaController.leerActiva(req, res));
temporadaRouter.get('/:id', (req, res) => temporadaController.leerPorId(req, res));
temporadaRouter.patch('/:id', (req, res) => temporadaController.actualizar(req, res));
temporadaRouter.patch('/:id/activar', (req, res) => temporadaController.activar(req, res));
temporadaRouter.delete('/:id', (req, res) => temporadaController.eliminar(req, res));

module.exports = temporadaRouter;