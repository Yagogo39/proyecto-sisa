const express = require('express');
const { productoController } = require('../controllers/producto.controller');

const productoRouter = express.Router();

productoRouter.post('/', (req, res) => productoController.crear(req, res));
productoRouter.get('/', (req, res) => productoController.leer(req, res));
productoRouter.get('/alertas-stock', (req, res) => productoController.alertasStockBajo(req, res));
productoRouter.get('/:id', (req, res) => productoController.leerPorId(req, res));
productoRouter.patch('/:id', (req, res) => productoController.actualizar(req, res));
productoRouter.patch('/:id/stock', (req, res) => productoController.ajustarStock(req, res));
productoRouter.delete('/:id', (req, res) => productoController.eliminar(req, res));

module.exports = productoRouter;