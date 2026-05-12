const express = require('express');
const { ventaController } = require('../controllers/venta.controller');

const ventaRouter = express.Router();

ventaRouter.post('/', (req, res) => ventaController.registrar(req, res));
ventaRouter.get('/', (req, res) => ventaController.leer(req, res));
ventaRouter.get('/total-dia', (req, res) => ventaController.totalDelDia(req, res));
ventaRouter.get('/:id', (req, res) => ventaController.leerPorId(req, res));

module.exports = ventaRouter;