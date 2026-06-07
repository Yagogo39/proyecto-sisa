const express = require('express');
const { configuracionController } = require('../controllers/configuracion.controller');

const configuracionRouter = express.Router();

configuracionRouter.get('/tarifa-cyber', (req, res) => configuracionController.obtenerTarifaCyber(req, res));
configuracionRouter.patch('/tarifa-cyber', (req, res) => configuracionController.actualizarTarifaCyber(req, res));

module.exports = configuracionRouter;