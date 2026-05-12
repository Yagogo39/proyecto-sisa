const express = require('express');
const { incidenciaController } = require('../controllers/incidencia.controller');

const incidenciaRouter = express.Router();

incidenciaRouter.post('/', (req, res) => incidenciaController.reportar(req, res));
incidenciaRouter.get('/', (req, res) => incidenciaController.leer(req, res));
incidenciaRouter.get('/pendientes', (req, res) => incidenciaController.leerPendientes(req, res));
incidenciaRouter.get('/:id', (req, res) => incidenciaController.leerPorId(req, res));
incidenciaRouter.patch('/:id/resolver', (req, res) => incidenciaController.resolver(req, res));

module.exports = incidenciaRouter;