const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');

router.get('/', categoriaController.getCategorias);
router.post('/', categoriaController.addCategoria);

module.exports = router;
