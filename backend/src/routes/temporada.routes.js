const express = require('express');
const router = express.Router();
const temporadaController = require('../controllers/temporada.controller');

router.get('/', temporadaController.getTemporada);
router.post('/', temporadaController.addTemporada);

module.exports = router;
