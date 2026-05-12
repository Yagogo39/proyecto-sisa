const express = require('express');
const { cajaController } = require('../controllers/caja.controller');

const cajaRouter = express.Router();

cajaRouter.post('/abrir', (req, res) => cajaController.abrir(req, res));
cajaRouter.patch('/:id/cerrar', (req, res) => cajaController.cerrar(req, res));
cajaRouter.get('/abierta', (req, res) => cajaController.consultarAbierta(req, res));
cajaRouter.get('/', (req, res) => cajaController.leer(req, res));
cajaRouter.get('/:id', (req, res) => cajaController.leerPorId(req, res));

module.exports = cajaRouter;