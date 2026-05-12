const express = require('express');
const { categoriaController } = require('../controllers/categoria.controller');

const categoriaRouter = express.Router();

categoriaRouter.post('/', (req, res) => categoriaController.crear(req, res));
categoriaRouter.get('/', (req, res) => categoriaController.leer(req, res));
categoriaRouter.get('/:id', (req, res) => categoriaController.leerPorId(req, res));
categoriaRouter.patch('/:id', (req, res) => categoriaController.actualizar(req, res));
categoriaRouter.delete('/:id', (req, res) => categoriaController.eliminar(req, res));

module.exports = categoriaRouter;