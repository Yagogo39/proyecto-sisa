const express = require('express');
const { proveedorController } = require('../controllers/proveedor.controller');

const proveedorRouter = express.Router();

proveedorRouter.post('/', (req, res) => proveedorController.crear(req, res));
proveedorRouter.get('/', (req, res) => proveedorController.leer(req, res));
proveedorRouter.get('/:id', (req, res) => proveedorController.leerPorId(req, res));
proveedorRouter.patch('/:id', (req, res) => proveedorController.actualizar(req, res));
proveedorRouter.delete('/:id', (req, res) => proveedorController.eliminar(req, res));

module.exports = proveedorRouter;